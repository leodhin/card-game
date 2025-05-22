const jwt = require('jsonwebtoken');
const { getUserById } = require('../../services/User.service');

async function hasAIUsage(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied' });

    const decoded = jwt.verify(token, process.env.SESSION_SECRET);
    req.userId = decoded.userId;

    const user = await getUserById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (!user.aiUsageRemaining) {
      return res.status(403).json({ error: 'AI usage not allowed' });
    }

    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = { hasAIUsage };