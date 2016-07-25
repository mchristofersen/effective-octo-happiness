var Moddle = require("../../bpmn-moddle");
var inherits = require('inherits');

function ProcessModdle(){
	Moddle.call(this);
}

inherits(ProcessModdle, Moddle);

module.exports = ProcessModdle;
