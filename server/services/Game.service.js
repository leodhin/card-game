const MatchHistoryModel = require('../models/Game.model');

exports.logMatchHistory = async (matchRecord) => {
  try {
    const newRecord = new MatchHistoryModel(matchRecord);
    await newRecord.save();
    console.log('Match record logged:', newRecord);
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