const getRequest = function(theUrl) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl, true); // true for asynchronous
    xmlHttp.send(null);
    new Promise((resolve) => {
        setTimeout(() => resolve('future variable'), 1000);
    })
};

export async function httpGetAsync(theUrl) {
    var result = await getRequest(theUrl)

    return result
}

export function getThumbnails() {
    httpGetAsync("http://localhost:8080/getThumbnails").then(result => console.log(result))
	}
