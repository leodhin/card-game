const Player = require('./Player');
const { GAME_STATE, SOCKET_EVENTS, PLAYER_STATE, PHASE_STATE } = require('../utils/constants');
const cardPowers = require('./powers/cardPowers');

class Game {
    constructor(io, room) {
        this.io = io;
        this.name = room;
        this.players = [];
        this.state = GAME_STATE.WAITING;
        this.gameInterval = null;
        this.TICK_RATE = 60;
        this.GAME_SPEED = 1000 / this.TICK_RATE;
        this.currentTurn = 0;
        this.phase = PHASE_STATE.WAIT;
    }

    getInfo() {
        return {
            players: this.players.length,
            name: this.name,
        }
    }

    getSanitizedGameState(requestingPlayerId) {
        return {
            players: this.players.map(player => {
                const state = player.getPlayerState();
                if (!Array.isArray(state.hand)) {
					state.hand = [];
				}
                
                if (player.id !== requestingPlayerId) {
                    state.hand = { count: state.hand ? state.hand.length : 0 };
                }
                return state;
            }),
            state: this.state,
            tick: this.tick,
            currentTurn: this.currentTurn,
            phase: this.phase
        };
    }

	syncGameState() {
		this.players.forEach(player => {
			player.socket.emit(
				SOCKET_EVENTS.SYNC_GAME_STATE,
				this.getSanitizedGameState(player.id)
			);
		});
	}

    addPlayer(socket, nickname) {
        const newPlayer = this.state == GAME_STATE.PLAYING ? new Player(socket) : new Player(socket);
        newPlayer.state = PLAYER_STATE.WAITING;
        newPlayer.nickname = nickname;
        this.players.push(newPlayer);
        this.syncGameState();
    }

    removePlayer(playerDisconnectedSocket) {
        if (playerDisconnectedSocket) {
            var playerLeft = this.players.filter(player => player.id == playerDisconnectedSocket.id)[0];
            this.players = this.players.filter(player => player.id !== playerDisconnectedSocket.id);
            
            if (this.players.length < 2) {
                this.state = GAME_STATE.WAITING;
            }
            this.io.to(this.name).emit(SOCKET_EVENTS.CLEAR);
            this.syncGameState();
        }
    }

    playCard(player, cardId) {
        const cardIndex = player.hand.findIndex(c => c.id === cardId);
        if (cardIndex === -1) {
            player.socket.emit(SOCKET_EVENTS.ERROR, "Card not found in hand");
            return;
        }
        if (player.field.length > 0) {
            player.socket.emit('error', "There is already a card in the field");
            return;
        }

        const card = player.hand[cardIndex];
        if (player.energy < card.cost) {
            player.socket.emit(SOCKET_EVENTS.ERROR, "You don't have enough energy to play this card");
            return;
        }
        player.energy -= card.cost;
        player.field.push(card);
        player.hand.splice(cardIndex, 1);
        this.phase = "combat";
        console.log("Card played", card);

        // Apply dynamic power effects if any
        if (card.power) {
            // If the power property is a string, convert it to an array for iteration
            const effects = Array.isArray(card.power) ? card.power : [card.power];
            const opponent = this.players.find(p => p.id !== player.id);
            effects.forEach(effectKey => {
                if (cardPowers[effectKey] && typeof cardPowers[effectKey].applyEffect === 'function') {
                    cardPowers[effectKey].applyEffect(this, player, opponent);
                }
		});
	}
        this.syncGameState();
    }

    attack(attacker, defender) {
        if (!attacker.field.length > 0) {
            attacker.socket.emit(SOCKET_EVENTS.ERROR, "You cannot attack without a card in the field");
            return;
        }

        const atkCard = attacker.field[0];

        if (!defender.field.length > 0) {
            defender.health -= atkCard.attack;
            this.syncGameState();
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
            this.syncGameState();
        }
}


    nextTurn() {
        this.currentTurn = (this.currentTurn + 1) % this.players.length;
        const currentPlayer = this.players[this.currentTurn];

        this.phase = PHASE_STATE.DRAW;
        currentPlayer.energy += 1;
        currentPlayer.drawCard();
        this.syncGameState();

        this.phase = PHASE_STATE.PLAY;
        this.syncGameState();
    }      

    startGame() {
        if (this.players.length >= 2) {
            let allPlayersReady = true;
    
            for (let player of this.players) {
                if (player.state !== PLAYER_STATE.READY) {
                    allPlayersReady = false;
                    break;
                }
            }
    
            if (allPlayersReady) {
                for (let player of this.players) {
                    player.initDeck();
                    player.state = PLAYER_STATE.WAITING;
                }
            
			this.currentTurn = 0;
			this.players[this.currentTurn].state = PLAYER_STATE.PLAYING;
			this.state = GAME_STATE.PLAYING;
			this.phase = PHASE_STATE.DRAW;
            this.syncGameState();
            }
        }

        this.players[this.currentTurn].drawCard();
        this.players[this.currentTurn].socket.emit(SOCKET_EVENTS.DRAW_CARD);
        this.phase = PHASE_STATE.PLAY;
        this.syncGameState();
    }

    pauseGame() {
        if (this.state === GAME_STATE.PLAYING) {
            this.state = GAME_STATE.PAUSED;
            this.syncGameState();
        }
    }

    resumeGame() {
        if (this.state === GAME_STATE.PAUSED) {
            this.state = GAME_STATE.PLAYING;
            this.syncGameState();
        }
    }

    endGame() {
        this.io.to(this.name).emit(SOCKET_EVENTS.GAME_OVER);
        this.state = GAME_STATE.FINISHED;
        clearInterval(this.gameInterval);

        setTimeout(()=>{
            for (const player of this.players) {
                player.state = PLAYER_STATE.WAITING;
            }
            this.io.to(this.name).emit(SOCKET_EVENTS.CLEAR);
            this.syncGameState();
        },3000); 
    }

    gameLoop() {
        if (this.state === GAME_STATE.PLAYING) {  
            this.syncGameState();
            }
    }

    checkEndGame() {
        return this.players.filter(player => player.state === PLAYER_STATE.PLAYING).length == 1;
    }

}

module.exports = Game;
