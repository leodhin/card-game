const express = require('express');
const router = express.Router();

const { getProfile, addPerson, getFriends, acceptFriendRequest, rejectFriendRequest, getAllUsers, getProfileByNickname } = require('../controllers/http/user.controller');
const { isLoggedIn } = require('../middleware/http/requireAuthHTTP');
const { isAdmin } = require('../middleware/http/requireAdminHTTP');

router.get('/profile', isLoggedIn, getProfile);
router.post('/add-friend', isLoggedIn, addPerson);
router.post('/accept-friend-request', isLoggedIn, acceptFriendRequest);
router.post('/reject-friend-request', isLoggedIn, rejectFriendRequest);
router.get('/friends', isLoggedIn, getFriends);
router.get('/all-users', isAdmin, getAllUsers);
router.get('/:nickname', isLoggedIn, getProfileByNickname);

module.exports = router;