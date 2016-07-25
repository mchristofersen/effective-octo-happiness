'use strict';

var entryFactory = require('../../../factory/EntryFactory'),
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
    utils = require('../../../Utils'),
    cmdHelper = require('../../../helper/CmdHelper');

module.exports = function(group, element) {

  // Id

  var entry = {};
  entry.id = element.id+"-log";
  entry.html = '<div class="property-split" style="display:flex;"><div '+`onclick="console.log(elementRegistry.get('${element.id}'))"`+'>' +
  '<div class="pp-field-wrapper" ' +
    '>' +
    '<button class="btn btn-info btn-raised" id="camunda-' + element.id + '-label"  ' +
      ' >Log Element</button>' +
  '</div></div></div>';
  group.entries.push(entry);

  group.entries.push(entryFactory.validationAwareTextField({
    id: 'id',
    description: '',
    label: 'Id',
    modelProperty: 'id',
    getProperty: function(element) {
      return element.id;
    },
    setProperty: function(element, properties) {
      return cmdHelper.updateProperties(element, properties);
    },
    validate: function(element, values) {
      var idValue = values.id;

      var bo = getBusinessObject(element);

      var idError = utils.isIdValid(bo, idValue);

      return idError ? { id: idError } : {};
    }
  }));

};
