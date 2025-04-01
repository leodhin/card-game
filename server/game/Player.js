const { GAME_STATE } = require('../utils/constants');
const Deck = require('../models/DeckModel');

class Player {
    constructor(socket) {
        this.socket = socket;
        this.hand = [];
        this.deck = {};
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
            field: this.field,
            deck: this.deck
        }
    }

    async init() {
        const deckDoc = await this.generateDeck();
        if (deckDoc === null) {
            throw new Error("Deck not found");
        }
        this.deck = deckDoc.cards || [];
        this.shuffleDeck();   
        // get 3 cards from the  and put them in the hand
        for (let i = 0; i < 3; i++) {
            this.drawCard();
        }
    }

	async generateDeck() {
        const userId = this.socket?.request?.user?.userId;
        const deck = await Deck.findOne({userId}).populate('cards');
        if (!deck) {
            return null;
        }
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

            const baseUrl = process.env.FORWARD_URL;
            if (card.img) {
                card.img = baseUrl + card.img;
            }
        }


    }

}

module.exports = Player;
