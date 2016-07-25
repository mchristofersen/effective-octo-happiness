'use strict';

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
    is = require('bpmn-js/lib/util/ModelUtil').is,
    entryFactory = require('../../../factory/EntryFactory'),
    cmdHelper = require('../../../helper/CmdHelper'),
    script = require('./implementation/Script')('scriptFormat', 'script', false);


module.exports = function(group, element, bpmnFactory) {
  var bo;

  if (is(element, 'bpmn:ExclusiveGateway')) {
    bo = getBusinessObject(element);
    group.entries.push(entryFactory.textArea({
      id : 'signalCfg',
      description : 'signalCfg',
      label : 'Signal Config',
      modelProperty : 'signalCfg'

    }));
  }




};
