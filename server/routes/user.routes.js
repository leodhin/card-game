const express = require('express');
const router = express.Router();

const { getProfile } = require('../controllers/http/user.controller');
const { isLoggedIn } = require('../middleware/http/requireAuthHTTP');


router.get('/profile', isLoggedIn, getProfile);

module.exports = router;