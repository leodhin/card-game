const { DIRECTIONS, GAME_STATE, PIXEL_DISTANCE } = require('../utils/constants');
const Card = require('./Card');

class Player {
    constructor(socket) {
        this.socket = socket;
        this.nickname = null;
        this.id = socket.id;
        this.state = GAME_STATE.WAITING;
        this.gameId = {};
        this.health = 10;
        this.energy = 1;
        this.field = [];
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

    initDeck() {
        this.deck = this.generateDeck();    
        this.shuffleDeck();                 
        this.hand = this.deck.splice(0, 3); 
    }

	generateDeck() {
		let deck = [];
		// 3 copias de 1/1: costo 1, ataque 1, defensa 1
		for (let i = 0; i < 3; i++) {
			deck.push(new Card(i+1, "Splash Bee", "card1.png", 1, 1, 1));
		}
		// 3 copias de 1/2: costo 1, ataque 1, defensa 2
		for (let i = 0; i < 3; i++) {
			deck.push(new Card(i+4,"Galactic Goblin", "card2.png", 2, 1, 2));
		}
		// 3 copias de 2/1: costo 2, ataque 2, defensa 1
		for (let i = 0; i < 3; i++) {
			deck.push(new Card(i+7,"Wukong", "https://9pwbk5xx-3000.uks1.devtunnels.ms/Wukong-card.png", 8, 8, 1));
		}
		// 1 copia de 3/3: costo 3, ataque 3, defensa 3
		deck.push(new Card(10, "Chamilifenix", "https://9pwbk5xx-3000.uks1.devtunnels.ms/card4.png", 3, 3, 3));
		return deck;
	}

    shuffleDeck() {
		for (let i = this.deck.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
		}
	}
    
    drawCard() {
        if (this.deck.length > 0) {
            const card = this.deck.shift();
            this.hand.push(card);
        }
    }

}

module.exports = Player;
