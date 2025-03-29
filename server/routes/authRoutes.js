const express = require('express');
const User = require('../models/User');
const router = express.Router();

router.post('/register', async (req, res) => {
	const { email, password, nickname } = req.body;
	try {
		const existing = await User.findOne({ email });
		if (existing) return res.status(400).json({ error: 'Email already registered' });
		const user = new User({ email, password, nickname });
		await user.save();
		req.session.userId = user._id;
		res.json({ message: 'Registered', user: { email, nickname } });
	} catch (err) {
		res.status(500).json({ error: 'Registration failed' });
	}
});

router.post('/login', async (req, res) => {
	const { email, password } = req.body;
	try {
		const user = await User.findOne({ email });
		if (!user || !(await user.comparePassword(password))) {
			return res.status(401).json({ error: 'Invalid credentials' });
		}
		req.session.userId = user._id;
		res.json({ message: 'Logged in', user: { email, nickname: user.nickname } });
	} catch (err) {
		res.status(500).json({ error: 'Login failed' });
	}
});

router.post('/logout', (req, res) => {
	req.session.destroy();
	res.json({ message: 'Logged out' });
});

router.get('/me', async (req, res) => {
	if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
	const user = await User.findById(req.session.userId);
	if (!user) return res.status(404).json({ error: 'User not found' });
	res.json({ email: user.email, nickname: user.nickname });
});

module.exports = router;
