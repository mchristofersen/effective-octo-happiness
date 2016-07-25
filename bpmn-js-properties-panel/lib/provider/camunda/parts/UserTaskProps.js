'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is,
  entryFactory = require('../../../factory/EntryFactory');


module.exports = function(group, element) {
  if(is(element, 'bpmn:UserTask')||is(element, 'bpmn:SelectorTask')) {

    var entry = {}
    entry.id = element.id + "-content";
    entry.html = `<div id="camunda-content" class="btn btn-primary btn-raised">Open in Editor</div>`;
    group.entries.push(entry);
    group.entries.push(entryFactory.textArea({
      id : 'js',
      description : 'Assignee of the User Task',
      label : 'JS',
      modelProperty : 'js'
    }));

    if(is(element, 'bpmn:UserTask')||is(element, 'bpmn:SelectorTask')) {
    group.entries.push(entryFactory.textArea({
      id : 'html',
      description : "HTML",
      label : 'HTML',
      modelProperty : 'html'
    }));
    group.entries.push(entryFactory.textArea({
      id : 'css',
      description : 'Assignee of the User Task',
      label : 'CSS',
      modelProperty : 'css'
    }));
  }

  }
};
