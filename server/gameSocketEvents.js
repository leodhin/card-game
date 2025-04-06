const Game = require('./game/Game');
const jwt = require('jsonwebtoken');

const { GAME_STATE, PHASE_STATE, PLAYER_STATE, SOCKET_EVENTS } = require('./utils/constants');
const { findGamePlayer, isEmpty } = require('./utils/utils');
const { verifySocketAuth } = require('./middleware/socket/requireAuthSocket');
const GameController = require('./controllers/socket/gamecontroller');
const Matchmaker = require('./matchmaker');

function createGameSocket(io) {
    const gameNamespace = io.of('/game');
    const existing_games = {};
    const gameController = new GameController(gameNamespace);
    const matchmaker = new Matchmaker(gameController);

    gameNamespace.use(verifySocketAuth);
    
    gameNamespace.on('connection', (socket) => {

        const userId = socket?.request?.user?.userId;

        if (userId) {
            console.log('User connected with userId:', userId, 'and socket id:', socket.id);
        } else {
            socket.emit(SOCKET_EVENTS.UNAUTHORIZED, 'You must be logged in to play');
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

        })
        
        socket.on(SOCKET_EVENTS.JOIN_ROOM, async (room, nickname) => {
            if (!existing_games[room]) {
                console.log('Creating new game:', room);
                existing_games[room] = new Game(gameNamespace, room);
            }

            if (existing_games[room].players?.length === 2) {
                socket.emit(SOCKET_EVENTS.ERROR, "Game is full or already started");
                socket.disconnect();
                return;
            }

            socket.join(room);
            await existing_games[room].addPlayer(socket, nickname);
            gameState = existing_games[room];

            gameNamespace.to(room).emit(SOCKET_EVENTS.PLAYER_CONNECTED, nickname || socket.id);

            if (gameState.players.length === 2 && gameState.state === GAME_STATE.WAITING) {
                gameState.players.forEach(player => {
                    player.state = PLAYER_STATE.READY;
                });
                gameState.startGame();
            }
        })

        socket.on('disconnect', () => {
            socket.leaveAll(); // This ensure socket leaves all rooms
            var playerRemoved = findGamePlayer(gameState.players, socket);

            if (isEmpty(playerRemoved)) return;

            gameState.removePlayer(socket);

            gameNamespace.to(gameState.name).emit(SOCKET_EVENTS.PLAYER_DISCONNECTED, playerRemoved.nickname);

            for (const gameId in existing_games) {
                if (existing_games[gameId].players.length === 0) {
                    delete existing_games[gameId];
                }
            }
        })


        // Ping pong
        socket.on(SOCKET_EVENTS.PING, () => {
            socket.emit(SOCKET_EVENTS.PONG);
        });

        socket.on(SOCKET_EVENTS.SEND_MESSAGE, (message) => {
            var player = findGamePlayer(gameState.players, socket);
            gameNamespace.to(gameState.name).emit(SOCKET_EVENTS.RECEIVE_MESSAGE, player.getPlayerState(), message);
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
                return [];
            }

            // Convert the object to an array of game instances
            const gameArray = Object.values(existing_games);

            // Map over the array to get the game info
            const games = gameArray.map((game, index) => {
                if (game && typeof game.getInfo === 'function') {
                    const info = game.getInfo();
                    console.log(`Game info for game at index ${index}:`, info);
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