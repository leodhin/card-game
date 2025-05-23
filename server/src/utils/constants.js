module.exports.GAME_STATE = {
  WAITING: 'waiting',
  READY: 'ready',
  FINISHED: 'finished',
  PLAYING: 'playing',
  PAUSED: 'paused'
};

module.exports.PHASE_STATE = {
  WAIT: 'wait',
  DRAW: 'draw',
  COMBAT: 'combat',
  PLAY: 'play'
};

module.exports.PLAYER_STATE = {
  WAITING: 'waiting',
  READY: 'ready',
  FINISHED: 'finished',
  PLAYING: 'playing'
};

module.exports.SOCKET_EVENTS = {
  PLAYER_CONNECTED: 'playerConnected',
  PLAYER_DISCONNECTED: 'playerDisconnected',
  SYNC_GAME_STATE: 'syncGameState',
  SYNC_ROOMS: 'syncRooms',
  JOIN_ROOM: 'joinRoom',
  JOINED_ROOM: 'joinedRoom',
  CREATE_ROOM: 'createRoom',
  CLEAR: 'clear',
  PING: 'ping',
  PONG: 'pong',
  READY: 'ready',
  PAUSE: 'pause',
  RESUME: 'resume',
  END: 'end',
  GAME_START: 'gameStart',
  GAME_OVER: 'gameOver',
  SEND_MESSAGE: 'sendMessage',
  RECEIVE_MESSAGE: 'receiveMessage',
  ERROR: 'error',
  PLAY_CARD: 'playCard',
  DRAW_CARD: 'drawCard',
  ATTACK: 'attack',
  PASS: 'pass',
  UNAUTHORIZED: 'unauthorized'
};

module.exports.ERROR_MESSAGES = {
  GAME_NOT_FOUND: 'Game not found.',
  NOT_ENOUGH_PLAYERS: 'Not enough players.',
  NOT_ENOUGH_MANA: 'Not enough mana.',
  PLAYER_NOT_FOUND: 'Player not found.',
  PLAYER_NOT_IN_GAME: 'You are not a player in this game.'
};

module.exports.PIXEL_DISTANCE = 5;
