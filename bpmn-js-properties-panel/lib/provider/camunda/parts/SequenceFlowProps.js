'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is,
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  domQuery = require('min-dom/lib/query'),
  cmdHelper = require('../../../helper/CmdHelper'),
  elementHelper = require('../../../helper/ElementHelper'),

  script = require('./implementation/Script')('language', 'body', true);


module.exports = function(group, element, bpmnFactory) {
  var bo;

  if (is(element, 'bpmn:SequenceFlow')) {
    bo = getBusinessObject(element);
  }

  if (!bo) {
    return;
  }

  group.entries.push({
    id: 'condition',
    description: 'Configure the implementation of the task.',
    label: 'Condition',
    html: '<div class="pp-row">' +
              '<label for="cam-condition-type">Condition Type</label>' +
              '<div class="pp-field-wrapper">' +
                '<select id="cam-condition-type" name="conditionType" data-value>' +
                  '<option value="expression" selected>Expression</option>' +
                  '<option value="script">Script</option>' +
                  '<option value="" ></option>' +
                '</select>' +
              '</div>' +
            '</div>' +

            // expression
            '<div class="pp-row">' +
              '<label for="cam-condition" >Expression</label>' +
              '<div class="pp-field-wrapper" >' +
                '<input id="cam-condition" type="text" name="condition" />' +
                '<button class="clear" data-action="clear" data-show="canClear">' +
                  '<span>X</span>' +
                '</button>' +
              '</div>' +
              '<div data-show="isScript">' +
                script.template +
              '</div>' +
            '</div>',

    get: function (element, propertyName) {

      // read values from xml:
      var conditionExpression = bo.conditionExpression;

      var values = {},
        conditionType = '';

      if(conditionExpression) {
        var conditionLanguage = conditionExpression.language;
        if(typeof conditionLanguage !== 'undefined') {
          conditionType = 'script';
          values = script.get(element, conditionExpression);
        }
        else {
          conditionType = 'expression';
          values.condition = bo.expression;
          ;
        }
      }

      values.conditionType = conditionType;

      return values;

    },

    set: function (element, values, containerElement) {
      var conditionType = values.conditionType;

      var conditionProps = {
        body: undefined
      };

      if(conditionType === 'script') {
        conditionProps = script.set(element, values, containerElement);
      }
      else {
        var condition = values.condition;
        conditionProps.body = condition;
      }

      var update = {
        "conditionExpression": undefined
      };

      if (conditionType) {
        update.conditionExpression = elementHelper.createElement
          (
            'bpmn:FormalExpression',
            conditionProps,
            bo,
            bpmnFactory
          );
      }

      return cmdHelper.updateBusinessObject(element, bo, update);
    },

    validate: function(element, values) {
      var validationResult = {};

      if(!values.condition && values.conditionType === 'expression') {
        validationResult.condition = "Must provide a value";
      }
      else if(values.conditionType === 'script') {
        validationResult = script.validate(element, values);
      }

      return validationResult;
    },

    isExpression: function(element, inputNode) {
      var conditionType = domQuery('select[name=conditionType]', inputNode);
      if(conditionType.selectedIndex >= 0) {
        return conditionType.options[conditionType.selectedIndex].value === 'expression';
      }
    },

    isScript: function(element, inputNode) {
      var conditionType = domQuery('select[name=conditionType]', inputNode);
      if(conditionType.selectedIndex >= 0) {
        return conditionType.options[conditionType.selectedIndex].value === 'script';
      }
    },

    clear: function(element, inputNode) {
      // clear text input
      domQuery('input[name=condition]', inputNode).value='';

      return true;
    },

    canClear: function(element, inputNode) {
      var input = domQuery('input[name=condition]', inputNode);

      return input.value !== '';
    },

    script : script,

    cssClasses: [ 'pp-textfield' ]
  });
};
