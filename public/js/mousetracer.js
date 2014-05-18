// ejs custom delimiters
ejs.open = '{{';
ejs.close = '}}';

// Adding methods to Raphael Elements
Raphael.el.moveTo = function(x, y) {
	var pathString = this.attr('path') + ' M' + x + ',' + y;
	this.attr('path', pathString);
};

Raphael.el.lineTo = function(x, y) {
	var pathString = this.attr('path') + ' L' + x + ',' + y;
	this.attr('path', pathString);
};


(function() {
	/*
	 * Visitor
	 */
	var Visitor = function(id, color) {
		if ( ! id) {
			throw new Error('invalid id: ' + id);
		}
		this.id = id;

		if (color) {
			this.color = color;
		}

		this.paths = {};
	};

	Visitor.prototype.initPath = function(pathId) {
		if (this.paths[pathId]) {
			this.removePath(pathId);
		}

		this.paths[pathId] = null;

		return this;
	};

	Visitor.prototype.movePath = function(pathId, x, y) {
		if (this.paths[pathId]) {
			this.paths[pathId].moveTo(x, y);
		} else {
			this.paths[pathId] = paper.path('M' + x + ',' + y);
			this.paths[pathId].attr('stroke', this.color);
			this.paths[pathId].attr('stroke-width', 5);
		}

		return this;
	};

	Visitor.prototype.linePath = function(pathId, x, y) {
		if (this.paths[pathId]) {
			this.paths[pathId].lineTo(x, y);
		} else {
			this.movePath(pathId, x, y);
		}

		return this;
	};

	Visitor.prototype.removePath = function(pathId) {
		if (this.paths[pathId]) {
			this.paths[pathId].remove();
			delete this.paths[pathId];
		}

		return this;
	};

	/*
	 * VisitorManager
	 */
	var VisitorManager = {};
	VisitorManager.list = [];
	VisitorManager.init = function(visitorList) {
		visitorList.forEach(function(v) {
			var visitor = new Visitor(v.id, v.color);
			VisitorManager.list.push(visitor);

			v.pathIds.forEach(function(pathId) {
				visitor.initPath(pathId);
			});
		});
	};
	VisitorManager.getVisitor = function(id) {
		if ( ! id) {
			return this.list;
		}

		for(var i = 0; i < this.list.length; i++) {
			if (this.list[i].id === id) {
				return this.list[i];
			}
		}

		return null;
	};
	VisitorManager.addVisitor = function(id, color) {
		var visitor = new Visitor(id, color);
		this.list.push(visitor);

		return visitor;
	};
	VisitorManager.removeVisitor = function(id) {
		var visitor;
		if (id.constructor === Visitor) {
			visitor = id;
		} else {
			visitor = this.getVisitor(id);
		}

		var index = this.list.indexOf(visitor);
		if (index != -1) {
			this.list.splice(index, 1);
		}
	};



	var paper;
	var myId;
	var myPathId;
	var INTERVAL = 1;
	var counter = 0;


	/*
	 * When the DOM has finished loading
	 */
	$(function() {
		paper = Raphael('svg');

		// Socket Setting
		var socket = io.connect();
		socket.on('self-entry', function(data) {
			myId = data.id;
			myPathId = data.pathId;
			VisitorManager.init(data.visitorList);

			VisitorManager.getVisitor().forEach(function(visitor) {
				var li = ejs.render($('#visitor').html(), {id: visitor.id, color: visitor.color, count: Object.keys(visitor.paths).length});
				$('#visitor-list').append(li);
			});
		});

		socket.on('others-entry', function(data) {
			if (VisitorManager.getVisitor(data.id)) {
				var visitor = VisitorManager.getVisitor(data.id).initPath(data.pathId);

				var li = ejs.render($('#visitor').html(), {id: visitor.id, color: visitor.color, count: Object.keys(visitor.paths).length});
				$('#id-'+data.id).replaceWith(li);
			} else {
				VisitorManager.addVisitor(data.id, data.color)
					.initPath(data.pathId);

				var li = ejs.render($('#visitor').html(), {id: data.id, color: data.color, count: 1});
				$('#visitor-list').append(li);
			}
		});

		socket.on('trace', function(data) {
			var x = $('#svg').width() * data.x;
			var y = $('#svg').height() * data.y;

			if (data.type === 'move') {
				VisitorManager.getVisitor(data.id).movePath(data.pathId, x, y);
			} else if (data.type === 'line') {
				VisitorManager.getVisitor(data.id).linePath(data.pathId, x, y);
			}
		});

		socket.on('vanish', function(data) {
			VisitorManager.getVisitor(data.id).initPath(data.pathId);
		});

		socket.on('exit', function(data) {
			var visitor = VisitorManager.getVisitor(data.id).removePath(data.pathId);
			if ( ! Object.keys(visitor.paths).length) {
				VisitorManager.removeVisitor(visitor);

				$('#id-'+visitor.id).remove();
			} else {
				var li = ejs.render($('#visitor').html(), {id: visitor.id, color: visitor.color, count: Object.keys(visitor.paths).length});
				$('#id-'+data.id).replaceWith(li);
			}
		});


		// Mouse Events
		$('#svg').mouseenter(function(event) {
			if (myId) {
				VisitorManager.getVisitor(myId).movePath(myPathId, event.pageX, event.pageY);

				var x = event.pageX / $('#svg').width();
				var y = event.pageY / $('#svg').height();
				socket.emit('point', {type: 'move', x: x, y: y});
			}
		});

		$('#svg').mousemove(function(event) {
			if (myId && (counter >= INTERVAL)) {
				counter = 0;
				VisitorManager.getVisitor(myId).linePath(myPathId, event.pageX, event.pageY);

				var x = event.pageX / $('#svg').width();
				var y = event.pageY / $('#svg').height();
				socket.emit('point', {type: 'line', x: x, y: y});
			} else {
				counter++;
			}
		});

		$('#svg').dblclick(function() {
			VisitorManager.getVisitor(myId).initPath(myPathId);
			socket.emit('vanish');
		});
	});
})();
