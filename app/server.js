var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var multer = require('multer');
var ejs = require('ejs');

var define = require('./define');
var route = require('./route');
var mongo = require('./core/mongo');

module.exports = function(){
  function onRequest(request,response,next){
    request.setEncoding('utf-8');
    var path = request.path;
    var method = request.method.toLowerCase();

    var match = false;
    for(var reg in route){
      if(reg.match(path) && route[reg][method]){
        console.log("---request---path["+path+"] method["+method+"]---");
        route[reg][method](request, response);
        match = true;
        break;
      }
    }

    if(!match){
      console.log("unrecognized handle... path["+path+"] method["+method+"]");
      response.writeHead(404, {'Content-Type': 'text/plain'});
      response.write('404 Not found!~');
      response.end();
    }
  }

  var app = express();
  var server = http.createServer(app);

  // body parser
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(multer({dest:'./uploads', limits: {fileSize: 100000000}}));
  app.use(cookieParser());
  // view
  app.set('views', __dirname + '/view');
  app.engine('.html', ejs.__express);
  app.set('view engine', 'html');
  // static
  app.use(express.static(__dirname + '/public'));

  //router
  app.use(onRequest);

  //mongo
  mongo.open();

  server.listen(define.port | 8891, function(){
    console.log("server["+define.port+"] has started...");
  });
  server.on('close', function(){
    mongo.close();
    console.log("server closed...");
  });
}
