const { v4: uuidv4 } = require('uuid');
const Game = require('../../game/Game');
const { SOCKET_EVENTS, PHASE_STATE } = require('../../utils/constants');

class GameController {
  constructor(gameNamespace) {
    this.gameNamespace = gameNamespace;
    this.games = new Map();
  }

  async createGame(gameId, userIds) {
    const game = await new Game(gameId, userIds);
    this.games.set(gameId, game);

    return gameId;
  }

  handleGameEnd(gameId) {
    this.gameNamespace.in(gameId).disconnectSockets(true);
    delete this.existingGames[gameId];
  }

  playerDrawCard(gameId, userId) {
    const game = this.existingGames[gameId];
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
    const game = this.existingGames[gameId];
    if (!game) return;

    const attacker = game.getPlayer(userId);
    const defender = game.players.find(p => p.id !== userId);
    if (!attacker || !defender) return;

    game.attack(attacker, defender);
    game.nextTurn();
    game.syncGameState();
  }

  playerPassTurn(gameId, userId) {
    const game = this.existingGames[gameId];
    if (!game) return;

    game.nextTurn();
    game.syncGameState();
  }

  playerSendMessage(gameId, userId, message) {
    const game = this.existingGames[gameId];
    if (!game) return;

    const player = game.getPlayer(userId);
    if (!player) return;

  }

  startGame(gameId) {
    const game = this.existingGames[gameId];
    if (!game) return;

    game.startGame();
  }

  getGamesList() {
    return Object.keys(this.existingGames);
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
    for (const [gameId, game] of this.games.entries()) {
      if (game.players.some(player => player.id === userId)) {
        return gameId;
      }
    }
    return null;
  }

  getMatchIdByUserId(userId) {
    for (const [gameId, game] of this.games.entries()) {
      if (game.players.some(player => player.id === userId)) {
        return gameId;
      }
    }
    return null;
  }

  getPlayerByUserId(userId) {
    for (const game of this.games.values()) {
      const player = game.getPlayer(userId);
      if (player) {
        return player;
      }
    }
    return null;
  }

}

module.exports = GameController;

