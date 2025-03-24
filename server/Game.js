const Player = require('./Player');
const { GAME_STATE, SOCKET_EVENTS, PLAYER_STATE, PHASE_STATE } = require('./constants');

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
				if (player.id !== requestingPlayerId) {
					state.hand = { count: state.hand.length };
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
        const newPlayer = this.state == GAME_STATE.PLAYING ? new Player(socket, color,0,0) : new Player(socket, color);
        newPlayer.state = PLAYER_STATE.WAITING;
        newPlayer.nickname = nickname;
        this.players.push(newPlayer);
        this.io.to(this.name).emit(SOCKET_EVENTS.SYNC_GAME_STATE, this.getGameState()); 
    }

    removePlayer(playerDisconnectedSocket) {
        if (playerDisconnectedSocket) {
            var playerLeft = this.players.filter(player => player.id == playerDisconnectedSocket.id)[0];
            this.players = this.players.filter(player => player.id !== playerDisconnectedSocket.id);
            
            if (this.players.length < 2) {
                this.state = GAME_STATE.WAITING;
            }
            this.io.to(this.name).emit(SOCKET_EVENTS.CLEAR);
            this.io.to(this.name).emit(SOCKET_EVENTS.SYNC_GAME_STATE, this.getGameState());
        }
    }

    playCard(player, cardIndex) {
        const card = player.hand[cardIndex];
        if (!card) return;
        if (player.energy < card.cost) {
            player.socket.emit(SOCKET_EVENTS.ERROR, "No tienes suficiente energía para jugar esta carta");
            return;
        }
        player.energy -= card.cost;
        player.field = card;
        player.hand.splice(cardIndex, 1);
        this.phase = "combat";
        this.io.to(this.name).emit(SOCKET_EVENTS.SYNC_GAME_STATE, this.getGameState());
    }

    attack(attacker, defender) {
        if (!attacker.field) {
            attacker.socket.emit(SOCKET_EVENTS.ERROR, "No puedes atacar sin una carta en el campo");
            return;
        }

        const atkCard = attacker.field;

        if (!defender.field) {
            defender.health -= atkCard.attack;
            this.io.to(this.name).emit(SOCKET_EVENTS.SYNC_GAME_STATE, this.getGameState());
            return;
        }

        const defCard = defender.field;

        const extraDamageToDefender = Math.max(0, atkCard.attack - defCard.defense);
        const extraDamageToAttacker = Math.max(0, defCard.attack - atkCard.defense);

        const remainingDefCardDefense = defCard.defense - atkCard.attack;
        const remainingAtkCardDefense = atkCard.defense - defCard.attack;

        if (remainingDefCardDefense <= 0) {
            defender.field = null;
        } else {
            defCard.defense = remainingDefCardDefense;
        }

        if (remainingAtkCardDefense <= 0) {
            attacker.field = null;
        } else {
            atkCard.defense = remainingAtkCardDefense;
        }

        defender.health -= extraDamageToDefender;
        attacker.health -= extraDamageToAttacker;

        this.phase = "wait";

        if (defender.health <= 0 || attacker.health <= 0) {
            this.endGame();
        } else {
            this.io.to(this.name).emit(SOCKET_EVENTS.SYNC_GAME_STATE, this.getGameState());
        }
}


    nextTurn() {
        this.currentTurn = (this.currentTurn + 1) % this.players.length;
        const currentPlayer = this.players[this.currentTurn];

        this.phase = PHASE_STATE.DRAW;
        currentPlayer.energy += 1;
        currentPlayer.drawCard();
        this.io.to(this.name).emit(SOCKET_EVENTS.SYNC_GAME_STATE, this.getGameState());

        this.phase = PHASE_STATE.COMBAT;
        this.io.to(this.name).emit(SOCKET_EVENTS.SYNC_GAME_STATE, this.getGameState());
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
                    player.state = PLAYER_STATE.PLAYING;
                }
                this.state = GAME_STATE.PLAYING;
                if (this.gameInterval) clearInterval(this.gameInterval);
                this.gameInterval = setInterval(() => this.gameLoop(), this.GAME_SPEED);
            }
        }
        this.io.to(this.name).emit(SOCKET_EVENTS.SYNC_GAME_STATE, this.getGameState());
    }

    pauseGame() {
        if (this.state === GAME_STATE.PLAYING) {
            this.state = GAME_STATE.PAUSED;
            this.io.to(this.name).emit(SOCKET_EVENTS.SYNC_GAME_STATE, this.getGameState());
        }
    }

    resumeGame() {
        if (this.state === GAME_STATE.PAUSED) {
            this.state = GAME_STATE.PLAYING;
            this.io.to(this.name).emit(SOCKET_EVENTS.SYNC_GAME_STATE, this.getGameState());
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
            this.io.to(this.name).emit(SOCKET_EVENTS.SYNC_GAME_STATE, this.getGameState());
        },3000); 
    }

    gameLoop() {
        if (this.state === GAME_STATE.PLAYING) {  
            this.io.to(this.name).emit(SOCKET_EVENTS.SYNC_GAME_STATE, this.getGameState());
            }
    }

    checkEndGame() {
        return this.players.filter(player => player.state === PLAYER_STATE.PLAYING).length == 1;
    }

}

module.exports = Game;
