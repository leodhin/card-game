const fs = require('fs');
const path = require('path');
const { uid: generateUID } = require('uid');


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

function saveImage(img) {
  const multer = require('multer');
  const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, path.join(__dirname, '../blob')); 
    },
    filename: function(req, file, cb) {
      
      cb(null, Date.now() + '-' + file.originalname);
    }
  });
  const upload = multer({ storage: storage });

  let filename;

  let base64Data = img;
  const matches = img.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
  if (matches && matches.length === 3) {
    base64Data = matches[2];
  }

  // Generate a unique filename using uid library
  const uniqueId = generateUID(10);
  filename = uniqueId + '.png';
  const filePath = path.join(__dirname, '../blob', filename);
  fs.writeFileSync(filePath, base64Data, 'base64');
  return filename;
}

function removeImage(imgName){
  const filePath = path.join(__dirname, '../blob', imgName);
  fs.unlinkSync(filePath);
}

module.exports = { findGamePlayer, isEmpty, saveImage, removeImage};