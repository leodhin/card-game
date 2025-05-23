const mongoose = require('mongoose');

const CardSchema = new mongoose.Schema({
	name:     { type: String, required: true },
	img:      { type: String, required: true },  
	attack:   { type: Number, required: true },
	defense:  { type: Number, required: true },
	cost:     { type: Number, required: true },
	lore:     { type: String, required: true },
	userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	powers: { type: [String], default: [] },
	createdAt:{ type: Date, default: Date.now },
    createdBy:{ type: String },
    modifiedAt:{ type: Date, default: Date.now },
    modifiedBy:{ type: String },
});

module.exports = mongoose.model('Card', CardSchema);
