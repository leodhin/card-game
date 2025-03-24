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
  CREATE_ROOM: 'createRoom',
  CLEAR: 'clear',
  PING: 'ping',
  PONG: 'pong',
  READY: 'ready',
  PAUSE: 'pause',
  RESUME: 'resume',
  END: 'end',
  GAMESTATE: 'gamestate',
  GAME_OVER: 'gameOver',
  SEND_MESSAGE: 'sendMessage',
  RECEIVE_MESSAGE: 'receiveMessage',
  ERROR: 'error',
  PLAY_CARD: 'playCard', 
  DRAW_CARD: 'drawCard',
  ATTACK: 'attack'
};

module.exports.PIXEL_DISTANCE = 5;
