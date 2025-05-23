const mongoose = require('mongoose');

const DeckSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	name: {
		type: String,
		required: true
	},
    portrait: {
		type: String,
	},
	cards: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Card'
	}],
	createdAt:{ type: Date, default: Date.now },
    createdBy:{ type: String },
    modifiedAt:{ type: Date, default: Date.now },
    modifiedBy:{ type: String },
}, { timestamps: true });

module.exports = mongoose.model('Deck', DeckSchema);
