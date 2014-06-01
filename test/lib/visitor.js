/*
 * Module dependencies
 */
var assert = require('assert');
var Visitor = require('../../lib/visitor');

describe('Visitor', function() {
	it('should have id', function() {
		var id = 'id';
		var visitor = new Visitor(id);
		assert.equal(visitor.id, id);
	});

	it('should have random color', function() {
		var visitor = new Visitor('id');
		visitor.randomizeColor();
		assert.ok(/^#[0-9a-f]{6}$/.test(visitor.color));
	});
});
