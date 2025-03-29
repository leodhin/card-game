
const config = require('./config');
const createSocketGame = require('./gameSocketEvents');
const { findGamePlayer } = require('./utils/utils');

// Server entry point
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const session = require('express-session');

// Database
const mongoose = require('mongoose');
const sessionMiddleware = session({
	secret: config.SESSION_SECRET,
	resave: false,
	saveUninitialized: true
});

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
app.use(cors());
app.use(sessionMiddleware);
app.use(express.static('public'));
app.use(express.static('blob'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes   
const cardRoutes = require('./routes/cardRoutes');
app.use('/api', cardRoutes); 
const deckRoutes = require('./routes/deckRoutes');
app.use('/api', deckRoutes);
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const game_namespace = io.of('/game');
const gameController = createSocketGame(game_namespace);

io.use((socket, next) => {
	sessionMiddleware(socket.request, socket.request.res || {}, next);
});

io.on('connection', (socket) => {
	const userId = socket.request.session.userId;
	console.log('User connected with userId:', userId, 'and socket id:', socket.id);

	socket.on('requestRoomList', function() {
		const games = gameController.getGames();
		socket.emit('roomList', games);

	});

});

server.listen(config.SERVER_PORT, () => {
	console.log(`Server is running on port ${config.SERVER_PORT}`);
});


connectDB();

async function connectDB() {
	try {
		await mongoose.connect(config.MONGODB_URI);
        console.log("Connected to MongoDB");
	} catch (err) {
		console.error("Error connecting MongoDB:", err);
		process.exit(1);
	}
}
