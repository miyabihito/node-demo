/*
 * Module dependencies
 */
var Visitor = require('./visitor');

/*
 * VisitorManager
 */
var VisitorManager = module.exports = exports = {};

VisitorManager.list = [];

VisitorManager.visit = function(id) {
	for (var i = 0; i < this.list.length; i++) {
		if (this.list[i].id === id) {
			throw new Error('visitor already added to list. id: ' + id);
		}
	}

	var visitor = new Visitor(id);
	visitor.randomizeColor();
	this.list.push(visitor);

	return visitor;
};

VisitorManager.exit = function(id) {
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

VisitorManager.getVisitor  = function(id) {
	if ( ! id) {
		return this.list;
	}

	for (var i = 0; i < this.list.length; i++) {
		if (this.list[i].id === id) {
			return this.list[i];
		}
	}

	return null;
};
