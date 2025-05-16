const { v4: uuidv4 } = require('uuid');
const Game = require('../../game/Game');
const { SOCKET_EVENTS, PHASE_STATE } = require('../../utils/constants');

// TODO: gameID no llega como input, refactorizar los metodos
// TODO: comprobar que el user es efectivamente de la partida
class GameController {
	constructor(gameNamespace) {
		this.gameNamespace = gameNamespace;
		this.games = new Map();
	}

	async createGame(gameId, userIds) {
		try {
			const game = new Game(gameId, userIds);
			await game.init(userIds);
			this.games.set(gameId, game);

			return gameId;
		} catch (error) {
			console.error('Error creating game:', error);
			throw new Error('Error creating game');
		}
	}


	handleGameEnd(gameId) {
		this.gameNamespace.in(gameId).disconnectSockets(true);
		this.games.delete(gameId);
	}

	playerDrawCard(gameId, userId) {
		const game = this.games.get(gameId);
		if (!game) return;

		const player = game.getPlayer(userId);
		if (!player) return;

		player.drawCard();
		game.phase = PHASE_STATE.PLAY;
		game.syncGameState();
	}

	playerPlayCard(gameId, userId, cardIndex) {
		const game = this.games.get(gameId);
		if (!game) return;

		try {
			const player = game.getPlayer(userId);
			game.playCard(player, cardIndex);
		} catch (error) {
			throw error;
		}
	}

	playerAttack(gameId, userId) {
		const game = this.games.get(gameId);
		if (!game) return;

		const attacker = game.getPlayer(userId);
		const defender = game.players.find(p => p.id !== userId);
		if (!attacker || !defender) return;

		game.attack(attacker, defender);
		game.nextTurn();
		game.syncGameState();
	}

	playerPassTurn(gameId, userId) {
		const game = this.games.get(gameId);
		if (!game) return;

		game.nextTurn();
		game.syncGameState();
	}

	playerSendMessage(gameId, userId, message) {
		const game = this.games.get(gameId);
		if (!game) return;

		const player = game.getPlayer(userId);
		if (!player) return;

	}

	startGame(gameId) {
		const game = this.games.get(gameId);
		if (!game) return;

		game.startGame();
	}

	getGamesList() {
		return Object.keys(this.games);
	}

	getGames() {
		return this.games;
	}

	getGame(gameId) {
		return this.games.get(gameId);
	}

	getGameIdByUserId(userId) {
		for (const [gameId, game] of this.games.entries()) {
			if (game.players.some(player => player.id === userId)) {
				return gameId;
			}
		}
		return null;
	}

	getRoomIdByUserId(userId) {
		for (const [gameId, game] of this.games.entries()) {
			if (game.players.some(player => player.id === userId)) {
				return gameId;
			}
		}
		return null;
	}

	getMatchIdByUserId(userId) {
		for (const [gameId, game] of this.games.entries()) {
			if (game.players.some(player => player.id === userId)) {
				return gameId;
			}
		}
		return null;
	}

	getPlayerByUserId(userId) {
		for (const game of this.games.values()) {
			const player = game.getPlayer(userId);
			if (player) {
				return player;
			}
		}
		return null;
	}

	getPlayerGameState(gameId, userId) {
		const game = this.games.get(gameId);
		if (!game) return null;

		return game.getPlayerGameState(userId);
	}

}

module.exports = GameController;

