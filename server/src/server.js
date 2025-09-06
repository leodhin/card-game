// Dependencies
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');

const apiRoutes = require('./routes/api.routes');
const setupGameNamespaceEvents = require('./sockets/setupGameNamespaceEvents');
const setupLobbyNamespaceEvents = require('./sockets/setupLobbyNamespaceEvents');
require('./config/cloudfare.config');

// Connecting to database pool instance
require('./config/connectDB');

// App configuration
const app = express();
const server = http.createServer(app);

const socketConfig = require("./config/socketIO.config");
const io = require("socket.io")(server, socketConfig);

app.use(cors());
app.use(express.static('public'));
app.use(express.static('src/blob'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Socket.io initialization of namespaces
const gameNS = setupGameNamespaceEvents(io);
const lobbyNS = setupLobbyNamespaceEvents(io, gameNS.gameController);

// API ROUTES   
app.use(apiRoutes(gameNS));

server.listen(process.env.SERVER_PORT, () => {
  console.log(`Server is running on port ${process.env.SERVER_PORT}`);
});