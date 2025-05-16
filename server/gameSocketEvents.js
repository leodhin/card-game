const GameController = require('./controllers/socket/game.controller');
const { SOCKET_EVENTS } = require('./utils/constants');
const { verifySocketAuth } = require('./middleware/socket/requireAuthSocket');
const Matchmaker = require('./matchmaker');

const { CardError } = require('./game/Errors');
const validateGameAction = require('./middleware/socket/validateGameAction');


function gameSocketEvents(io) {
    const gameNamespace = io.of('/game');
    const gameController = new GameController(gameNamespace);
    const matchmaker = new Matchmaker(io, gameController);

    // Authentication middleware for the game namespace
    gameNamespace.use(verifySocketAuth);

    // Handle connection to the game namespace
    gameNamespace.on('connection', async (socket) => {
        const userId = socket?.request?.user?.userId;

        //TODO: terminar esta logica
        /*socket.use((event, next) => {
            validateGameAction(gameController)(socket, next);
        });
        */

        socket.on('queue-1v1', () => matchmaker.enqueue(socket));
        socket.on('cancel-queue', () => matchmaker.remove(socket.request.user.userId));

        // Joining a room
        socket.on(SOCKET_EVENTS.JOIN_ROOM, (gameId) => {
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
            socket.data.gameId = gameId;
            socket.emit(SOCKET_EVENTS.JOINED_ROOM, gameId);
            socket.emit(SOCKET_EVENTS.SYNC_GAME_STATE, game.getSanitizedGameState(userId));
        });

        socket.on(SOCKET_EVENTS.DRAW_CARD, () => {
            gameController.playerDrawCard(gameId, userId);
        });

        // Listen for the event when a player plays a card
        socket.on(SOCKET_EVENTS.PLAY_CARD, (cardIndex) => {
            try {
                gameController.playerPlayCard(userId, cardIndex);
                syncGameState();
            } catch (error) {
                if (error instanceof CardError) {
                    socket.emit(SOCKET_EVENTS.ERROR, error.message);
                } else {
                    console.error('Error playing card:', error);
                    socket.emit(SOCKET_EVENTS.ERROR, 'An error occurred while playing the card.');
                }
            }

        });

        socket.on(SOCKET_EVENTS.ATTACK, () => {
            //TODO: copiar estrcutura de playerPlayCard con try catch
            gameController.playerAttack(gameId, userId);
        });

        socket.on(SOCKET_EVENTS.PASS, () => {
            //TODO: copiar estrcutura de playerPlayCard con try catch
            gameController.playerPassTurn(gameId, userId);
        });

        socket.on(SOCKET_EVENTS.SEND_MESSAGE, (message) => {
            //TODO: copiar estrcutura de playerPlayCard con try catch
            gameController.playerSendMessage(gameId, userId, message);
        });

        socket.on('disconnect', () => {
            matchmaker.remove(socket?.request?.user?.userId);
        });

        socket.on(SOCKET_EVENTS.PING, () => {
            socket.emit(SOCKET_EVENTS.PONG);
        });
    });

    return {
        getGames: () => gameController.getGames(),
    };

    async function syncGameState(gameId) {
        const socketIds = await io.in(gameId).allSockets();
        socketIds.forEach(socketId => {
            const socket = io.sockets.sockets.get(socketId);
            if (socket) {
                socket.emit(
                    SOCKET_EVENTS.SYNC_GAME_STATE,
                    gameController.getPlayerGameState(socket.request.user.userId)  
                );
            }
        });
    }
}



module.exports = gameSocketEvents;