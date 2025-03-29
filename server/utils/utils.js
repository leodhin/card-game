function findGamePlayer(players, socket) {
  if (players?.length > 0) {
    return players.find(player => player.id === socket.id);
  } else {
    return {};
  }

}

function isEmpty(obj) {
  for(var prop in obj) {
      if(obj.hasOwnProperty(prop))
          return false;
  }

  return true;
}

module.exports = { findGamePlayer, isEmpty };