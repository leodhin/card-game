const ERROR_CODES = {
  GAME_ERROR: "GAME_ERROR",
  GAME_NOT_FOUND: "GAME_NOT_FOUND",
  NOT_ENOUGH_MANA: "NOT_ENOUGH_MANA",
  CARD_ERROR: "CARD_ERROR",
  PLAYER_FIELD_FULL: "PLAYER_FIELD_FULL",
};

class GameError extends Error {
  constructor(message, code = ERROR_CODES.GAME_ERROR) {
    super(message);
    this.name = "GameError";
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

class GameNotFoundError extends GameError {
  constructor(message) {
    super(message, ERROR_CODES.GAME_NOT_FOUND);
    this.name = "GameNotFoundError";
  }
}

class NotEnoughManaError extends GameError {
  constructor(message) {
    super(message, ERROR_CODES.NOT_ENOUGH_MANA);
    this.name = "NotEnoughManaError";
  }
}

class PlayerFieldFullError extends GameError {
  constructor(message) {
    super(message, ERROR_CODES.PLAYER_FIELD_FULL);
    this.name = "PlayerFieldFullError";
  }
}

class CardError extends GameError {
  constructor(message) {
    super(message, ERROR_CODES.CARD_ERROR);
    this.name = "CardError";
  }
}

module.exports = {
  GameError,
  CardError,
  GameNotFoundError,
  NotEnoughManaError,
  PlayerFieldFullError,
  ERROR_CODES,
};