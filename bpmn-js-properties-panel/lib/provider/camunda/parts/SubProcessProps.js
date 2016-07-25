'use strict';

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
    is = require('bpmn-js/lib/util/ModelUtil').is,
    entryFactory = require('../../../factory/EntryFactory'),
    cmdHelper = require('../../../helper/CmdHelper');


module.exports = function(group, element, bpmnFactory) {
  var bo;

  // if (is(element,"bpmn:SubProcess")) {
  //   bo = getBusinessObject(element);
  // }
	//
  // if (!bo) {
  //   return;
  // }
	if (element.businessObject.eventDefinitions && (!element.eventDefinitionType || element.eventDefinitionType=="bpmn:SignalEventDefinition") && is(element,"bpmn:EndEvent")){
    var flowOpts = [{name:"NotSet",value:"NotSet"}]
    Object.keys(flows).each(function (idx,elem){
flowOpts.push({name:idx,value:idx});
})
		group.entries.push(entryFactory.textField({
	    id : 'flowId',
	    description : 'Raw Javascript',
	    label : 'Subflow',
	    modelProperty : 'flowId',
			selectOptions: flowOpts
    })
    )
}
	if (is(element,"bpmn:SubProcess")){
		group.entries.push(entryFactory.textField({
	    id : 'flowId',
	    description : 'Subflow',
	    label : 'Subflow',
	    modelProperty : 'flowId'
	  }));
	}



};
