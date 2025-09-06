const express = require('express');
const router = express.Router();

const { isLoggedIn } = require('../middleware/http/requireAuthHTTP');
const {
  createOrUpdateDeck,
  getDeckList,
  getDeckById,
  updateDeck,
  deleteDeck,
} = require('../controllers/http/deck.controller');

router.post('/deck', isLoggedIn, createOrUpdateDeck);
router.get('/deck-list', isLoggedIn, getDeckList);
router.get('/deck/:deckId', isLoggedIn, getDeckById);
router.put('/deck/:deckId', isLoggedIn, updateDeck);
router.delete('/deck/:deckId', isLoggedIn, deleteDeck);

module.exports = router;