const { v4: uuidv4 } = require('uuid');
const Game = require('../../game/Game');
const { SOCKET_EVENTS, PHASE_STATE } = require('../../utils/constants');

class GameController {
	constructor(gameNamespace) {
		this.gameNamespace = gameNamespace;
		this.existingGames = {};
	}

	async createGame(userIds) {
		if (userIds.length !== 2) {
			throw new Error('Cannot create game: exactly 2 players required.');
		}

		const gameId = uuidv4();

		const game = new Game(gameId, (finishedGameId) => {
			this.handleGameEnd(finishedGameId);
		});

		await Promise.all(userIds.map((userId) => game.addPlayer(userId)));

		this.existingGames[gameId] = game;
        console.log("Game created", game.gameId);

        this.gameNamespace.to(userIds).emit(SOCKET_EVENTS.SYNC_GAME_STATE, game.getSanitizedGameState(userIds[0]));

		return gameId;
	}

	handleGameEnd(gameId) {
		this.gameNamespace.in(gameId).disconnectSockets(true);
		delete this.existingGames[gameId];
	}

	playerDrawCard(gameId, userId) {
		const game = this.existingGames[gameId];
		if (!game) return;

		const player = game.getPlayer(userId);
		if (!player) return;

		player.drawCard();
		game.phase = PHASE_STATE.PLAY;
		game.syncGameState();
	}

	playerPlayCard(gameId, userId, cardIndex) {
		const game = this.existingGames[gameId];
		if (!game) return;

		const player = game.getPlayer(userId);
		if (!player) return;

		game.playCard(player, cardIndex);
		game.syncGameState();
	}

	playerAttack(gameId, userId) {
		const game = this.existingGames[gameId];
		if (!game) return;

		const attacker = game.getPlayer(userId);
		const defender = game.players.find(p => p.id !== userId);
		if (!attacker || !defender) return;

		game.attack(attacker, defender);
		game.nextTurn();
		game.syncGameState();
	}

	playerPassTurn(gameId, userId) {
		const game = this.existingGames[gameId];
		if (!game) return;

		game.nextTurn();
		game.syncGameState();
	}

	playerSendMessage(gameId, userId, message) {
		const game = this.existingGames[gameId];
		if (!game) return;

		const player = game.getPlayer(userId);
		if (!player) return;

	}

    startGame(gameId) {
        const game = this.existingGames[gameId];
        if (!game) return;

        game.startGame();
    }

	getGamesList() {
		return Object.keys(this.existingGames);
	}

	getGames() {
		return this.existingGames;
	}

	getGame(gameId) {
		return this.existingGames[gameId];
	}
}

module.exports = GameController;

