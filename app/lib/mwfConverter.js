
module.exports = function() {
    $.getJSON("http://localhost:8080/processMap", {}, function(resp) {
        var processMap = resp
        var newNodes = {};
        var sequences = {};
        var reverseMap = {};
        var signals = [];
        var start = null;
        var newToOldConnections = {};
        var modeling = bpmnModeler.get("modeling");
        var backwards = {}
        flow.workflow_contents.childShapes.forEach(function(elem) {
            backwards[elem.resourceId] = elem
        })
        flow.workflow_contents.childShapes.forEach(function(e) {
            reverseMap[e.resourceId] = e;
            try {
                if (/motv-so.*$/.test(e.stencil.id)) {
                    var formatted = "motv-so";
                    console.log(e);
                } else {
                    var formatted = e.stencil.id;
                }
            } catch (error) {
                console.log(e);

                var formatted = "SequenceFlow";
            }
            try {
                switch (formatted) {
                    case "StartEvent":
                        start = e;
                        var ns = "bpmn:StartEvent";
                        break;
                    case "EndEvent":
                        start = e;
                        var ns = "bpmn:EndEvent";
                        break;
                    case "script":
                        var ns = "bpmn:ScriptTask";
                        try {
                            var temp = cli.create(ns, e.bounds.upperLeft.x + "," + e.bounds.upperLeft.y, flowName);
                            elementRegistry.updateId(temp, e.resourceId)
                                // var newElement = elementRegistry.get(temp)
                            var modeling = bpmnModeler.get("modeling")
                            newNodes[e.resourceId] = e.resourceId;
                            newToOldConnections[e.resourceId] = e.outgoing;
                            try {
                                cli.setLabel(e.resourceId, e.properties.name)
                                var element = elementRegistry.get(e.resourceId)
                                var script = e.properties.text
                                element.height = 40
                                element.businessObject.resultVariable = e.properties.var
                                element.businessObject.scriptFormat = e.properties.lang
                                element.businessObject.script = script;
                            } catch (err) {
                                console.log(err)
                            }

                        } catch (err) {
                            console.log(ns);
                            console.error(err);
                        }
                        break;
                    case "Exclusive (XOR) Gateway":
                    case "Exclusive_Databased_Gateway":
                        var ns = "bpmn:ExclusiveGateway";
                        try {
                            var temp = cli.create(ns, e.bounds.upperLeft.x + "," + e.bounds.upperLeft.y, flowName);
                            // var newElement = elementRegistry.get(temp)
                            // console.log(e)
                            elementRegistry.updateId(temp, e.resourceId)
                            newNodes[e.resourceId] = e.resourceId;
                            newToOldConnections[e.resourceId] = e.outgoing;
                            try {
                                var element = elementRegistry.get(e.resourceId)
                                var modeling = bpmnModeler.get("modeling")

                                var moddle = bpmnModeler.get("moddle")
                                var signalCfg =  e.properties.signalcfg
                                if (signalCfg==null||signalCfg==""){
                                  var expr =  e.properties.expr
                                  modeling.updateProperties(element, {
                                      expression: expr,
                                      juel:true
                                  })
                                }else {
                                  modeling.updateProperties(element, {
                                      signalCfg: signalCfg,
                                      juel:true
                                  })
                                  var cfg = JSON.parse(signalCfg);
                                  cfg.source = e.resourceId;
                                  signals.push(cfg);
                                }

                                ns = ""
                            } catch (err) {
                                console.log(err)
                            }

                        } catch (err) {
                            console.log(ns);
                            console.error(err);
                        }
                        break;
                    case "goto-reference":
                        var ns = "bpmn:IntermediateThrowEvent";
                        try {
                            var temp = cli.create(ns, e.bounds.upperLeft.x + "," + e.bounds.upperLeft.y, flowName);
                            // var newElement = elementRegistry.get(temp)
                            // console.log(e)
                            elementRegistry.updateId(temp, e.resourceId)
                            newNodes[e.resourceId] = e.resourceId;
                            newToOldConnections[e.resourceId] = e.outgoing;
                            try {
                                cli.setLabel(e.resourceId, backwards[e.properties.target].properties.name)
                                var element = elementRegistry.get(e.resourceId)
                                var modeling = bpmnModeler.get("modeling")
                                    // element.eventDefinitionType = "bpmn:LinkEventDefinition"
                                var moddle = bpmnModeler.get("moddle")
                                var link = moddle.create("bpmn:LinkEventDefinition", {
                                        // source:temp,
                                        name: backwards[e.properties.target].properties.name
                                    })
                                    // link.$parent = elementRegistry.get(flowName)

                                modeling.updateProperties(element, {
                                    eventDefinitions: [link]
                                })
                                ns = ""
                            } catch (err) {
                                console.log(err)
                            }

                        } catch (err) {
                            console.log(ns);
                            console.error(err);
                        }
                        break;
                    case "reference":
                        var ns = "bpmn:IntermediateCatchEvent";
                        try {
                            var temp = cli.create(ns, e.bounds.upperLeft.x + "," + e.bounds.upperLeft.y, flowName);

                            elementRegistry.updateId(temp, e.resourceId)
                            newNodes[e.resourceId] = e.resourceId;
                            newToOldConnections[e.resourceId] = e.outgoing;
                            try {
                                cli.setLabel(e.resourceId, e.properties.name)
                                var element = elementRegistry.get(e.resourceId)
                                var modeling = bpmnModeler.get("modeling")
                                    // element.eventDefinitionType = "bpmn:LinkEventDefinition"
                                var moddle = bpmnModeler.get("moddle")
                                var link = moddle.create("bpmn:LinkEventDefinition", {
                                        name: e.properties.name
                                    })
                                    // link.$parent = elementRegistry.get(flowName)

                                modeling.updateProperties(element, {
                                    eventDefinitions: [link]
                                })
                            } catch (err) {
                                console.log(err)
                            }

                        } catch (err) {
                            console.log(ns);
                            console.error(err);
                        }
                        break;
                    case "Process Transfer":
                    case "subproc-transfer":
                        var ns = "bpmn:IntermediateThrowEvent";
                        try {
                          var elementFactory = bpmnModeler.get('elementFactory'),
                          bpmnFactory = bpmnModeler.get('bpmnFactory');
                            var temp = cli.create(ns, e.bounds.upperLeft.x + "," + e.bounds.upperLeft.y, flowName);
                            // var newElement = elementRegistry.get(temp)
                            // console.log(e)
                            elementRegistry.updateId(temp, e.resourceId)
                            newNodes[e.resourceId] = e.resourceId;
                            newToOldConnections[e.resourceId] = e.outgoing;
                            try {
                                cli.setLabel(e.resourceId, processMap[e.properties.processid])
                                var element = elementRegistry.get(e.resourceId)
                                var modeling = bpmnModeler.get("modeling")
                                    // element.eventDefinitionType = "bpmn:LinkEventDefinition"
                                var moddle = bpmnModeler.get("moddle")
                                var signal = bpmnFactory.create('bpmn:Signal',{
                                  name:processMap[e.properties.processid],

                                })
                                var rootElement = bpmnModeler.get('canvas').getRootElement().businessObject.$parent.rootElements;
                                signal.$parent = rootElement;
                                var signalEventDefinition = bpmnFactory.create('bpmn:SignalEventDefinition',{
                                rootElements:[signal]
                                });


                                // link.$parent = elementRegistry.get(flowName)

                                modeling.updateProperties(element, {
                                    eventDefinitions: [signalEventDefinition]
                                })
                                ns = ""
                            } catch (err) {
                                console.log(err)
                            }

                        } catch (err) {
                            console.log(ns);
                            console.error(err);
                        }
                        break;
                    case "motv-wizard-selector":
                        var ns = "";
                        try {
                            var temp = cli.create("bpmn:SelectorTask", e.bounds.upperLeft.x + "," + (e.bounds.upperLeft.y+30), flowName);
                            elementRegistry.updateId(temp, e.resourceId)
                            newNodes[e.resourceId] = e.resourceId;
                            newToOldConnections[e.resourceId] = e.outgoing;
                            try {
                                cli.setLabel(e.resourceId, e.properties.displayname)
                                var modeling = bpmnModeler.get("modeling");
                                bpmnFactory = bpmnModeler.get('bpmnFactory');
                                var element = elementRegistry.get(e.resourceId)
                                var displaySplit = e.properties.displaylist.split(",");
                                var inputSplit = e.properties.inputlist.split(",");
                                var resultVariable = e.properties.selectedvar;
                                var selector = "<div style='display:flex;flex-direction:column;align-content:center;'>";
                                for (var i=0;i<displaySplit.length;i++){
                                  selector += `
                                  <div class="form-group">
                                  <div class="radio" style="flex:1;width: 50%;">
                                    <label>
                                      <input type="radio" name="${resultVariable}" id="selector-${i}" value="${inputSplit[i]}" checked="">
                                      ${displaySplit[i]}
                                    </label>
                                  </div>
                                  </div>
                                  `
                                }
                                selector += "</div>"
                                var text = e.properties.header + e.properties.text + e.properties.footer
                                element.businessObject.html = text;
                                element.businessObject.resultVariable = resultVariable;
                                var ns="";
                                var modeling = bpmnModeler.get("modeling")
                                    // element.eventDefinitionType = "bpmn:LinkEventDefinition"
                                var moddle = bpmnModeler.get("moddle")
                                var props = bpmnFactory.create('camunda:Properties',{
                                  values:[]

                                });
                                for (var i=0;i<displaySplit.length;i++){
                                  var prop = bpmnFactory.create('camunda:Property',{
                                    name:displaySplit[i],
                                    value:inputSplit[i]

                                  })
                                  props.values.push(prop)
                                }
                                var ext = bpmnFactory.create('bpmn:ExtensionElements',{
                                  values:[props]

                                })


                                // link.$parent = elementRegistry.get(flowName)

                                element.businessObject.extensionElements = ext;
                            } catch (err) {
                                console.log(err)
                            }

                        } catch (err) {
                            console.log(ns);
                            console.error(err);
                        }
                        break;
                    case "motv-wizard-question":
                    case "motv-wizard-information":
                        var ns = "bpmn:UserTask";
                        try {
                            var temp = cli.create(ns, e.bounds.upperLeft.x + "," + (e.bounds.upperLeft.y+25), flowName);
                            elementRegistry.updateId(temp, e.resourceId)
                            var newElement = elementRegistry.get(e.resourceId)
                            var modeling = bpmnModeler.get("modeling")
                            var element = elementRegistry.get(e.resourceId)
                                // modeling.updateProperties(element,{
                                //   id:e.resourceId
                                // })
                            newNodes[e.resourceId] = e.resourceId;
                            newToOldConnections[e.resourceId] = e.outgoing;
                            if (ns != "bpmn:ExclusiveGateway") {
                                try {
                                    cli.setLabel(e.resourceId, e.properties.name)
                                } catch (err) {

                                }
                            }


                        } catch (err) {
                            console.log(ns);
                            console.error(err);
                        }
                        var ns=""
                        break
                    case "motv-wizard-form":
                        var ns = "bpmn:UserTask";
                        try {
                            var temp = cli.create(ns, e.bounds.upperLeft.x + "," + (e.bounds.upperLeft.y+20), flowName);
                            // var newElement = elementRegistry.get(temp)
                            elementRegistry.updateId(temp, e.resourceId)
                            newNodes[e.resourceId] = e.resourceId;
                            newToOldConnections[e.resourceId] = e.outgoing;
                            try {
                                cli.setLabel(e.resourceId, e.properties.name)
                                var modeling = bpmnModeler.get("modeling")
                                var element = elementRegistry.get(e.resourceId)
                                var text = e.properties.header + e.properties.text + e.properties.footer
                                    // modeling.updateProperties(element,{
                                    //   id:e.resourceId
                                    // })
                                    // console.log(element.businessObject);
                                element.businessObject.html = text;
                                var ns=""
                            } catch (err) {
                                console.log(err)
                            }

                        } catch (err) {
                            console.log(ns);
                            console.error(err);
                        }
                        break;
                    case "motv-wizard-wait":
                        var ns = "bpmn:ReceiveTask"
                        break;
                    case "motv-so":
                        var ns = "bpmn:SendTask";
                        break;
                    case "subflow":
                        var ns = "bpmn:SubProcess";
                        try {
                            var temp = cli.create(ns, e.bounds.upperLeft.x + "," + (e.bounds.upperLeft.y+25), flowName);
                            // var newElement = elementRegistry.get(temp)
                            elementRegistry.updateId(temp, e.resourceId)
                            newNodes[e.resourceId] = e.resourceId;
                            newToOldConnections[e.resourceId] = e.outgoing;
                            try {
                                cli.setLabel(e.resourceId, e.properties.name)
                                var modeling = bpmnModeler.get("modeling")
                                var element = elementRegistry.get(e.resourceId)
                                element.businessObject.flowId = processMap[e.properties.processid]
                            } catch (err) {
                                console.log(err)
                            }

                        } catch (err) {
                            console.log(ns);
                            console.error(err);
                        }
                        break;
                    case "Association_Undirected":
                        var ns = "";
                        break;
                    case "SequenceFlow":
                        sequences[e.resourceId] = e;
                        var ns = "";
                        break;
                    default:
                        var ns = "";
                        break;

                }
                if (ns != "" && ns != "bpmn:ScriptTask" && ns != "bpmn:SubProcess" && ns != "bpmn:IntermediateCatchEvent") {
                    try {
                        var temp = cli.create(ns, e.bounds.upperLeft.x + "," + e.bounds.upperLeft.y, flowName);
                        elementRegistry.updateId(temp, e.resourceId)
                        var newElement = elementRegistry.get(e.resourceId)
                        var modeling = bpmnModeler.get("modeling")
                        var element = elementRegistry.get(e.resourceId)
                            // modeling.updateProperties(element,{
                            //   id:e.resourceId
                            // })
                        newNodes[e.resourceId] = e.resourceId;
                        newToOldConnections[e.resourceId] = e.outgoing;
                        if (ns != "bpmn:ExclusiveGateway") {
                            try {
                                cli.setLabel(e.resourceId, e.properties.name)
                            } catch (err) {

                            }
                        }


                    } catch (err) {
                        console.log(ns);
                        console.error(err);
                    }
                }

            } catch (err) {}


        })
        for (var old in newToOldConnections) {
            var newNode = old;
            var neededConnections = newToOldConnections[old];
            neededConnections.forEach(function(oldId, idx) {
                // console.log(sequences[oldId.resourceId])
                try {
                    var temp = cli.connect(newNode, newNodes[sequences[oldId.resourceId].target.resourceId], "bpmn:SequenceFlow")
                    try {
                        cli.setLabel(temp, sequences[oldId.resourceId].properties.conditionexpression)
                    } catch (e) {
                        console.log(e)
                    }
                    try {
                        elementRegistry.updateId(temp, oldId.resourceId)
                        var waypointCount = sequences[oldId.resourceId].dockers.length;
                        if (waypointCount > 2){
                          var source = elementRegistry.get(oldId.resourceId).source;
                          var cx = source.x+source.width/2.0;
                          var cy = source.y+source.height/2.0;

                          var target = elementRegistry.get(oldId.resourceId).target;
                          var tx = target.x+target.width/2.0;;
                          var ty = target.y +target.height/2.0;;
                          var element = elementRegistry.get(oldId.resourceId);
                          var waypoints = element.waypoints
                          var old = sequences[oldId.resourceId].dockers
                          // console.log(backwards[sequences[oldId.resourceId].target.resourceId],sequences[oldId.resourceId]);
                          // console.error(element);
                          var start = old[0]
                          if (source.type == "bpmn:UserTask"||source.type == "bpmn:SelectorTask"||source.type == "bpmn:SubProcess"){
                            start.y-=33;
                          }
                          // console.log(start);
                          var updated = []
                          var next = old[1];
                          var lowx = source.x;
                          var highx = source.x + source.width;
                          var lowy = source.y;
                          var highy = source.y + source.height;
                          var diffx = Math.abs(next.x - cx)
                          var diffy = Math.abs(next.y - cy)
                          var nx;var ny;
                          if ( diffx > diffy){
                            nx = next.x > highx ? highx : lowx;
                            ny = cy;
                          }else{
                            nx = cx;
                            ny = next.y > highy ? highy : lowy
                          }



                          updated[0] = {original:{x:cx,y:cy},x:nx,y:ny}
                          // console.log(updated)
                          for (var j = 1;j<old.length-1;j++){
                            updated[j] = {x:old[j].x-start.x ,
                                      y:old[j].y-start.y
                                    }
                          }
                          var prev = old[old.length - 2];
                          var lowx = target.x;
                          var highx = target.x + target.width;
                          var lowy = target.y;
                          var highy = target.y + target.height;
                          diffx = Math.abs(tx-prev.x)
                          diffy = Math.abs(ty-prev.y)
                          var nx;var ny;
                          if ( diffx > diffy){
                            nx = prev.x > highx ? highx : lowx;
                            ny = ty;
                          }else{
                            nx = tx;
                            ny = next.y > highy ? highy : lowy;
                          }

                          updated[updated.length] = {original:{x:tx,y:ty},x:nx,y:ny};


                          var modeling = bpmnModeler.get("modeling")
                          modeling.updateWaypoints(element,updated)
                        }
                    } catch (err) {
                        console.log(err)
                    }
                } catch (err) {
                    console.log(err);
                }

            })

        }
        var elemId = cli.create("bpmn:TextAnnotation", "10,10", flowName);
        var element = elementRegistry.get(elemId);
        element.width = 300;
        console.log(element);
        modeling.updateProperties(element, {
            text: flowName
        })
        var signal;
        signals.forEach(function sigs(elem){
          var xor = elementRegistry.get(elem.source);
          console.log(xor);
          elem.signals.forEach(function single(sig){
            signal = elementRegistry.get(sig.id);
            signal.businessObject.expression = sig.expression;
            signal.businessObject.order = sig.order;
            if ( sig.default=="true"||sig.default==true){
              var xor = elementRegistry.get(elem.source);
              xor.businessObject.default = signal;
            }
          })
        })
    })


}
