'use strict';

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
    is = require('bpmn-js/lib/util/ModelUtil').is,
    entryFactory = require('../../../factory/EntryFactory'),
		extensionElements = require("./implementation/ExtensionElements"),
    cmdHelper = require('../../../helper/CmdHelper'),
		extHelper = require('../../../helper/ExtensionElementsHelper'),
    utils = require('../../../Utils'),
    script = require('./implementation/Script')('scriptFormat', 'script', false);
		var variables = require('./VariableMappingProps');
		var properties = require('./PropertiesProps');

function  isVarValid(bo, idValue) {

  return validateId(idValue);
}



function validateVar(bo,value) {

  if (/^\w*\s+\w*$/.test(value)) {
    return 'Result variable must not contain spaces.';
  }

  if (/^\w*\W+\w*$/.test(value)) {
    return 'Result variable must not contain any special characters';
  }

}

module.exports = function(group, element, bpmnFactory) {

  if (is(element, 'bpmn:SelectorTask')) {
    group.entries.push(entryFactory.validationAwareTextField({
      id : 'resultVariable',
      description : 'Result Variable',
      label : 'Result Variable',
      modelProperty : 'resultVariable',
      getProperty: function(element) {
        var bo = getBusinessObject(element);
        return bo.resultVariable;
      },
      setProperty: function(element, properties) {
        return cmdHelper.updateProperties(element, properties);
      },
      validate: function(element, values) {
        var varName = values.resultVariable;

        var bo = getBusinessObject(element);
        var err = validateVar(bo,varName);

        return err ? { resultVariable: err } : {};
      }
    }));
		properties(group,element,bpmnFactory)

  }



};
