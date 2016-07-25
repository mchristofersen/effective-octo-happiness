String.prototype._empty = function empty(){
	if (this.length > 0){
		return false
	}
	return true
}



String.prototype.matches = function matches(pattern){
	var re = new RegExp(pattern);
	return re.test(this);
}


module.exports = {
	scrub : function scrub(expression){
		expression = expression.replace(/not\W{1}/, "!")
		var re = /(empty)\s{1}(\w*)/;
		var match;
		while ((match = re.exec(expression)) !== null){
			if (eval(`typeof ${match[2]}`)=="undefined"){
				eval(`var ${match[2]} = ""`)
			}
				expression = expression.replace(match[1],"").replace(match[2],`${match[2]}.empty()`);
		}
		return expression;
	},
	recursiveMatch: function (self,expression, submatch){
		var re = /\((.*)\)/;
		if (!submatch){
			var match = re.exec(expression)
			if (match){
				self.recursiveMatch(self,expression,match[1])
				match[1].split(",").forEach(function (elem){
					try {
						if (eval(`typeof ${elem} == "undefined"`)){
							eval(`${elem} = ""`)
						}
					}catch (e){
						console.error(e);
						console.log(match);
						expression = expression.replace(elem,"");
					}

				})
			}		}


	},
	preEval: function preEval(expression){
		var recursiveMatch = function (submatch){
			var match = /(str:)?(\w+?)\(([^\$\{\}]*)\)/g.exec(submatch);
			if (match){
				if (match[1]){
					console.log(match[3].split(","))
					recursiveMatch(match[3])
				}else {
					console.log(match[0].split(","))
				}

			}
		}
		expression = expression.replace(/not\W{1}/, "!")
		var re = /(empty)\s{1}(\w*)/g;
		var match;
		while ((match = re.exec(expression)) !== null){
			if (eval(`typeof ${match[2]}`)=="undefined"){
				eval(`${match[2]} = ""`)
			}
				expression = expression.replace(match[1],"").replace(match[2],`${match[2]}._empty()`);
		}
		re = /(\w+?)\s?==/g;
		while ((match = re.exec(expression)) !== null){
			if (eval(`typeof ${match[1]}`)=="undefined"){
				eval(`${match[1]} = ""`)
			}
		}
		re = /(\w+?)([[\.]\"?\'?\w+\"?\'?\]?)/g;
		while ((match = re.exec(expression)) !== null){
			if (eval(`typeof ${match[1]}`)=="undefined"){
				eval(`${match[1]} = {}`)
			}
		}
		recursiveMatch(expression);
		// re = /(str:)?(\w+?)\(([^\)\$\{\}]*?)\)/g;
		// while ((match = re.exec(expression)) !== null){
		// 	match[2].split(",").forEach(function (elem){
		// 		try {
		// 			if (eval(`typeof ${elem} == "undefined"`)){
		// 				eval(`${elem} = ""`)
		// 			}
		// 		}catch (e){
		// 			console.error(e);
		// 			console.log(match);
		// 			// expression = expression.replace(elem,"");
		// 		}
		//
		// 	})
		// 	if (match[1]){
		// 		expression = expression.replace(match[1]+match[2],"this.juelFunctions."+match[2])
		// 	}
		// }
		// this.recursiveMatch(expression)
		return expression;
	}
}
