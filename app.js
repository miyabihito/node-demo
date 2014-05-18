/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.cookieParser());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(req, res) {
	res.send(404, 'Not Found');
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


// routing setting
var routes = require('./routes');
var mouseTracer = require('./routes/mousetracer');

app.get('/', routes.index);
app.get('/mousetracer', mouseTracer.index);
app.post('/mousetracer', mouseTracer.index.post);
app.get('/mousetracer/entry', mouseTracer.entry);

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// socket setting
var socketsMouseTracer = require('./sockets/mousetracer');
var io = require('socket.io').listen(server);
io.sockets.on('connection', socketsMouseTracer.onConnect);
