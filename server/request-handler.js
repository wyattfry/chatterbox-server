/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/
var RETURN_LIMIT = 5;
var url = require('url');
var messages = [];
var data = {
  results: [{text: '1', roomname: 'testroom', username: 'gwbb'},
    {text: '2', roomname: 'testroom', username: 'gwbb'},
    {text: '3', roomname: 'testroom', username: 'gwbb'},
    {text: '4', roomname: 'testroom', username: 'gwbb'},
    {text: '5', roomname: 'testroom', username: 'gwbb'},
    {text: '6', roomname: 'testroom', username: 'gwbb'}]};

var requestHandler = function(request, response) {
  console.log('request', request);
  var pathname = url.parse(request.url).pathname;
  var query = url.parse(request.url, true).query;
  console.log('query', query);
  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.
  console.log('Serving request type ' + request.method + ' for url ' + request.url);
  // The outgoing status.
  var statusCode = 200;

  // See the note below about CORS headers.
  var defaultCorsHeaders = {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'access-control-allow-headers': 'content-type, accept',
    'access-control-max-age': 10 // Seconds.
  };
  var headers = defaultCorsHeaders;
  if (request.method === 'OPTIONS') {
    response.writeHead(200, headers);
    response.end();
  } else if (request.method === 'POST' && pathname === '/classes/messages') {
    response.writeHead(201, headers);
    var body = [];
    request.on('data', (chunk) => {
      body.push(chunk);
    }).on('end', () => {
      body = Buffer.concat(body);
      body = Buffer.from(body);
      let message = JSON.parse(body.toString());
      message['createdAt'] = new Date();
      data.results.push(message);
    });
   
    response.end();
  } else if (request.method === 'GET' && pathname === ('/classes/messages')) {
    console.log('ASKED FOR MESSAGES!!!11!!!!1!11');
    
    let responseData = {results: []};
    
    if (query.order) {
      if (query.order === '-createdAt') {
        for (let i = data.results.length - 1;
          i >= 0 && i >= data.results.length - RETURN_LIMIT;
          i--) {
          responseData.results.push(data.results[i]);
        }
      }
    } else {
      for (let i = 0;
        i <= data.results.length && i <= RETURN_LIMIT;
        i++) {
        responseData.results.push(data.results[i]);
      }
    }
    
    headers['Content-Type'] = 'application/json';
    response.writeHead(200, headers);
    response.end(JSON.stringify(responseData));
  } else {
    response.statusCode = 404;
    response.end();
  }

};

exports.requestHandler = requestHandler;

// Tell the client we are sending them plain text.

// You will need to change this if you are sending something
// other than plain text, like JSON or HTML.
// headers['Content-Type'] = 'application/json';


// .writeHead() writes to the request line and headers of the response,
// which includes the status and all headers.
// response.writeHead(statusCode, headers);

// Make sure to always call response.end() - Node may not send
// anything back to the client until you do. The string you pass to
// response.end() will be the body of the response - i.e. what shows
// up in the browser.
//
// Calling .end "flushes" the response's internal buffer, forcing
// node to actually send all the data over to the client.

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.

