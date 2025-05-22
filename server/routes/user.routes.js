const express = require('express');
const router = express.Router();

const { getProfile, addPerson, getFriends, acceptFriendRequest, rejectFriendRequest } = require('../controllers/http/user.controller');
const { isLoggedIn } = require('../middleware/http/requireAuthHTTP');


router.get('/profile', isLoggedIn, getProfile);
router.post('/add-friend', isLoggedIn, addPerson);
router.post('/accept-friend-request', isLoggedIn, acceptFriendRequest);
router.post('/reject-friend-request', isLoggedIn, rejectFriendRequest);
router.get('/friends', isLoggedIn, getFriends);

module.exports = router;