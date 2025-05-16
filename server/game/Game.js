const Player = require('./Player');
const { GAME_STATE, SOCKET_EVENTS, PLAYER_STATE, PHASE_STATE } = require('../utils/constants');
const cardPowers = require('./powers/cardPowers');
const { CardError } = require('./Errors');

class Game {
  constructor(gameId) {
    this.gameId = gameId;
    this.players = [];
    this.state = GAME_STATE.WAITING;
    this.currentTurn = 0;
    this.phase = PHASE_STATE.WAIT;

  }

  async init(userIds) {
      await Promise.all(userIds.map((userId) => this.addPlayer(userId)));
  }

  getPlayerGameState(requestingPlayerId) {
    return {
      players: this.players.map(player => {
        const state = player.getPlayerState(); 

        // Sanitize hand
        if (player.id !== requestingPlayerId) {
          state.hand = { count: state.hand.length };
        }

        // Sanitize deck
        state.deck = { count: state.deck.length };

        return state;
      }),
      state: this.state,
      currentTurn: this.currentTurn
    };
  }

  async addPlayer(userId) {
    const newPlayer = await new Player(userId);
    await newPlayer.init();

    this.players.push(newPlayer);
  
  }

  getPlayer(userId) {
    return this.players.find(player => player.id === userId);
  }


  //TODO: construir el control de errores en el resto de funciones
  playCard(player, cardId) {
    const cardIndex = player.hand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) {
      throw new CardError("Card not found in hand");
    }
    if (player.field.length > 0) {
      throw new CardError("There is already a card in the field");
    }

    const card = player.hand[cardIndex];
    if (player.mana < card.cost) {
      throw new CardError("You don't have enough mana to play this card");
    }

    player.mana -= card.cost;
    player.field.push(card);
    player.hand.splice(cardIndex, 1);
    this.phase = "combat";
    console.log("Card played", card);

    // Apply dynamic power effects if any
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
    if (!attacker.field.length > 0) {
      throw new CardError("You don't have any cards in the field to attack with");
    }

    const atkCard = attacker.field[0];

    if (!defender.field.length > 0) {
      defender.health -= atkCard.attack;

      return;
    }

    const defCard = defender.field[0];

    const extraDamageToDefender = Math.max(0, atkCard.attack - defCard.defense);
    const extraDamageToAttacker = Math.max(0, defCard.attack - atkCard.defense);

    const remainingDefCardDefense = defCard.defense - atkCard.attack;
    const remainingAtkCardDefense = atkCard.defense - defCard.attack;

    if (remainingDefCardDefense <= 0) {
      defender.field.shift();
    } else {
      defCard.defense = remainingDefCardDefense;
    }

    if (remainingAtkCardDefense <= 0) {
      attacker.field.shift();
    } else {
      atkCard.defense = remainingAtkCardDefense;
    }

    defender.health -= extraDamageToDefender;
    attacker.health -= extraDamageToAttacker;

    this.phase = "wait";

    if (defender.health <= 0 || attacker.health <= 0) {
      this.endGame();
    } else {

    }
  }

  nextTurn() {
    this.currentTurn = (this.currentTurn + 1) % this.players.length;
    const currentPlayer = this.players[this.currentTurn];

    this.phase = PHASE_STATE.DRAW;
    currentPlayer.regenerateMana();
    currentPlayer.drawCard();

    this.phase = PHASE_STATE.PLAY;

  }

  startGame() {
    console.log('Starting game', this.gameId);
    console.log('Players:', this.players.map(player => player.id));
    if (this.players.length >= 2) {

      // TODO: esta logica va en elcontroller
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

    setTimeout(() => {
      for (const player of this.players) {
        player.state = PLAYER_STATE.WAITING;
      }


    }, 3000);
  }

  checkEndGame() {
    return this.players.filter(player => player.state === PLAYER_STATE.PLAYING).length == 1;
  }

}

module.exports = Game;
