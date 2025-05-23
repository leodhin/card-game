const mongoose = require('mongoose');
const { updateStaleMatches } = require('../services/game.service');

let connection = null;

async function connectDB() {
  try {
    connection = await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Update stale matches every 30 minutes
    await updateStaleMatches();

  } catch (err) {
    console.error("Error connecting MongoDB:", err);
    process.exit(1);
  }
}

connectDB()

exports.default = connection;