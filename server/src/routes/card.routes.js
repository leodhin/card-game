const express = require('express');
const { isLoggedIn } = require('../middleware/http/requireAuthHTTP');
const { hasAIUsage } = require('../middleware/http/requireAIUsageHTTP');
const {
  createCard,
  getCardList,
  getCardById,
  deleteCard,
  updateCard,
  generateCardImage
} = require('../controllers/http/card.controller');

const router = express.Router();

router.post('/card', isLoggedIn, createCard);
router.get('/card-list', isLoggedIn, getCardList);
router.get('/card/:cardId', isLoggedIn, getCardById);
router.delete('/card/:cardId', isLoggedIn, deleteCard);
router.put('/card/:cardId', isLoggedIn, updateCard);
router.post('/generate-cardimage', isLoggedIn, hasAIUsage, generateCardImage);

module.exports = router;
