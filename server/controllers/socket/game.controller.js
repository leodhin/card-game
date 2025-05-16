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

  playerPlayCard(gameId, userId, cardIndex) {
    const game = this.existingGames[gameId];
    if (!game) return;

    const player = game.getPlayer(userId);
    if (!player) return;

    game.playCard(player, cardIndex);
    game.syncGameState();
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
}

module.exports = GameController;

