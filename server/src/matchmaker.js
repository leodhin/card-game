// Matchmaker.js
const { v4: uuidv4 } = require('uuid');

const { logMatchHistory } = require('./services/game.service');
const { getUserById } = require('./services/User.service');

class Matchmaker {
  constructor(io, gameController) {
    this.io = io;
    this.gameController = gameController;
    this.waiting = new Map();
  }

  enqueue(socket) {
    const userId = socket.request?.user?.userId;
    if (!userId) return socket.disconnect(true);

    console.log("[QUEUE] Enqueueing user...", userId);

    if (this.waiting.has(userId)) return;
    this.waiting.set(userId, socket);

    socket.once('disconnect', () => this.remove(userId));

    this._tryMatch();
  }

  remove(userId) {
    if (this.waiting.delete(userId)) {
      console.log(`[MATCHMAKER] ${userId} left queue`);
    }
  }

  async _tryMatch() {
    if (this.waiting.size < 2) return;

    const [id1, id2] = this.waiting.keys();
    const sock1 = this.waiting.get(id1);
    const sock2 = this.waiting.get(id2);

    this.waiting.delete(id1);
    this.waiting.delete(id2);

    const roomId = uuidv4();
    // Get the nicknames of the players
    const player1 = await getUserById(id1);
    const player2 = await getUserById(id2);
    const game = await this.gameController.createGame(roomId, [id1, id2]);

    const payload = { gameId: game.gameId, roomId, players: [id1, id2] };

    // Notify both players that they have been matched
    sock1.emit('match-found', payload);
    sock2.emit('match-found', payload);

    console.info(`[MATCHMAKER] Matched ${player1.nickname} vs ${player2.nickname} → room ${roomId}, game ${game.gameId}`);

    logMatchHistory({
      gameId: game?.gameId,
      players: [id1, id2],
      roomId,
      status: 'in-progress',
      createdAt: new Date(),
    }).catch(err => console.error('Error logging match history:', err));
  }

  getQueueIdByUserId(userId) {
    return this.waiting.get(userId);
  }
}

module.exports = Matchmaker;
