var $ = require("jquery");
var Context = require("./context");




var d3 = require("d3"),
    userTaskResolver = require("./userTaskResolver"),
    taskResolver = require("./taskResolver");

function WF() {
    this.context = new Context();
    this.currentProcess = null;
}

WF.prototype.processXML = function(resp, done) {
    var moddle;
    var context = this.context;
    var wf = this;
    bpmnModeler.moddle.fromXML(resp[0].xml, function(err, mod) {
        var pw = new ProcessWalker(mod);
        pw.init();
        var sus = null
        if (context.moddles[resp[0].flowName] && context.moddles[resp[0].flowName].suspendedStep) {
            sus = context.moddles[resp[0].flowName].suspendedStep
        }
        context.moddles[resp[0].flowName] = pw;
        context.moddles[resp[0].flowName].suspendedStep = sus;
        if (done) {
            done.call();
        }
    })


}

WF.prototype.start = function() {
    var fs = this.context.flowStack;
    var last = fs[fs.length - 1];
    var flow = this.context.moddles[last];
    this.currentProcess = flow;
    var start = flow.getStart();
    this.doStep(start);
}

WF.prototype.resume = function() {
    var fs = this.context.flowStack;
    var last = fs[fs.length - 1];
    if (last == undefined) {
      console.log(this.context)
        return;
    }
    var flow = this.context.moddles[last];
    var suspended = flow.suspendedStep;
    flow.suspendedStep = null;
    wf.doOutgoing(suspended);

}

WF.prototype.doStep = function(node) {
    var fs = this.context.flowStack;
    var last = fs[fs.length - 1];
    this.context.log.push(`${last}__${node.id}`);
    var shape = d3.selectAll("[data-element-id=" + node.id + "] > .djs-visual").selectAll("rect,path,circle,polygon,polyline").attr("stroke", "#388E3C");
    switch (node.$type) {
        case "bpmn:ExclusiveGateway":
            this.doXOR(node);
            break;
        case "bpmn:IntermediateThrowEvent":
            this.doThrow(node);
            break;
        case "bpmn:EndEvent":
            console.log(`Flow ${last} is ending`);
            this.context.flowStack.pop();
            this.resume();
            break;
        case "bpmn:UserTask":
            this.doUserTask(node);
            break;
        case "bpmn:SelectorTask":
            this.doSelectorTask(node);
            break;
        case "bpmn:ScriptTask":
            this.doScript(node);
            break;
        case "bpmn:SubProcess":
            this.doSubflow(node);
            break;
        case "bpmn:StartEvent":
        case "bpmn:IntermediateCatchEvent":
            this.doOutgoing(node);
            break;
        default:
            this.doSequenceFlow(node);
            break;
    }

}

WF.prototype.doOutgoing = function(node) {
  var passed = this;
  setTimeout(function(){
    passed.doStep(node.outgoing[0])
  },0)
    // this.doStep(node.outgoing[0]);
}

WF.prototype.doSequenceFlow = function(node) {
    this.doStep(node.targetRef);
}

WF.prototype.doThrow = function(node) {
	if (node.eventDefinitions[0].$type == "bpmn:SignalEventDefinition"){
		return this.doProcessTransfer(node.eventDefinitions[0].signalRef.name)
	}
  var fs = this.context.flowStack;
  var last = fs[fs.length - 1];
    var signal = node.eventDefinitions[0].name;
    this.doStep(this.context.moddles[last].signals[signal]);
}

WF.prototype.doScript = function(node) {
  var script;
    if (node.scriptFormat=="juel"){
      script = this.context.parseJuel(node.script);
    }else {
      script = node.script;
    }
    this.context.setVariable(node.resultVariable, script);
    this.doOutgoing(node);
}

WF.prototype.doExpressionXOR = function exor(node){
  var context = this.context;
  var result = node.juel ? context.parseJuel(node.expression) :context.parseExpression(node.expression);
  if (typeof result=="boolean"){
    result = result.toString();
  }
  var path;
  node.outgoing.forEach(function (elem){
    if (elem.name==result){
      path = elem
    }
  })
  this.doStep(path);
}

WF.prototype.doXOR = function(node) {
    if (node.expression!=undefined && node.expression.length > 0){
      return this.doExpressionXOR(node);
    }
    var context = this.context;
    var juel = node.juel;
    var wf = this;
    var triggered;
    var sorted = node.outgoing.sort(function (a, b) {
  if (a.order > b.order) {
    return 1;
  }
  if (a.order < b.order) {
    return -1;
  }
  // a must be equal to b
  return 0;
});
    sorted.forEach(function(elem) {
        var exp = juel ? context.parseJuel(elem.expression) : context.parseExpression(elem.expression);
        if (exp == true && triggered == undefined) {
            triggered = elem;
        }
    })
    this.doStep(triggered == undefined ? node.default : triggered);
}

WF.prototype.doUserTask = function(node) {
    var context = this.context;
    var html = this.context.parseHTML(node.html);
    var css = this.context.compileCSS(node.css);
    var js = this.context.parseJS(node.js);
    var page = `<form>${html}</form><style>${css}</style><script>${js}</script>`;
    $("#renderedPage").html(page).parent().show();
    this.currentProcess.currentStep = node;
}

WF.prototype.doUserTask = function(node) {
    var context = this.context;
    var html = this.context.parseHTML(node.html);
    var css = this.context.compileCSS(node.css);
    var js = this.context.parseJS(node.js);
    var page = `<form>${html}</form><style>${css}</style><script>${js}</script>`;
    $("#renderedPage").html(page).parent().show();
    this.currentProcess.currentStep = node;
}

WF.prototype.doContinue = function(form) {
    var c = this.context;
    form.forEach(function(elem) {
        c.setFormVariable(elem.name, elem.value)
    })
    var step = this.currentProcess.currentStep;
    wf.doOutgoing(step);
}

WF.prototype.doSubflow = function(node) {
    var fs = this.context.flowStack;
    var last = fs[fs.length - 1];
    this.context.moddles[last].suspendedStep = node;
    if (this.context.moddles[node.flowId]) {
			console.log("skipped");
        wf.context.flowStack.push(node.flowId)
        wf.start();
    } else {
      console.log(node.flowId,node)
        $.getJSON("http://localhost:8080/flow", {
            flowName: node.flowId
        }, function(resp) {
          console.log(resp);
            wf.processXML(resp, function() {
                wf.context.flowStack.push(node.flowId)
                wf.start();
            })
        })
    }

}

WF.prototype.doProcessTransfer = function (flowName){
  bus.fire("subflow.view",flowName)
	if (this.context.moddles[flowName]) {
		console.log("skipped");
		wf.context.flowStack = [flowName];
			wf.start();
	} else {
			$.getJSON("http://localhost:8080/flow", {
					flowName: flowName
			}, function(resp) {
					wf.processXML(resp, function() {
							wf.context.flowStack = [flowName];
							wf.start();
					})
			})
	}
}


module.exports = WF;

$("#js-execute-diagram").click(function(e) {
    if (!wf) {
        wf = new WF();
    }else {
			wf.context.flowStack = [];
			wf.context.execution = {};
		}
    if (isBranch) {
        $.getJSON("http://localhost:8080/branch", {
            flowName: bpmnModeler.get("canvas").getRootElement().id,
            user: user
        }, function(resp) {
            wf.processXML(resp, function() {
                wf.context.flowStack.push(bpmnModeler.get("canvas").getRootElement().id)
                wf.start();
            })
        })
    } else {
        $.getJSON("http://localhost:8080/flow", {
            flowName: bpmnModeler.get("canvas").getRootElement().id
        }, function(resp) {
            wf.processXML(resp, function() {
                wf.context.flowStack.push(bpmnModeler.get("canvas").getRootElement().id)
                wf.start();
            })
        })
    }

})

$("#continue").click(function(e) {
    var f = $("form").serializeArray();
    $("#renderedPage").parent().hide();
    wf.doContinue(f);
})

function l(m) {
    console.log(m);
}
