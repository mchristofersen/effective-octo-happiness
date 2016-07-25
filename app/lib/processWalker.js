function ProcessWalker(process){
	this.process = process;
	this.registry = {};
	this.signals = {};
	this.currentStep = null;
}

module.exports = ProcessWalker;

ProcessWalker.prototype.init = function (){
	var registry = this.registry;
	var signals = this.signals;
	this.process.rootElements[0].flowElements.forEach(function (elem){
		registry[elem.id] = elem;
		if (elem.$type == "bpmn:IntermediateCatchEvent"){
			signals[elem.eventDefinitions[0].name] = elem;
		}
	})
}

ProcessWalker.prototype.getStart = function (){
	var start = false;
	this.process.rootElements[0].flowElements.forEach(function (elem){
		if (elem.$type=="bpmn:StartEvent"){
			start = elem
		}
	})
	return start;
}
