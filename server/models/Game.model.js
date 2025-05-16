const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['waiting', 'in-progress', 'finished'], default: 'waiting' },
  deck: [{ type: String }], // e.g., card identifiers
  currentTurn: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

GameSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Game', GameSchema);