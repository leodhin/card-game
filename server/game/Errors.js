class GameError extends Error {
  constructor(message, code) {
    super(message);
    this.name = "GameError";
    this.code = code || "GAME_ERROR";
    Error.captureStackTrace(this, this.constructor);
  }
}

class CardError extends GameError {
  constructor(message) {
    super(message, "CARD_ERROR");
    this.name = "CardError";
  }
}

module.exports = {
  GameError,
  CardError,
};