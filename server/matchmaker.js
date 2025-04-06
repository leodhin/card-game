class Matchmaker {
	constructor(gameController) {
		this.gameController = gameController;
		this.waitingPlayers = [];
	}

	queuePlayer(userId) {
		this.waitingPlayers.push({ userId });

		if (this.waitingPlayers.length >= 2) {
			const user1 = this.waitingPlayers.shift();
			const user2 = this.waitingPlayers.shift();

			const gameId = this.gameController.createGame([user1, user2]);
			return gameId;
		}
		return null;
	}
}

module.exports = Matchmaker;
