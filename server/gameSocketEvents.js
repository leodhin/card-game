const GameController = require('./controllers/socket/game.controller');
const { SOCKET_EVENTS } = require('./utils/constants');
const { verifySocketAuth } = require('./middleware/socket/requireAuthSocket');
const Matchmaker = require('./matchmaker');
const { updateMatchHistory } = require('./services/game.service');

const { NotEnoughManaError, PlayerFieldFullError, ERROR_CODES } = require('./game/Errors');

function gameSocketEvents(io) {
    const gameNamespace = io.of('/game');
    const gameController = new GameController(gameNamespace);
    const matchmaker = new Matchmaker(io, gameController);

    // Authentication middleware for the game namespace
    gameNamespace.use(verifySocketAuth);

    // Handle connection to the game namespace
    gameNamespace.on('connection', async (socket) => {
        const userId = socket?.request?.user?.userId;

        socket.use(async (event, next) => {
            if (!userId) {
                socket.emit(SOCKET_EVENTS.ERROR, 'User ID is missing.');
                return;
            }

            // check if the user is authenticated
            if (!socket.request.user) {
                socket.emit(SOCKET_EVENTS.UNAUTHORIZED, 'You must be logged in to play');
                return;
            }

            // check if the user is already in a queue
            const queueId = matchmaker.getQueueIdByUserId(userId);
            if (queueId) {
                socket.emit(SOCKET_EVENTS.ERROR, 'You are already in a queue.');
                return;
            }

            // Check if the game has already finished
            const gameId = socket.request.gameId;

            if (gameId && gameController.isGameOver(gameId)) {
                socket.emit(SOCKET_EVENTS.ERROR, 'The game has already finished.');
                return;
            }

            next();
        });


        socket.on('queue-1v1', () => matchmaker.enqueue(socket));
        socket.on('cancel-queue', () => matchmaker.remove(socket.request.user.userId));

        // Joining a room
        socket.on(SOCKET_EVENTS.JOIN_ROOM, (gameId) => {
            console.log("joining room", gameId);
            const game = gameController.getGame(gameId);
            if (!game) {
                socket.emit(SOCKET_EVENTS.ERROR, 'Game not found.');
                return;
            }
            const player = game.getPlayer(userId);
            if (!player) {
                socket.emit(SOCKET_EVENTS.ERROR, 'You are not a player in this game.');
                return;
            }
            socket.join(gameId);
            socket.request.gameId = gameId;
            socket.emit(SOCKET_EVENTS.JOINED_ROOM, gameId);
            socket.emit(SOCKET_EVENTS.SYNC_GAME_STATE, game.getSanitizedGameState(userId));
        });

        socket.on(SOCKET_EVENTS.DRAW_CARD, () => {
            gameController.playerDrawCard(gameId, userId);
        });

        socket.on(SOCKET_EVENTS.PLAY_CARD, async (cardIndex) => {
            try {
                const gameId = socket.request.gameId;
                gameController.playerPlayCard(userId, cardIndex);
                await updatePlayersGameState(gameId);
            } catch (error) {
                if (error instanceof NotEnoughManaError) {
                    socket.emit(SOCKET_EVENTS.ERROR, ERROR_CODES.NOT_ENOUGH_MANA);
                    return;
                }
                else if (error instanceof PlayerFieldFullError) {
                    socket.emit(SOCKET_EVENTS.ERROR, ERROR_CODES.PLAYER_FIELD_FULL);
                    return;
                }

                console.error('Error playing card:', error);
                socket.emit(SOCKET_EVENTS.ERROR, 'An error occurred while playing the card.');
            }
        });

        socket.on(SOCKET_EVENTS.ATTACK, async (attackerCardId, defenderCardId) => {
            try {
                const gameId = socket.request.gameId;
                gameController.playerAttack(gameId, userId, attackerCardId, defenderCardId);
                await updatePlayersGameState(gameId);
            }
            catch (error) {
                console.error('Error attacking:', error);
                socket.emit(SOCKET_EVENTS.ERROR, 'An error occurred while attacking.');
            }
        });

        socket.on(SOCKET_EVENTS.PASS, async () => {
            try {
                const gameId = socket.request.gameId;
                gameController.playerPassTurn(gameId, userId);
                await updatePlayersGameState(gameId);
            }
            catch (error) {
                console.error('Error passing turn:', error);
                socket.emit(SOCKET_EVENTS.ERROR, 'An error occurred while passing the turn.');
            }
        });

        socket.on(SOCKET_EVENTS.SEND_MESSAGE, (message) => {
            try {
                const gameId = socket.request.gameId;
                const chat = gameController.playerSendMessage(gameId, userId, message);
                gameNamespace.to(gameId).emit(SOCKET_EVENTS.RECEIVE_MESSAGE, chat);
            }
            catch (error) {
                console.error('Error sending message:', error);
                socket.emit(SOCKET_EVENTS.ERROR, 'An error occurred while sending the message.');
            }
        });

        socket.on('disconnect', () => {
            matchmaker.remove(socket?.request?.user?.userId);
        });

        socket.on(SOCKET_EVENTS.PING, () => {
            socket.emit(SOCKET_EVENTS.PONG);
        });
    });

    // Listen for game state changes and update players
    gameController.on('gameFinished', (gameId) => {
        console.log(`Game finished: ${gameId}`);
        updateMatchHistory(gameId, { status: "finished" }).catch(err => console.error('Error updating match history:', err));
    });

    // Helper function to update players' game state
    const updatePlayersGameState = async (gameId) => {
        const game = gameController.getGame(gameId);
        if (!game) return;

        await gameNamespace.in(gameId).fetchSockets().then((sockets) => {
            sockets.forEach((socket) => {
                const userId = game.getPlayer(socket.request.user.userId);
                if (userId) {
                    socket.emit(SOCKET_EVENTS.SYNC_GAME_STATE, game.getSanitizedGameState(userId.id));
                }
            });
        });
    }

    return {
        getActiveGames: () => gameController.getGames(),
    };
}

module.exports = gameSocketEvents;