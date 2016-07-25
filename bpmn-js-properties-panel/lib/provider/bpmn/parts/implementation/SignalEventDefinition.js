'use strict';

var eventDefinitionReference = require('./EventDefinitionReference'),
    elementReferenceProperty = require('./ElementReferenceProperty');


module.exports = function(group, element, bpmnFactory, signalEventDefinition) {
  group.entries = group.entries.concat(eventDefinitionReference(element, signalEventDefinition, bpmnFactory, {
    label: 'Signal',
    description: 'Configure the signal element',
    elementName: 'signal',
    elementType: 'bpmn:Signal',
    referenceProperty: 'signalRef',
    newElementIdPrefix: 'Signal_'
  }));


  group.entries = group.entries.concat(elementReferenceProperty(element, signalEventDefinition, bpmnFactory, {
    id: 'signal-element-name',
    label: 'Signal Name',
    referenceProperty: 'signalRef',
    modelProperty: 'name'
  }));


};
