const { SOCKET_EVENTS } = require('../utils/constants');
const { verifySocketAuth } = require('../middleware/socket/requireAuthSocket');
const Matchmaker = require('../matchmaker');


const SOCKET_ERRORS = {
  ALREADY_IN_QUEUE: 'ALREADY_IN_QUEUE',
  ALREADY_IN_GAME: 'ALREADY_IN_GAME',
}

function setupLobbyNamespaceEvents(io, gameController) {
  const gameNamespace = io.of('/lobby');
  const matchmaker = new Matchmaker(io, gameController);

  // Authentication middleware for the game namespace
  gameNamespace.use(verifySocketAuth);

  // Handle connection to the game namespace
  gameNamespace.on('connection', async (socket) => {
    const userId = socket?.request?.user?.userId;

    // Check if the user is already in a game
    const gameId = gameController.getGameIdByUserId(userId);
    if (gameId) {
      socket.emit(SOCKET_EVENTS.ERROR, {
        message: SOCKET_ERRORS.ALREADY_IN_GAME,
        roomId: gameId
      });
    }

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
        socket.emit(SOCKET_EVENTS.ERROR,
          {
            message: SOCKET_ERRORS.ALREADY_IN_QUEUE,
          }
        );
        return;
      }

      // Check if the user is already in a game
      const gameId = gameController.getGameIdByUserId(userId);
      if (gameId) {
        socket.emit(SOCKET_EVENTS.ERROR, {
          message: SOCKET_ERRORS.ALREADY_IN_GAME,
          roomId: gameId
        });
        return;
      }

      next();
    });


    socket.on('queue-1v1', () => matchmaker.enqueue(socket));
    socket.on('cancel-queue', () => matchmaker.remove(socket.request.user.userId));


    socket.on('disconnect', () => {
      matchmaker.remove(socket?.request?.user?.userId);
    });

    socket.on(SOCKET_EVENTS.PING, () => {
      socket.emit(SOCKET_EVENTS.PONG);
    });
  });

}

module.exports = setupLobbyNamespaceEvents;