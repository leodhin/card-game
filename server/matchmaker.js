class Matchmaker {
	constructor(gameController) {
		this.gameController = gameController;
		this.waitingPlayers = [];
	}

	async queueSocket(socket) {
		this.waitingPlayers.push(socket);
		console.log("Socket queued", socket.id);

		if (this.waitingPlayers.length >= 2) {
			const socket1 = this.waitingPlayers.shift();
			const socket2 = this.waitingPlayers.shift();

			const gameId  = await this.gameController.createGame([socket1.request?.user?.userId, socket2.request?.user?.userId]);
			return {gameId, socket1, socket2};
		} else {
			return {};
		}
	}

	removePlayerFromQueue(userId) {
		const index = this.waitingPlayers.findIndex(player => player.userId === userId)
		if (index !== -1) {
			this.waitingPlayers.splice(index, 1)
		}
	}
}


module.exports = Matchmaker;
