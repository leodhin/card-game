const express = require('express');
const User = require('../models/User.model');
const router = express.Router();
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
  const { email, password, nickname } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });
    const user = new User({ email, password, nickname });
    await user.save();
    res.json({ message: 'Registered', user: { email, nickname } });
    console.log("User registered ", user);
  } catch (err) {
    console.error(err);
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
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.SESSION_SECRET, {
      expiresIn: '1h',
    });
    res.status(200).json({ token, user: { email: user.email, nickname: user.nickname, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Logged out' });
});

router.get('/me', async (req, res) => {
  if (!req.userId) return res.status(401).json({ error: 'Not logged in' });
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ email: user.email, nickname: user.nickname });
});

module.exports = router;
