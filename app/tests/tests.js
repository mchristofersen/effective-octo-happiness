import 'babel-polyfill';
var assert = require('chai').assert;
var getFlow = require("../lib/es6/flowHandler.js").getFlow;
var getFlows = require("../lib/es6/flow.js").getThumbnails;

describe('flow', function() {
	describe("#getFlows", function (){
		it('should get  a flow', function() {
			var flows = getFlows();
			console.log(flows)
      assert.isNotNull(flow,"Should have returned")
    });

	})
})
describe('flowHandler', function() {
	describe("#getFlow", function (){
		it('should get  a flow', function() {
			var flow = getFlow("initialize");
			console.log(flow)
      assert.isNotNull(flow,"Should have returned")
    });

	})
})
