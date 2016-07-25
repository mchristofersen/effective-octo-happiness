var assert = require('chai').assert;
var Context = require("../app/lib/context");
var juel = require("../app/lib/juel");

describe('context', function() {
	describe("#setVariable", function (){
		var context = new Context();
		it('should set a simple variable', function() {
			context.setVariable("test","5");
      assert.equal(context.execution.test,"5" );
    });
		it('should deal with arithmetic on the variables', function() {
			context.setVariable("width",`test+25+'px'`);
      assert.equal(context.execution.width,"30px" );
    });
		it('should deal with dates better', function() {
			var temp = new Date();
			context.setVariable("date","new Date()");
      assert.equal(context.execution.date.getHours(),temp.getHours() );
    });
		it('should allow objects', function() {
			context.setVariable("obj",'{"passing":true}')
      assert.equal(context.execution.obj.passing,true );
    });
		it('should allow interpolation inside objects', function() {
			context.setVariable("nested",'{"width":width}')
      assert.equal(context.execution.nested.width,"30px" );
    });
    it('should allow nesting dates', function() {
			var temp = new Date();
			context.setVariable("nestedDate",'{"dict":nested,"theDate":new Date()}');
      assert.equal(context.execution.nestedDate.theDate.getHours(),temp.getHours() );
    });
    it('should allow nesting dates below the first level', function() {
			var temp = new Date();
			context.setVariable("nest",'{"dict":{"date":new Date(),"second":nestedDate.theDate.getHours()}}');
      assert.equal(context.execution.nest.dict.date.getHours(),temp.getHours() );
      assert.equal(context.execution.nest.dict.second,context.execution.nestedDate.theDate.getHours() );
    });
	})
});

describe("juel",function (){
  describe("scrub",function (){
    it('should get rid of not', function() {
			var scrubbed = juel.scrub(`#{(not empty OrgGroup &&
        (OrgGroup.matches("AM_12349889|AP_12345725|\
        AV_12349812|EV_ALTRIA|NS-ALTA") || \
        OrgGroup.matches("ND_IWRL|NSDMNGSVCS")))}`)
        console.log(scrubbed);
      assert.equal(scrubbed.includes("not"),false );
    });
  });
  describe("parseJuel",function (){
    var context = new Context();
    it('should get rid of not', function() {
			var scrubbed = context.parseJuel(`#{(not empty OrgGroup &&
        (OrgGroup.matches("AM_12349889|AP_12345725|\
        AV_12349812|EV_ALTRIA|NS-ALTA") || \
        OrgGroup.matches("ND_IWRL|NSDMNGSVCS")))}`)
        console.log(scrubbed);
      assert.equal(scrubbed.includes("not"),false );
    });
  })
})
