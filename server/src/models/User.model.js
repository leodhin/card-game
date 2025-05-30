const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	nickname: { type: String, required: true, unique: true },
	friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
	role: { type: String, enum: ['user', 'admin'], default: 'user' },
	friendRequestsSent: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
	friendRequestsReceived: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
	aiUsageRemaining: { type: Number, default: 5 },
});

UserSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next();
	this.password = await bcrypt.hash(this.password, 10);
	next();
});

UserSchema.methods.comparePassword = function (candidatePassword) {
	return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);