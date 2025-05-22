// Dependencies
require('dotenv').config();
const createSocketGame = require('./gameSocketEvents');
const cardRoutes = require('./routes/card.routes');
const deckRoutes = require('./routes/deck.routes');
const cardPowerRoutes = require('./routes/cardPower.routes');
const authRoutes = require('./routes/auth.routes');
const serverRoutes = require('./routes/server.routes');
const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');
const notificationRoutes = require('./routes/notification.routes');
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
    transports: ['websocket', 'polling'],
    methods: ["GET", "POST"],
    allowedHeaders: ["authorization"],
    credentials: true,
  },
});
app.use(cors());
app.use(express.static('public'));
app.use(express.static('blob'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const gameNamespace = createSocketGame(io);

// Routes   
app.use('/api', cardRoutes);
app.use('/api', deckRoutes);
app.use('/api', cardPowerRoutes);
app.use('/api', serverRoutes);
app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes(gameNamespace));
app.use('/api/notifications', notificationRoutes);

server.listen(process.env.SERVER_PORT, () => {
  console.log(`Server is running on port ${process.env.SERVER_PORT}`);
});