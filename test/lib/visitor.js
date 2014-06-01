/*
 * Module dependencies
 */
var Visitor = require('../../lib/visitor');

describe('Visitor', function() {
	it('should have id', function() {
		var id = 'id';
		var visitor = new Visitor(id);
		visitor.should.have.property('id', id);
	});

	it('should have random color', function() {
		var visitor = new Visitor('id');
		visitor.randomizeColor();
		visitor.should.have.property('color').which.match(/^#[0-9a-f]{6}$/);
	});
});
