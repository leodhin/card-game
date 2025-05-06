const GameController = require('./controllers/socket/game.controller');
const { SOCKET_EVENTS } = require('./utils/constants');
const { verifySocketAuth } = require('./middleware/socket/requireAuthSocket');
const Matchmaker = require('./matchmaker');

function createGameSocket(io) {
    const gameNamespace = io.of('/game');
    const gameController = new GameController(gameNamespace);
    const matchmaker = new Matchmaker(gameController);

    gameNamespace.use(verifySocketAuth);

    gameNamespace.on('connection', async (socket) => {
        const userId = socket?.request?.user?.userId;
        if (!userId) {
            socket.emit(SOCKET_EVENTS.ERROR, 'User ID is missing.');
            return;
        }

        const { gameId, socket1, socket2 } = await matchmaker.queueSocket(socket);

        if (gameId) {
            socket1.emit(SOCKET_EVENTS.GAME_START, gameId);
            socket2.emit(SOCKET_EVENTS.GAME_START, gameId);
            socket1.join(gameId);
            socket2.join(gameId);

            const game = gameController.getGame(gameId);
            gameController.startGame(gameId);
            console.log("State of user", game.getSanitizedGameState(userId));
            gameNamespace.to(gameId).emit(SOCKET_EVENTS.SYNC_GAME_STATE, game.getSanitizedGameState(userId));  
            }

        socket.on(SOCKET_EVENTS.DRAW_CARD, () => {
            gameController.playerDrawCard(gameId, userId);
        });

        socket.on(SOCKET_EVENTS.PLAY_CARD, (cardIndex) => {
            gameController.playerPlayCard(gameId, userId, cardIndex);
        });

        socket.on(SOCKET_EVENTS.ATTACK, () => {
            gameController.playerAttack(gameId, userId);
        });

        socket.on(SOCKET_EVENTS.PASS, () => {
            gameController.playerPassTurn(gameId, userId);
        });

        socket.on(SOCKET_EVENTS.SEND_MESSAGE, (message) => {
            gameController.playerSendMessage(gameId, userId, message);
        });

        socket.on('disconnect', () => {
            matchmaker.removePlayerFromQueue(socket?.request?.user?.userId);
            if (!gameId) return;
            gameNamespace.to(gameId).emit(SOCKET_EVENTS.PLAYER_DISCONNECTED, userId);
        });

        socket.on(SOCKET_EVENTS.PING, () => {
            socket.emit(SOCKET_EVENTS.PONG);
        });
    });

    return {
        getGames: () => gameController.getGames(),
    };
}

module.exports = createGameSocket;