const express = require('express');

const cardRoutes = require('./card.routes');
const deckRoutes = require('./deck.routes');
const cardPowerRoutes = require('./cardPower.routes');
const serverRoutes = require('./server.routes');
const userRoutes = require('./user.routes');
const authRoutes = require('./auth.routes');
const adminRoutes = require('./admin.routes');
const notificationRoutes = require('./notification.routes');

module.exports = (gameNamespace) => {
  const router = express.Router();

  router.use('/api', cardRoutes);
  router.use('/api', deckRoutes);
  router.use('/api', cardPowerRoutes);
  router.use('/api', serverRoutes);
  router.use('/api/user', userRoutes);
  router.use('/api/auth', authRoutes);
  router.use('/api/admin', adminRoutes(gameNamespace));
  router.use('/api/notifications', notificationRoutes);

  return router;
};