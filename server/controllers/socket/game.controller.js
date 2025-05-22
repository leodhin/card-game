const { v4: uuidv4 } = require('uuid');
const EventEmitter = require('events');
const Game = require('../../game/Game');
const { SOCKET_EVENTS, PHASE_STATE, GAME_STATE } = require('../../utils/constants');

class GameController extends EventEmitter {
  constructor() {
    super();
    this.games = new Map();
  }

  async createGame(gameId, userIds) {
    const game = await new Game(gameId, userIds);
    this.games.set(gameId, game);
    return gameId;
  }

  handleGameEnd(gameId) {
    const game = this.games.get(gameId);
    if (game) {
      this.games.delete(gameId);
      this.emit('gameFinished', gameId);
    }
  }

  playerDrawCard(gameId, userId) {
    const game = this.games.get(gameId);
    if (!game) return;

    const player = game.getPlayer(userId);
    if (!player) return;

    player.drawCard();
    game.phase = PHASE_STATE.PLAY;
    game.syncGameState();
  }

  playerPlayCard(userId, cardIndex) {
    const game = Array.from(this.games.values()).find(game => game.getPlayer(userId));
    if (!game) return;

    try {
      const player = game.getPlayer(userId);
      game.playCard(player, cardIndex);
    } catch (error) {
      throw error;
    }
  }

  playerAttack(gameId, userId) {
    const game = this.games.get(gameId);
    if (!game) return;

    const attacker = game.getPlayer(userId);
    const defender = game.players.find(p => p.id !== userId);
    if (!attacker || !defender) return;

    game.attack(attacker, defender);

    if (this.isGameOver(gameId)) {
      this.handleGameEnd(gameId);
      return;
    }
    game.nextTurn();
  }

  isGameOver(gameId) {
    const game = this.games.get(gameId);
    return game?.state === GAME_STATE.FINISHED;
  }

  playerPassTurn(gameId, userId) {
    const game = this.games.get(gameId);
    if (!game) return;

    game.nextTurn();
  }

  playerSendMessage(gameId, userId, message) {
    const game = this.games.get(gameId);
    if (!game) return;

    const player = game.getPlayer(userId);
    if (!player) return;

    return game.sendMessage(player, message);
  }

  startGame(gameId) {
    const game = this.games.get(gameId);
    if (!game) return;
    game.startGame();
  }

  getGamesList() {
    return Array.from(this.games.keys());
  }

  getGames() {
    return this.games;
  }

  getGame(gameId) {
    return this.games.get(gameId);
  }

  getGameIdByUserId(userId) {
    for (const [gameId, game] of this.games.entries()) {
      if (game.players.some(player => player.id === userId)) {
        return gameId;
      }
    }
    return null;
  }

  getRoomIdByUserId(userId) {
    return this.getGameIdByUserId(userId);
  }

  getMatchIdByUserId(userId) {
    return this.getGameIdByUserId(userId);
  }

  getPlayerByUserId(userId) {
    for (const game of this.games.values()) {
      const player = game.getPlayer(userId);
      if (player) return player;
    }
    return null;
  }
}

module.exports = GameController;

