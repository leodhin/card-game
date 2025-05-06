const express = require('express');
const { isLoggedIn } = require('../middleware/http/requireAuthHTTP');
const router = express.Router();

module.exports = (matchmaker) => {
	router.get('/join-game', isLoggedIn, async (req, res) => {
		try {
			const userId = req.userId;

			console.log(`User ${userId} is trying to join a game...`);
			const gameId = await matchmaker.queuePlayer(userId);
			console.log(`User ${userId} joined game ${gameId}`);
			res.json({ gameId });
		} catch (err) {
			console.error(err);
			res.status(500).json({ error: 'Error joining game.' });
		}
	});


	return router;
};
