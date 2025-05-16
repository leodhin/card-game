const User = require('../../models/User.model');
const { logMatchHistory, getMatchHistory } = require('../../services/game.service');

exports.getProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const matchHistory = await getMatchHistory(userId);
    if (!matchHistory) {
      return res.status(404).json({ error: 'Match history not found' });
    }


    return res.status(200).json({
      user,
      matchHistory,
    });

  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

