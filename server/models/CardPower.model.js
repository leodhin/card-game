const mongoose = require('mongoose');

const CardPowerSchema = new mongoose.Schema({
	name: { type: String, required: true },
	description: { type: String },
	effectKey: { type: String, required: true },
	parameters: { type: [String], default: [] },
	createdAt: { type: Date, default: Date.now },
	modifiedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CardPower', CardPowerSchema);
