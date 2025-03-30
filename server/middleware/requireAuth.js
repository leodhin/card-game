// Middleware to check if user is authenticated
const jwt = require('jsonwebtoken');

function isLoggedIn(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
    
        const token = authHeader.split(' ')[1]; 
        if (!token) return res.status(401).json({ error: 'Access denied' });

        const decoded = jwt.verify(token, process.env.SESSION_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({ error: 'Invalid token' });
    }
};

module.exports = {isLoggedIn};
