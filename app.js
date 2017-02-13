const http = require('http');
const PORT = 8080;
//
function requestHandler(request, response) {
  console.log(`Requested Path: ${request.url}\nRequest Method: ${request.method}`);
  if (request.url == '/') {
     response.end('Welcome!')
  } else if (request.url === '/urls') {
    console.log(response.body)
       response.end('www.lighthouselabs.ca\nwww.google.com');
  } else {
       response.statusCode = 404;
       response.end('Unknown Path, Not Found.')
  }
}
const server = http.createServer(requestHandler);
server.listen(PORT, () => {
  console.log(`Server listening on: http://localhost:${PORT}`);
});
