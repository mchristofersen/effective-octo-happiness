var http = require('http');

http.createServer(function (req, resp) {
  if (req.url === '/save') {
    if (req.method === 'PUT') {
      req.pipe(request.put('http://mysite.com/doodle.png'))
    } else if (req.method === 'GET' || req.method === 'HEAD') {
      request.get('http://mysite.com/doodle.png').pipe(resp)
    }
  }
})
