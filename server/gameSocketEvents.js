const GameController = require('./controllers/socket/game.controller');
const { SOCKET_EVENTS } = require('./utils/constants');
const { verifySocketAuth } = require('./middleware/socket/requireAuthSocket');
const Matchmaker = require('./matchmaker');

function gameSocketEvents(io) {
  const gameNamespace = io.of('/game');
  const gameController = new GameController(gameNamespace);
  const matchmaker = new Matchmaker(io, gameController);

  // Authentication middleware for the game namespace
  gameNamespace.use(verifySocketAuth);

  // Handle connection to the game namespace
  gameNamespace.on('connection', async (socket) => {
    const userId = socket?.request?.user?.userId;
    if (!userId) {
      socket.emit(SOCKET_EVENTS.ERROR, 'User ID is missing.');
      return;
    }

    socket.on('queue-1v1', () => matchmaker.enqueue(socket));
    socket.on('cancel-queue', () => matchmaker.remove(socket.request.user.userId));

    socket.on(SOCKET_EVENTS.JOIN_ROOM, (gameId) => {
      console.log("joining room", gameId);
      // check if the user belongs to the game
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
      socket.emit(SOCKET_EVENTS.JOINED_ROOM, gameId);
      socket.emit(SOCKET_EVENTS.SYNC_GAME_STATE, game.getSanitizedGameState(userId));
    });

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
      matchmaker.remove(socket?.request?.user?.userId);
    });

    socket.on(SOCKET_EVENTS.PING, () => {
      socket.emit(SOCKET_EVENTS.PONG);
    });
  });

  return {
    getGames: () => gameController.getGames(),
  };
}

module.exports = gameSocketEvents;