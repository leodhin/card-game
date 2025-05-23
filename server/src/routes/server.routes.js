const express = require('express');
const { isLoggedIn } = require('../middleware/http/requireAuthHTTP');
const router = express.Router();

router.get('/join-game', isLoggedIn, async (req, res) => {
  try {
    const userId = req.userId;
    const gameId = 'game123';
    res.json({ gameId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error joining game.' });
  }
});

module.exports = router;
