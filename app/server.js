var http = require('http');
var url = require('url');

var express = require('express');

var define = require('./define');
var route = require('./route');

module.exports = function(){
  function onRequest(request,response,next){
    request.setEncoding('utf-8');
    request.on('data', function(datachunk){
    });
    request.on('end', function(){
      var _url = url.parse(request.url);
      var pathname = _url.pathname;
      var handle = route[pathname];
      var method = request.method.toLowerCase();

      if( handle && handle[method]){
        console.log("---request---path["+pathname+"] method["+method+"]---");
        handle[method](request, response);
      }
      else{
        console.log("unrecognized handle... path["+pathname+"] method["+method+"]");
        response.writeHead(404, {'Content-Type': 'text/plain'});
        response.write('404 Not found!~');
        response.end();
      }
    });
  }

  var app = express();
  var server = http.createServer(app);
  app.use(express.static(__dirname + '/public'));
  app.use(onRequest);
  server.listen(define.port | 8891, function(){
    console.log("server["+define.port+"] has started...");
  });
  server.on('close', function(){
    console.log("server closed...");
  });
}
