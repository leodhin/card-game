module.exports = {
  cors: {
    origin: 'http://localhost:5173',
    transports: ['websocket', 'polling'],
    methods: ["GET", "POST"],
    allowedHeaders: ["authorization"],
    credentials: true,
  },
};