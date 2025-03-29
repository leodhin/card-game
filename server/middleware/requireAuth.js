// Middleware to check if user is authenticated
function requireAuth(req, res, next) {
	if (!req.session || !req.session.userId) {
        res.redirect('/login');
		//return res.status(401).json({ error: 'Unauthorized' });
	}
	next();
}

module.exports = requireAuth;
