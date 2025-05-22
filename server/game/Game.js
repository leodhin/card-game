const Player = require('./Player');
const { GAME_STATE, SOCKET_EVENTS, PLAYER_STATE, PHASE_STATE } = require('../utils/constants');
const cardPowers = require('./powers/cardPowers');
const { CardError, GameError, NotEnoughManaError } = require('./Errors');
const { getUserById } = require('../services/User.service');

class Game {
  constructor(gameId, userIds) {
    this.gameId = gameId;
    this.players = [];
    this.state = GAME_STATE.WAITING;
    this.currentTurn = 0;
    this.phase = PHASE_STATE.WAIT;
    this.chat = [];
    this.init(userIds);
  }

  async init(userIds) {
    await Promise.all(userIds.map((userId) => this.addPlayer(userId)));
  }

  getSanitizedGameState(requestingPlayerId) {
    return {
      players: this.players.map(player => {
        const state = player.getPlayerState();

        // Sanitize hand
        if (player.id !== requestingPlayerId) {
          state.hand = { count: state.hand.length };
        }

        state.field = state.field;

        // Sanitize deck
        state.deck = { count: state.deck.length };

        return state;
      }),
      state: this.state,
      currentTurn: this.currentTurn
    };
  }

  async addPlayer(userId) {
    const player = await getUserById(userId);
    const newPlayer = await new Player(userId, player.nickname);

    this.players.push(newPlayer);
  }

  getPlayer(userId) {
    return this.players.find(player => player.id === userId);
  }

  playCard(player, cardId) {
    const cardIndex = player.hand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) {
      throw new CardError("Card not found in hand");
    }

    const card = player.hand[cardIndex];
    if (player.mana < card.cost) {
      throw new NotEnoughManaError();
    }

    player.mana -= card.cost;
    player.field.push(card);
    player.hand.splice(cardIndex, 1);

    if (card.power) {
      const effects = Array.isArray(card.power) ? card.power : [card.power];
      const opponent = this.players.find(p => p.id !== player.id);
      effects.forEach(effectKey => {
        if (cardPowers[effectKey] && typeof cardPowers[effectKey].applyEffect === 'function') {
          cardPowers[effectKey].applyEffect(this, player, opponent);
        }
      });
    }
  }

  attack(attacker, defender) {
    // @TODO attack dmg

    this.endGame();
    if (defender.health <= 0 || attacker.health <= 0) {
      this.endGame();
    }
  }

  nextTurn() {
    this.currentTurn = this.currentTurn + 1 >= this.players.length ? 0 : this.currentTurn + 1;
    const currentPlayer = this.players[this.currentTurn];
    currentPlayer.regenerateMana();
    currentPlayer.drawCard();
  }

  startGame() {
    console.log('Starting game', this.gameId);
    console.log('Players:', this.players.map(player => player.id));
    if (this.players.length >= 2) {

      for (let player of this.players) {
        player.state = PLAYER_STATE.WAITING;
      }

      this.currentTurn = 0;
      this.players[this.currentTurn].state = PLAYER_STATE.PLAYING;
      this.state = GAME_STATE.PLAYING;
      this.phase = PHASE_STATE.DRAW;

      this.players[this.currentTurn].drawCard();

      if (this.players[this.currentTurn].socket) {
        this.players[this.currentTurn].socket.emit(SOCKET_EVENTS.DRAW_CARD);
      }

      this.phase = PHASE_STATE.PLAY;

    } else {
      console.log('Not enough players');
    }
  }


  pauseGame() {
    if (this.state === GAME_STATE.PLAYING) {
      this.state = GAME_STATE.PAUSED;
    }
  }

  resumeGame() {
    if (this.state === GAME_STATE.PAUSED) {
      this.state = GAME_STATE.PLAYING;
    }
  }

  endGame() {
    this.state = GAME_STATE.FINISHED;
  }

  checkEndGame() {
    return this.players.filter(player => player.state === PLAYER_STATE.PLAYING).length == 1;
  }

  sendMessage(player, message) {
    const sanitizedMessage = message.replace(/<[^>]*>/g, ''); // Sanitize HTML tags
    const sanitizedPlayerName = player.name.replace(/<[^>]*>/g, ''); // Sanitize HTML tags
    const sanitizedMessageObject = {
      player: sanitizedPlayerName,
      message: sanitizedMessage,
      timestamp: new Date().toISOString()
    };
    this.chat.push(sanitizedMessageObject);

    return this.chat;
  }
}

module.exports = Game;
