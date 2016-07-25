var less = require('../../node_modules/less/index.js');
var randomstring = require("randomstring");
var juel = require("./juel");

function Context() {
    this.execution = {};
    this.log = [];
    this.flowStack = [];
    this.moddles = {};
    this.juelFunctions = {
      defaultIfEmpty:function (variable, def){
        if (typeof variable=="undefined"||variable==null||variable==""||variable=={}){
          return def
        }else {
          return variable
        }
      },
      isBlank:function (variable){
        return typeof variable=="undefined" || variable.length
      }
    }
}

Context.prototype = {
        initialize: function initialize() {
            var context = this;
            eval(`now = function now(){
              return new Date();
            }`)
            Object.keys(context.execution).forEach(elem => {
                if (elem == "" || elem == null || eval(`typeof ${elem}`) != "undefined") {
                  console.log(elem)
                    return;
                }

                try {
                    if (typeof context.execution[elem] == "string") {
                        eval(`${elem} = "context.execution[${elem}]";`);
                    } else if(typeof context.execution[elem] == "object") {
                        var temp = JSON.stringify(context.execution[elem])
                        eval(`${elem} = (${temp});`);

                    }else {
                        var temp = context.execution[elem]
                        eval(`${elem} = context.execution["${elem}"];`);

                    }
                } catch (e) {
                    console.log(e.message);
                }

            });

        },
        now : function now(){
          return new Date();
        },

        execute: function(expression) {
            return eval(expression);
        },
        newId: function() {
            var rand = randomstring.generate({
                length: 12,
                charset: 'alphabetic'
            });
            while (this.execution.hasOwnProperty(rand)) {
                rand = randomstring.generate({
                    length: 12,
                    charset: 'alphabetic'
                });
            }
            return rand;
        },
        setVariable: function initSet(name, expression) {
            var context = this;
            // context.initialize();

        try {
            // this.execution[name] = eval(`JSON.parse('${expression}')`);
            eval(`this.execution["${name}"] = (${expression})`);
            eval(`${name} = (${expression})`);
            if (typeof this.execution[name] == "object"){
              this.execution[name]._empty = function empty(){
                return Object.keys(this).length == 1;
              }
            }
            this.recursiveUpdate(this.execution[name])
        } catch (e) {
            try {
                eval(`this.execution["${name}"] = ${expression}`);
                eval(`${name} = ${expression}`);
            } catch (err) {
                try {
                    eval(`this.execution["${name}"] = \`${expression}\``);
                    eval(`${name} = \`${expression}\``);
                } catch (error) {
                  console.log(name,expression)
                    console.error( err,error);
                }
            }
        }
    },

    recursiveUpdate: function(item) {
        var re = new RegExp(`\\w{12}\\_`);
        var execution = this.execution;
        var context = this;
        Object.keys(item).forEach(function(elem) {
            if (re.test(item[elem])) {
                item[elem] = execution[item[elem]];
            }
            if (typeof item[elem] == "object") {
                context.recursiveUpdate(item[elem])
            }
        })
    },

    initSet: function(name, expression) {
        var value = this.parseTemplate(expression);
        var re = /.*\$\{.*\}.*/;

        if (re.test(value)) {

            var res = eval("`" + value + "`")
            this.execution[name] = res;

        } else {
            try {
                this.execution[name] = JSON.parse(value);
            } catch (e) {
                try {
                    this.execution[name] = eval(`${value}`);
                    eval(`${name} = JSON.parse(${value})`)
                } catch (e) {
                    try {
                        this.execution[name] = JSON.parse(value);
                        eval(`${name} = JSON.parse(${value})`);
                    } catch (e) {
                        this.execution[name] = value;
                    }

                }
            }

        }


    },
    setFormVariable: function(name, value) {
        this.execution[name] = value;
    },

    parseExpression: function(expr) {
        if (typeof expr == "undefined") {
            return false;
        }
        var context = this
        // context.initialize();
        var res = eval(expr);
        return res;

    },

    parseTemplate: function(template) {
        if (typeof template == "undefined") {
            return false;
        }
        var context = this
        // Object.keys(this.execution).forEach(function(elem) {
        //         var re = new RegExp(`(?:\\$\\{)(${elem})(?:.*\\})`);
        //         var res = template.match(re);
        //         if (res != null) {
        //             template = template.replace(res[1], `this.execution["${elem}"]`);
        //         }
        //         var re = new RegExp(`(\\$${elem})(?=\\W)`);
        //         var res = template.match(re);
        //         if (res != null) {
        //             template = template.replace(res[1], eval(`JSON.stringify(context.execution["${elem}"])`));
        //         }
        //         var re = new RegExp(`(\\%${elem})(?=\\W)`);
        //         var res = template.match(re);
        //         if (res != null) {
        //             template = template.replace(res[1], eval(`JSON.stringify(context.execution["${elem}"])`));
        //         }
        //     })
        return template;

    },

    parseJuel: function(expr) {
        var template = expr.replace("#{", "${");
        // this.initialize();
        now = function now(){
          return new Date();
        }
        template = juel.preEval.call(this,template);
        juel.recursiveMatch.call(this,juel,template)
        return eval("`"+template+"`");
    },
    compileCSS: function(css) {
        if (css == undefined) {
            return ""
        }
        less.render(css, {
            async: false
        }, function(e, output) {
            css = output.css;
        });
        return css;
    },
    parseJS: function(js) {
        if (js == undefined) {
            return "";
        }
        Object.keys(this.execution).forEach(elem => {
            var re = new RegExp(`\\$${elem}(?=\\W)`);
            js = js.replace(re, `wf.context.execution["${elem}"]`);
        });
        return js;
    },
    parseHTML: function(html) {
        if (html == undefined) {
            return "";
        }
        // this.initialize();
        // Object.keys(this.execution).forEach(elem => {
        //     re = new RegExp(`\\$${elem}`, "g");
        //     html = html.replace(re, eval(`wf.context.execution["${elem}"]`));
        //     var re = new RegExp(`${elem}(?=[\\s\\.\\|\\&\\+\\-])`, "g");
        //     html = html.replace(re, `wf.context.execution["${elem}"]`);
        // });
        return eval("`" + html + "`");
    }
}

module.exports = Context;
