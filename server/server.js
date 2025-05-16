// Dependencies
require('dotenv').config();
const createSocketGame = require('./gameSocketEvents');
const cardRoutes = require('./routes/card.routes');
const deckRoutes = require('./routes/deck.routes');
const cardPowerRoutes = require('./routes/cardPower.routes');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const express = require('express');
const cors = require('cors');
const http = require('http');

// Connecting to database pool instance
require('./connectDB');

// App configuration
const app = express();
const server = http.createServer(app);

const io = require("socket.io")(server, {
  cors: {
    origin: 'http://localhost:5173',  
    transports: ['websocket', 'polling'], ///TODO:  crear carpeta de configuracion
    methods: ["GET", "POST"],
    allowedHeaders: ["authorization"],
    credentials: true,
  },
});
app.use(cors());
app.use(express.static('public'));
app.use(express.static('blob'));
app.use(express.json({ limit: process.env.MAX_JSON_SIZE }));
app.use(express.urlencoded({ limit: process.env.MAX_JSON_SIZE, extended: true }));

// Routes   
app.use('/api/card', cardRoutes);
app.use('/api/deck', deckRoutes);
app.use('/api/power', cardPowerRoutes); ///TODO: fichero nuevo router
app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);

// TODO: crear otro gamenamespace para el lobby
const gameNamespace = createSocketGame(io);

server.listen(process.env.SERVER_PORT, () => {
  console.log(`Server is running on port ${process.env.SERVER_PORT}`);
});