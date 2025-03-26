// Server entry point
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const session = require('express-session');

// Database
const mongoose = require('mongoose');
const uri = "mongodb+srv://mgata:libertad@cardgamedb.xjlzfl9.mongodb.net/?retryWrites=true&w=majority&appName=CardGameDB";

const { GAME_STATE, SOCKET_EVENTS } = require('./constants');
const createSocketGame = require('./gameSocketEvents');
const { findGamePlayer } = require('./utils');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
app.use(cors());


app.use(session({
	secret: 'tuSecretoMuySeguro',
	resave: false,
	saveUninitialized: true
}));

app.use(express.static('public'));
app.use(express.static('blob'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes   
const cardRoutes = require('./routes/cardRoutes');
app.use('/api', cardRoutes); 


const PORT = process.env.PORT || 3000;

const game_namespace = io.of('/game');
const gameController = createSocketGame(game_namespace);

io.on('connection', (socket) => {
	socket.on('requestRoomList', function() {
		const games = gameController.getGames();
		socket.emit('roomList', games);

	});
});

server.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});


connectDB();

async function connectDB() {
	try {
		await mongoose.connect(uri);
        console.log("Connected to MongoDB");
	} catch (err) {
		console.error("Error connecting MongoDB:", err);
		process.exit(1);
	}
}
