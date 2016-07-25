'use strict';

var Model = require('../model');
var assign = require('lodash/object/assign'),
    inherits = require('inherits');

/**
 * A factory for diagram-js shapes
 */
function ElementFactory() {
  this._uid = 12;
}

module.exports = ElementFactory;


ElementFactory.prototype.createRoot = function(attrs) {
  return this.create('root', attrs);
};

ElementFactory.prototype.createLabel = function(attrs) {
  return this.create('label', attrs);
};

ElementFactory.prototype.createShape = function(attrs) {
  return this.create('shape', attrs);
};

ElementFactory.prototype.createConnection = function(attrs) {
  return this.create('connection', attrs);
};

/**
 * Create a model element with the given type and
 * a number of pre-set attributes.
 *
 * @param  {String} type
 * @param  {Object} attrs
 * @return {djs.model.Base} the newly created model instance
 */
ElementFactory.prototype.create = function(type, attrs) {

  attrs = attrs || {};

  if (!attrs.id) {
    attrs.id = type + '_' + (this._uid++);
  }
  if (attrs.type=="bpmn:ScriptTask") {
    assign(attrs, { width: 100, height: 35 });
      if (!attrs.businessObject) {
        attrs.businessObject = {
          type: type,
        };


      }
    }


  return Model.create(type, attrs);
};
