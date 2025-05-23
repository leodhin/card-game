const EventEmitter = require('events');
const Game = require('../../game/Game');
const { PHASE_STATE, GAME_STATE } = require('../../utils/constants');
const { ERROR_CODES } = require('../../game/Errors');

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
    if (!game) throw Error(ERROR_CODES.GAME_NOT_FOUND);

    try {
      const player = game.getPlayer(userId);
      game.playCard(player, cardIndex);
    } catch (error) {
      throw error;
    }
  }

  playerAttack(gameId, attackerCardId, defenderCardId) {
    const game = this.games.get(gameId);
    if (!game) throw Error(ERROR_CODES.GAME_NOT_FOUND);


    const attackerCard = game.getAttacker().field.find(card => card.id === attackerCardId);
    if (!attackerCard) throw Error(ERROR_CODES.CARD_ERROR);

    const defenderCard = game.getDeffender().field.find(card => card.id === defenderCardId);
    if (!defenderCard) throw Error(ERROR_CODES.CARD_ERROR);

    game.attack(attackerCard, defenderCard);

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

  getGames() {
    return Array.from(this.games.values()).map(game => ({
      gameId: game.gameId,
      players: game.players.map(player => player.id),
      currentTurn: game.currentTurn,
      phase: game.phase,
      chat: game.chat,
    }));
  }

  getGame(gameId) {
    return this.games.get(gameId);
  }

  getGameIdByUserId(userId) {
    for (const [gameId, game] of this.games.entries()) {
      if (game?.players?.some(player => player.id === userId)) {
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

