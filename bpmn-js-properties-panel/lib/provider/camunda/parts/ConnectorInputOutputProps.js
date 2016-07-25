'use strict';

var inputOutput = require('./implementation/InputOutput');

module.exports = function(group, element, bpmnFactory) {

  var inputOutputEntry = inputOutput(element, bpmnFactory, {
    idPrefix: 'connector-',
    insideConnector: true
  });

  group.entries = group.entries.concat(inputOutputEntry.entries);

  return {
    getSelectedParameter: inputOutputEntry.getSelectedParameter
  };

};
