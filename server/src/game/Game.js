const Player = require('./Player');
const { GAME_STATE, SOCKET_EVENTS, PLAYER_STATE, PHASE_STATE } = require('../utils/constants');
const cardPowers = require('./powers/cardPowers');
const { CardError, PlayerFieldFullError, GameError, NotEnoughManaError } = require('./Errors');
const { getUserById } = require('../services/User.service');

class Game {
  constructor(gameId, userIds) {
    this.gameId = gameId;
    this.players = new Map();
    this.state = GAME_STATE.WAITING;
    this.currentTurn = null;
    this.phase = PHASE_STATE.WAIT;
    this.chat = [];
    this.init(userIds);
  }

  async init(userIds) {
    await Promise.all(userIds.map((userId) => this.addPlayer(userId)));
    if (this.players.size > 0) {
      this.currentTurn = Array.from(this.players.keys())[0];
    }
  }

  getSanitizedGameState(requestingPlayerId) {
    const playersState = [];
    for (const player of this.players.values()) {
      const state = player.getPlayerState();
      if (player.id !== requestingPlayerId) {
        state.hand = { count: state.hand.length };
      }
      state.deck = { count: state.deck.length };
      playersState.push(state);
    }
    return {
      players: playersState,
      state: this.state,
      currentTurn: this.currentTurn
    };
  }

  async addPlayer(userId) {
    const playerData = await getUserById(userId);
    const newPlayer = new Player(userId, playerData.nickname);
    this.players.set(userId, newPlayer);
  }

  getPlayer(userId) {
    return this.players.get(userId);
  }

  getAttacker() {
    return this.players.get(this.currentTurn);
  }

  getDeffender() {
    const keys = Array.from(this.players.keys());
    const currentIndex = keys.indexOf(this.currentTurn);
    const nextIndex = (currentIndex + 1) % keys.length;
    return this.players.get(keys[nextIndex]);
  }

  playCard(player, cardId) {
    const cardIndex = player.hand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) {
      throw new CardError();
    }
    const card = player.hand[cardIndex];

    if (player.field.length >= 5) {
      throw new PlayerFieldFullError();
    }

    if (player.mana < card.cost) {
      throw new NotEnoughManaError();
    }

    player.field.push(card);
    player.hand.splice(cardIndex, 1);
    player.mana -= card.cost;

    if (card.power) {
      const effects = Array.isArray(card.power) ? card.power : [card.power];
      let opponent = null;
      for (const [id, p] of this.players) {
        if (id !== player.id) {
          opponent = p;
          break;
        }
      }
      effects.forEach(effectKey => {
        if (cardPowers[effectKey] && typeof cardPowers[effectKey].applyEffect === 'function') {
          cardPowers[effectKey].applyEffect(this, player, opponent);
        }
      });
    }
  }

  attack(attackerCard, defenderCard) {
    if (!attackerCard || !defenderCard) { throw new CardError(); }

    const defender = this.getDeffender();
    const attacker = this.getAttacker();

    if (defenderCard) {
      defenderCard.defense -= attackerCard.attack;
      attackerCard.defense -= defenderCard.attack;

      if (defenderCard.defense <= 0) {
        const index = this.getDeffender().field.findIndex(card => card.id === defenderCard.id);
        if (index !== -1) defender.field.splice(index, 1);
      }
      if (attackerCard.defense <= 0) {
        const index = attacker.field.findIndex(card => card.id === attackerCard.id);
        if (index !== -1) attacker.field.splice(index, 1);
      }
    } else {
      // Direct attack
      defender.health -= attackerCard.attack;
      if (defender.health <= 0) this.endGame();
    }
  }

  nextTurn() {
    const keys = Array.from(this.players.keys());
    if (!this.currentTurn) return;
    const currentIndex = keys.indexOf(this.currentTurn);
    const nextIndex = (currentIndex + 1) % keys.length;
    this.currentTurn = keys[nextIndex];
    const currentPlayer = this.players.get(this.currentTurn);
    currentPlayer.regenerateMana();
    currentPlayer.drawCard();
  }

  startGame() {
    console.log('Starting game', this.gameId);
    console.log('Players:', Array.from(this.players.keys()));
    if (this.players.size >= 2) {
      for (const player of this.players.values()) {
        player.state = PLAYER_STATE.WAITING;
      }
      // Set the first player as the one whose turn it is
      this.currentTurn = Array.from(this.players.keys())[0];
      const firstPlayer = this.players.get(this.currentTurn);
      firstPlayer.state = PLAYER_STATE.PLAYING;
      this.state = GAME_STATE.PLAYING;
      this.phase = PHASE_STATE.DRAW;

      firstPlayer.drawCard();

      if (firstPlayer.socket) {
        firstPlayer.socket.emit(SOCKET_EVENTS.DRAW_CARD);
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
    let playingCount = 0;
    for (const player of this.players.values()) {
      if (player.state === PLAYER_STATE.PLAYING) {
        playingCount++;
      }
    }
    return playingCount === 1;
  }

  sendMessage(player, message) {
    const sanitizedMessage = message.replace(/<[^>]*>/g, '');
    const sanitizedPlayerName = player.name.replace(/<[^>]*>/g, '');
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
