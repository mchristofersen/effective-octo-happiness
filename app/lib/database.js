'use strict';
var {register} = require("babel-core");
var polyfill = require("babel-polyfill");
var $ = require("jquery");
var flowName = null;
var bo = require('../../bpmn-js/lib/util/ModelUtil').getBusinessObject;

function Database(bpmnModeler) {
    this.bpmnModeler = bpmnModeler;
    this.elementRegistry = bpmnModeler.elementRegistry;
    this.canvas = bpmnModeler.canvas;
    this.modeling = bpmnModeler.modeling;
    this.moddle = bpmnModeler.moddle;
}


module.exports.createNewDiagram = function(callback,flowName) {
  var name;
  if (!flowName){
    name = global.flowName;
  }else {
    name = flowName;
  }

    $("#flows").hide();
    var container = $('#js-drop-zone');
    $(".content").addClass("main")
    var modeling = bpmnModeler.get("modeling");
    var processElement = elementRegistry.get("Process_1");
    bus.fire("open.diagram",[])
    bpmnModeler.createDiagram(function(done) {
        // when
        var processElement = elementRegistry.get("Process_1");
        modeling.updateProperties(processElement, {
            id: name
        });
        container
            .removeClass('with-error')
            .addClass('with-diagram');
        bpmnModeler.saveXML({
            format: true
        }, function(err, xml) {
            bpmnModeler.saveSVG({
                format: true
            }, function(err, svg) {
                $.ajax({
                    url: "http://localhost:8080/flow",
                    method: "POST",
                    data: {
                        flowName: name,
                        xml: xml,
                        svg: svg
                    }
                }).done(function(resp) {
                  if (callback){
                    callback.call();
                    console.log("trying")
                  }
                    console.log(resp);
                })
            });
        })



    });

}



// bootstrap diagram functions
var processXML = function(resp) {
    var moddle;
		var inverted = {}
    bpmnModeler.moddle.fromXML(resp[0].xml, function done(err, mod) {
        WF.moddle = mod;
        var pw = new ProcessWalker(mod);
        pw.init();
        context.moddles.push(pw);
        $.each(WF.moddle.rootElements[0].flowElements, function(idx, elem) {
            if (Array.isArray(elem)) {
                $.each(elem, function(i, e) {
                    if (elem.$type == "bpmn:IntermediateCatchEvent") {
                      try {
                        inverted[e["eventDefinitions"][0]["signalRef"]["id"]] = e;
                      }catch (e){
                      }


                    } else {
                        inverted[e.id] = e;

                    }
                })


            } else if (elem.$type == "bpmn:StartEvent") {
                inverted["start"] = elem;
            } else if (elem.$type == "bpmn:IntermediateCatchEvent") {
							inverted[elem["eventDefinitions"][0]["signalRef"]["id"]] = elem;

            } else {
                inverted[elem.id] = elem;
            }
        })
    })
    inverted.$flowName = resp[0].flowName;

    return inverted
        // Access to attribute


}
module.exports.processXML = processXML;

module.exports.finalizeMerge = function(xml, flowName, user, diff, rightModeler) {
  var id = branches[flowName]["_id"]
    rightModeler.saveSVG({
        format: true
    }, function(err, svg) {
        $.ajax({
            url: "http://localhost:8080/merge",
            method: "post",
            data: {
                id: id,
                flowName: flowName,
                xml: xml,
                user: user,
                svg: svg,
                changes: JSON.stringify(diff)
            }
        }).done(function(resp) {
            isBranch = false;
            bus.fire("close.diagram",[])
        })
    });

}

module.exports.saveDiagram = function(done) {
    var conn = isBranch ? "http://localhost:8080/branch/update" : "http://localhost:8080/flow/update";
    var elementRegistry = bpmnModeler.get("elementRegistry")
    bpmnModeler.saveXML({
        format: true
    }, function(err, xml) {
        bpmnModeler.saveSVG({
            format: true
        }, function(err, svg) {
            $.ajax({
                    url: conn,
                    method: "post",
                    data: {
                        flowName: bpmnModeler.get("canvas").getRootElement().id,
                        xml: xml,
                        svg: svg,
                        user: user
                    }
                }).done(function(resp) {
                    wf.processXML([{
                        xml: xml,
                        flowName:bpmnModeler.get("canvas").getRootElement().id
                    }])
                })
                //  done(err, svg);
        });

        done(err, xml);
    });
}
