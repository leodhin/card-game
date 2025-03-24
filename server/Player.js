const { DIRECTIONS, GAME_STATE, PIXEL_DISTANCE } = require('./constants');

class Player {
    constructor(socket, color, x, y) {
        this.socket = socket;
        this.nickname = null;
        this.id = socket.id;
        this.state = GAME_STATE.WAITING;
        this.gameId = {};
        this.health = 10;
        this.energy = 0;
        this.deck = this.generateDeck(20);
        this.hand = this.deck.splice(0, 3);
        this.field = null;
    }

    getPlayerState() {
        return {
            id: this.id,
            nickname: this.nickname,
            state: this.state,
            gameId: this.gameId,
            health: this.health,
            energy: this.energy,
            hand: this.hand,
            field: this.field
        }
    }

	generateDeck() {
		let deck = [];
		// 3 copias de 1/1: costo 1, ataque 1, defensa 1
		for (let i = 0; i < 3; i++) {
			deck.push(new Card("1/1", 1, 1, 1));
		}
		// 3 copias de 1/2: costo 1, ataque 1, defensa 2
		for (let i = 0; i < 3; i++) {
			deck.push(new Card("1/2", 1, 1, 2));
		}
		// 3 copias de 2/1: costo 2, ataque 2, defensa 1
		for (let i = 0; i < 3; i++) {
			deck.push(new Card("2/1", 2, 2, 1));
		}
		// 1 copia de 3/3: costo 3, ataque 3, defensa 3
		deck.push(new Card("3/3", 3, 3, 3));
		return deck;
	}

    drawCard() {
        if (this.deck.length > 0) {
            const card = this.deck.shift();
            this.hand.push(card);
        }
    }

}

module.exports = Player;
