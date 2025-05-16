const Game = require('../models/game.model'); // Adjust path as needed


exports.getMyGames = async (req, res) => {
  try {
    const userId = req.user.id;
    const games = await Game.find({ players: userId });
    res.json(games);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching games', error: error.message });
  }
};