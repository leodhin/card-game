require('dotenv').config();
const createSocketGame = require('./gameSocketEvents');
const { findGamePlayer } = require('./utils/utils');
const cardRoutes = require('./routes/card.routes');
const deckRoutes = require('./routes/deck.routes');
const cardPowerRoutes = require('./routes/cardPower.routes');
const authRoutes = require('./routes/auth.routes');
const { transcode } = require('buffer');
const passport = require('passport');


// Server entry point
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const session = require('express-session');
const jwt = require('jsonwebtoken');

// Connecting to database pool instance
require('./connectDB');

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

const gameNamespace = createSocketGame(io);


app.use(cors());
app.use(express.static('public'));
app.use(express.static('blob'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes   
app.use('/api', cardRoutes);
app.use('/api', deckRoutes);
app.use('/api', cardPowerRoutes);
app.use('/api/auth', authRoutes);


app.get('/api/join-game', (req, res) => {
	const gameId = matchmaker.queuePlayer(req.user.Id);
	gameNamespace.game
	if (gameId) {
		req.socket.emit('MATCH_FOUND', gameId);
		res.json({
			gameId: `123`
		})
	} else {
		req.socket.emit('WAITING', 'Waiting for another player...');
	}
});

server.listen(process.env.SERVER_PORT, () => {
	console.log(`Server is running on port ${process.env.SERVER_PORT}`);
});