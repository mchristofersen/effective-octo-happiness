var fs = require("fs");

const fetchFlow = () => new Promise((resolve) => {
  setTimeout(() => resolve('future value'), 500);
});

async function getFlow(flowName)  {
	try {

		await fs.readFile(`app/flows/${flowName}.bpmn`,'utf8')
						}catch (e){
							console.error(e);
						}

}

function getFlowSync(flowName)  {
	try {
		var flow = fs.readFileSync(`app/flows/${flowName}.bpmn`,'utf8')
		return flow
						}catch (e){
							console.error(e);
						}

}

module.exports.getFlow = getFlow;
