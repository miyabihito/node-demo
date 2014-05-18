/*
 * Module dependencies
 */
var VisitorManager = require('../lib/visitor_manager');

/*
 * GET home page.
 */

exports.index = function(req, res){
	if ( ! req.cookies.id) {
		res.redirect('/mousetracer/entry');
		return;
	}

	res.render('mousetracer/index');
};

exports.index.post = function(req, res){
	var id = req.body.id;

	if ( ! id) {
		res.redirect('mousetracer/entry');
		return;
	}

	if (VisitorManager.getVisitor(id)) {
		res.redirect('mousetracer/entry');
		return;
	}

	res.cookie('id', id);
	res.render('mousetracer/index');
};

exports.entry = function(req, res){
	if (req.cookies.id) {
		res.redirect('/mousetracer');
		return;
	}
	res.render('mousetracer/entry');
};
