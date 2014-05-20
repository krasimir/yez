var http = require('http');
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  throw new Error('Ops!');
  console.log('Processing request');
  res.end('Hello World\n');
}).listen(1338, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1338/');