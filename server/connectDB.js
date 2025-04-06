const mongoose = require('mongoose');

let connection = null;

async function connectDB() {
	try {
		connection = await mongoose.connect(process.env.MONGODB_URI);
		console.log("Connected to MongoDB");
	} catch (err) {
		console.error("Error connecting MongoDB:", err);
		process.exit(1);
	}
}

connectDB()

exports.default = connection;