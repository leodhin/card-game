const Game = require('./game/Game');
const jwt = require('jsonwebtoken');

const { GAME_STATE, PHASE_STATE, PLAYER_STATE, SOCKET_EVENTS } = require('./utils/constants');
const { findGamePlayer, isEmpty } = require('./utils/utils');

function createGameSocket(io) {
    // Place the JWT authentication middleware here:
    io.use((socket, next) => {
        // Get token from handshake.auth or query string
        const authHeader = socket?.handshake?.headers?.authorization || socket.handshake.query.token;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            socket.emit('unauthorized', 'You must be logged in to play');
        }
    
        const token = authHeader.split(' ')[1]; 
        jwt.verify(token, process.env.SESSION_SECRET, (err, decoded) => {
            if (err) {
                console.error(err);
                return next(new Error("Authentication error: Invalid token"));
            }
            socket.request.user = decoded;
            next();
        });
    });

    io.on('connection', (socket) => {

        const existing_games = {};
        const userId = socket?.request?.user?.userId;

        if (userId) {
            console.log('User connected with userId:', userId, 'and socket id:', socket.id);
        } else {
            socket.emit('unauthorized', 'You must be logged in to play');
        }

        let gameState = [];

        socket.use((packet, next) => {

            const eventName = packet[0];

            // If is joining room
            if (eventName === SOCKET_EVENTS.JOIN_ROOM) {
                next();
            }

            // Does the player socket exist ?
            var player = findGamePlayer(gameState.players, socket);
            if (!isEmpty(player)) {
                next();
            }

            //io.to(gameState.name).emit(SOCKET_EVENTS.SYNC_GAME_STATE, gameState.getSanitizedGameState(player.id));
        })
        socket.on(SOCKET_EVENTS.JOIN_ROOM, (room, nickname) => {
            let game = existing_games[room];

            // If game doesn't exist, create new one 
            // otherwise just add add the socket to the game as player
            if (!game) {
                let newGame = new Game(io, room);
                game = newGame
                existing_games[room] = newGame;
            } else {
                if (game.players?.length === 2) {
                    socket.emit(SOCKET_EVENTS.ERROR, "Game is full or already started");
                    socket.disconnect();
                    return;
                }
            }
            socket.join(room);
            game.addPlayer(socket, nickname);

            gameState = existing_games[room];

            io.to(room).emit(SOCKET_EVENTS.PLAYER_CONNECTED, nickname || socket.id);

            if (gameState.players.length === 2 && gameState.state === GAME_STATE.WAITING) {
                gameState.players.forEach(player => {
                    player.state = PLAYER_STATE.READY;
                });
                gameState.startGame();
            }
        });

        socket.on('disconnect', () => {
            socket.leaveAll(); // This ensure socket leaves all rooms
            var playerRemoved = findGamePlayer(gameState.players, socket);

            if (isEmpty(playerRemoved)) return;

            gameState.removePlayer(socket);

            io.to(gameState.name).emit(SOCKET_EVENTS.PLAYER_DISCONNECTED, playerRemoved.nickname);

            for (const gameId in existing_games) {
                if (existing_games[gameId].players.length === 0) {
                    delete existing_games[gameId];
                }
            }
        })

        socket.on(SOCKET_EVENTS.READY, () => {
            const player = findGamePlayer(gameState.players, socket);
            player.state = 'ready';
            gameState.startGame();
        });


        socket.on(SOCKET_EVENTS.PAUSE, () => {
            if (gameState.state === GAME_STATE.PLAYING) {
                gameState.state = GAME_STATE.PAUSED;
                io.to(gameState.name).emit(SOCKET_EVENTS.STATE, gameState.syncGameState(player.id));
            }
        });

        socket.on(SOCKET_EVENTS.RESUME, () => {
            if (gameState.state === GAME_STATE.PAUSED) {
                gameState.state = GAME_STATE.PLAYING;
                io.to(gameState.name).emit(SOCKET_EVENTS.STATE, gameState.syncGameState(player.id));
            }
        });

        socket.on(SOCKET_EVENTS.END, () => {
            gameState.state = GAME_STATE.FINISHED;
            io.to(gameState.name).emit(SOCKET_EVENTS.STATE, gameState.syncGameState(player.id));
        });

        socket.on(SOCKET_EVENTS.PING, () => {
            socket.emit(SOCKET_EVENTS.PONG);
        });

        socket.on(SOCKET_EVENTS.SEND_MESSAGE, (message) => {
            var player = findGamePlayer(gameState.players, socket);
            io.to(gameState.name).emit(SOCKET_EVENTS.RECEIVE_MESSAGE, player.getPlayerState(), message);
        });

        socket.on(SOCKET_EVENTS.ATTACK, () => {
            const attacker = gameState.players[gameState.currentTurn];
            const defender = gameState.players.find(p => p.id !== attacker.id);
            gameState.attack(attacker, defender);
            gameState.nextTurn();
        });

        socket.on(SOCKET_EVENTS.DRAW_CARD, () => {
            const player = findGamePlayer(gameState.players, socket);
            if (!player) {
                socket.emit(SOCKET_EVENTS.ERROR, "Player not found");
                return;
            }

            player.drawCard();
            gameState.phase = PHASE_STATE.PLAY;
            gameState.syncGameState();
        });

        socket.on(SOCKET_EVENTS.PLAY_CARD, (cardIndex) => {
            const player = findGamePlayer(gameState.players, socket);
            if (gameState.players[gameState.currentTurn].id !== player.id) {
                socket.emit(SOCKET_EVENTS.ERROR, "It's not your turn!");
                return;
            }
            gameState.playCard(player, cardIndex);
        });

        socket.on(SOCKET_EVENTS.PASS, () => {
            if (gameState.phase === 'play') {
                console.log('pass');
                gameState.phase = 'combat';
                gameState.syncGameState();
            } else if (gameState.phase === 'combat') {
                gameState.nextTurn();
            }
        });


    });

    return {
        getGames() {
            // Ensure existing_games is an object
            if (typeof existing_games !== 'object' || existing_games === null) {
                console.log("existing games is not an object.");
                return [];
            }

            // Convert the object to an array of game instances
            const gameArray = Object.values(existing_games);

            // Map over the array to get the game info
            const games = gameArray.map((game, index) => {
                if (game && typeof game.getInfo === 'function') {
                    const info = game.getInfo();
                    console.log(`game info for game at index ${index}:`, info);
                    return info;
                } else {
                    console.error(`Game at index ${index} is not properly initialized or getInfo is not a function.`);
                    return null;
                }
            });

            return games;
        }
    };
}

module.exports = createGameSocket;