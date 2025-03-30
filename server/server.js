require('dotenv').config();
const createSocketGame = require('./gameSocketEvents');
const { findGamePlayer } = require('./utils/utils');
const passport = require('passport');

// Server entry point
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const session = require('express-session');
const jwt = require('jsonwebtoken');


// Database
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
	cors: {
		transports: ['websocket', 'polling'],
		methods: ["GET", "POST"],
		allowedHeaders: ["authorization"],
		credentials: true,
	},
});
app.use(cors());
app.use(express.static('public'));
app.use(express.static('blob'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes   
const cardRoutes = require('./routes/cardRoutes');
app.use('/api', cardRoutes);
const deckRoutes = require('./routes/deckRoutes');
app.use('/api', deckRoutes);
const cardPowerRoutes = require('./routes/cardPowerRoutes');
app.use('/api', cardPowerRoutes);
const authRoutes = require('./routes/authRoutes');
const { transcode } = require('buffer');
app.use('/api/auth', authRoutes);

const game_namespace = io.of('/game');
const gameController = createSocketGame(game_namespace);

io.on('connection', (socket) => {
	console.log('User connected with socket id:', socket.id);
	const userId = socket.request.user?.userId;
	if (userId) {
		console.log('User connected with userId:', userId, 'and socket id:', socket.id);
		socket.on('requestRoomList', function () {
			const games = gameController.getGames();
			socket.emit('roomList', games);

		});
	} else {
		socket.emit('unauthorized', 'You must be logged in to play');
	}
});

server.listen(process.env.SERVER_PORT, () => {
	console.log(`Server is running on port ${process.env.SERVER_PORT}`);
});

connectDB();

async function connectDB() {
	try {
		await mongoose.connect(process.env.MONGODB_URI);
		console.log("Connected to MongoDB");
	} catch (err) {
		console.error("Error connecting MongoDB:", err);
		process.exit(1);
	}
}
