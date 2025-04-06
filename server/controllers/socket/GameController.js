const Game = require('../../game/Game');
const { v4: uuidv4 } = require('uuid');
const { SOCKET_EVENTS, GAME_STATE, PLAYER_STATE } = require('../../utils/constants');


class GameController {
	constructor(gameNamespace) {
		this.gameNamespace = gameNamespace;
		this.existingGames = {}; 
	}

    /**
	 * Creates a Game instance and add players to it
	 * @param {Array} sockets Array of players
	 * @returns {string} Id of the Game created
	 */
	createGame(sockets) {
		const gameId = uuidv4();
		const game = new Game(this.gameNamespace, gameId);
		this.existingGames[gameId] = game;

		sockets.forEach(async (socket) => {
			await game.addPlayer(socket);
			socket.join(gameId);
			this.gameNamespace.to(gameId).emit(
				SOCKET_EVENTS.PLAYER_CONNECTED,
				socket.id
			);
		});

		if (game.players.length === 2 && game.state === GAME_STATE.WAITING) {
			game.players.forEach((p) => {
				p.state = PLAYER_STATE.READY;
			});
			game.startGame();
		}

		return gameId;
	}

    /**
     * Removes a game from the existing games
     * @param {string} gameId Id of the game to remove
     */
	getGames() {
		return Object.keys(this.existingGames);
	}
}

module.exports = GameController;
