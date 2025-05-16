const MatchHistoryModel = require('../models/Game.model');


exports.logMatchHistory = async (matchRecord) => {
  try {
    const newRecord = new MatchHistoryModel(matchRecord);
    const result = await newRecord.save();

    console.info(`[MATCHMAKER] Matched ${result.players[0].username} with ${result.players[1].username}`);
    return newRecord;
  } catch (error) {
    console.error('Error logging match history:', error);
    throw error;
  }
};

exports.getMatchHistory = async (userId) => {
  try {
    const matchHistory = await MatchHistoryModel.find({ players: userId });
    return matchHistory;
  } catch (error) {
    console.error('Error fetching match history:', error);
    throw error;
  }
};