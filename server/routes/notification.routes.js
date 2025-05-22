const express = require('express');
const router = express.Router();
const { getNotifications, getPendingNotifications } = require('../controllers/http/notification.controller');
const { isLoggedIn } = require('../middleware/http/requireAuthHTTP');

router.get('/', isLoggedIn, getNotifications);
router.get('/pending', isLoggedIn, getPendingNotifications);

module.exports = router;