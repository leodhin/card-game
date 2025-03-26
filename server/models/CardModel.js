const mongoose = require('mongoose');

const CardSchema = new mongoose.Schema({
	name:     { type: String, required: true },
	img:      { type: String },  
	attack:   { type: Number },
	defense:  { type: Number },
	cost:     { type: Number },
	lore:     { type: String },
	createdAt:{ type: Date, default: Date.now },
    createdBy:{ type: String },
    modifiedAt:{ type: Date, default: Date.now },
    modifiedBy:{ type: String },
});

module.exports = mongoose.model('Card', CardSchema);
