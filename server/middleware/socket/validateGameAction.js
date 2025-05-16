const { GAME_STATE, SOCKET_EVENTS } = require('../../utils/constants');

const validateGameAction = (gameController) => (socket, next) => {
    const gameId = socket.data?.gameId;
    const userId = socket?.request?.user?.userId;

    if (!gameId) {
        socket.emit(SOCKET_EVENTS.ERROR, 'Game ID missing');
        return;
    }

    const game = gameController.getGame(gameId);
    if (!game) {
        // Optionally handle missing game here
    }

    if (game.state === GAME_STATE.FINISHED) {
        socket.emit(SOCKET_EVENTS.ERROR, 'Game finished');
        return;
    }

    const player = game.getPlayer(userId);
    if (!player) {
        socket.emit(SOCKET_EVENTS.ERROR, 'Player not found');
        return;
    }

    next();
};

module.exports = validateGameAction;