/*
 * Module dependencies
 */
var VisitorManager = require('../lib/visitor_manager');
var cookie = require('cookie');


exports.onConnect = function(socket) {
	var id = (cookie.parse(socket.handshake.headers.cookie)).id;
	socket.set('visitorId', id);

	var visitor = VisitorManager.getVisitor(id);

	if (visitor) {
		visitor.addSocket(socket);
	} else {
		visitor = VisitorManager.visit(id)
				.addSocket(socket);
	}

	var convertedVisitorList = VisitorManager.getVisitor().map(function(v) {
		var convertedVisitor = {};
		convertedVisitor.id = v.id;
		convertedVisitor.color = v.color;
		convertedVisitor.pathIds = v.sockets.map(function(s) {
			return s.id;
		});

		return convertedVisitor;
	});
	socket.emit('self-entry', {id: visitor.id, pathId: socket.id, visitorList: convertedVisitorList});

	socket.broadcast.emit('others-entry', {id: visitor.id, color: visitor.color, pathId: socket.id});

	socket.on('point', function(data) {
		socket.broadcast.emit('trace', {id: visitor.id, pathId: socket.id, type: data.type, x: data.x, y: data.y});
	});

	socket.on('vanish', function(data) {
		socket.broadcast.emit('vanish', {id: visitor.id, pathId: socket.id});
	});

	socket.on('disconnect', function() {
		socket.broadcast.emit('exit', {id: visitor.id, pathId: socket.id});

		visitor.removeSocket(socket);
		if (visitor.sockets.length == 0) {
			VisitorManager.exit(visitor);
		}
	});
};
