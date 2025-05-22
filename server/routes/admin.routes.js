

const express = require('express');

const { isAdmin } = require('../middleware/http/requireAdminHTTP');

module.exports = (gameNamespace) => {
  const router = express.Router();

  router.get('/active-games', isAdmin, async (req, res) => {
    try {

      const activeGames =
        typeof gameNamespace.getActiveGames === 'function'
          ? gameNamespace.getActiveGames()
          : [];
      res.json(activeGames);
    } catch (error) {
      console.error('Error fetching active games:', error);
      res.status(500).json({ error: 'Failed to fetch active games' });
    }
  });

  return router;
};