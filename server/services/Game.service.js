const mongoose = require('mongoose');
const MatchHistoryModel = require('../models/Game.model');

exports.logMatchHistory = async (matchRecord) => {
  try {
    const newRecord = new MatchHistoryModel(matchRecord);
    await newRecord.save();
    return newRecord;
  } catch (error) {
    console.error('Error logging match history:', error);
    throw error;
  }
};

exports.updateMatchHistory = async (matchId, updateData) => {
  try {
    const updatedRecord = await MatchHistoryModel.findOneAndUpdate(
      { gameId: matchId },
      updateData,
      { new: true }
    );
    if (!updatedRecord) {
      throw new Error('Match record not found');
    }
    console.log('Match record updated:', updatedRecord);
    return updatedRecord;
  } catch (error) {
    console.error('Error updating match history:', error);
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

exports.updateStaleMatches = async () => {
  try {
    const now = new Date();
    const staleDuration = 30 * 60 * 1000;
    const threshold = new Date(now.getTime() - staleDuration);

    const result = await MatchHistoryModel.updateMany(
      {
        status: 'in-progress',
        updatedAt: { $lt: threshold },
      },
      { $set: { status: 'unknown' } }
    );

    console.log(
      `${result.modifiedCount || result.nModified} stale match(es) marked as unknown.`
    );
  } catch (error) {
    console.error('Error updating stale matches:', error);
  }
};