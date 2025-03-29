module.exports = {
	draw3Cards: {
		name: 'Draw 3 Cards',
		description: 'Active player draws 3 cards.',
		applyEffect: (gameState, player) => {
			for (let i = 0; i < 3; i++) {
				player.drawCard();
			}
			return gameState;
		}
	},
	discardRandomCard: {
		name: 'Discard Random Card',
		description: 'Opponent discards a random card.',
		applyEffect: (gameState, player, opponent) => {
			if (opponent.hand && opponent.hand.length > 0) {
				const randomIndex = Math.floor(Math.random() * opponent.hand.length);
				opponent.hand.splice(randomIndex, 1);
			}
			return gameState;
		}
	},
	handBuff: {
		name: 'Hand Buff +1/+1',
		description: 'All cards in hand gain +1 attack and +1 defense.',
		applyEffect: (gameState, player) => {
			if (player.hand) {
				player.hand = player.hand.map(card => ({
					...card,
					attack: card.attack + 1,
					defense: card.defense + 1
				}));
			}
			return gameState;
		}
	}
};
