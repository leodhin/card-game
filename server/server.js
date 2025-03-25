// server.js
const express = require('express');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const session = require('express-session');

const { GAME_STATE, SOCKET_EVENTS } = require('./constants');
const createSocketGame = require('./gameSocketEvents');
const { findGamePlayer } = require('./utils');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(session({
	secret: 'tuSecretoMuySeguro',
	resave: false,
	saveUninitialized: true
}));

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
