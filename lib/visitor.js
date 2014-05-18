/*
 * visitor
 */
var Visitor = function(id, color, socket) {
	this.id = '';
	this.color = '';
	this.sockets = [];

	if ( ! id) {
		throw new Error('invalid id: ' + id);
	}
	this.id = id;

	if (color) {
		this.color = color;
	}

	if (socket) {
		this.sockets.push(socket);
	}
};

// set random string #000000 ~ #ffffff
Visitor.prototype.randomizeColor = function() {
	var color = '#';
	for (var i = 0; i < 6; i++) {
		var hex = Math.floor(Math.random() * 16);
		color += hex.toString(16);
	}
	this.color = color;

	return this;
};

Visitor.prototype.addSocket = function(socket) {
	if (socket) {
		this.sockets.push(socket)
	}

	return this;
};

Visitor.prototype.removeSocket = function(socket) {
	if (socket) {
		var index = this.sockets.indexOf(socket);
		if (index != -1) {
			this.sockets.splice(index, 1);
		}
	}

	return this;
};

module.exports = exports = Visitor;
