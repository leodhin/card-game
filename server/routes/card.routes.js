const express = require('express');
const { isLoggedIn } = require('../middleware/http/requireAuthHTTP');
const CardModel = require('../models/Card.model');
const Card = require('../game/Card');
const { saveImage, removeImage } = require('../utils/utils');

const router = express.Router();


router.post('/card', isLoggedIn, async (req, res) => {
  try {
    const { name, img, attack, defense, lore } = req.body;
    let filename = null;
    const userId = req.userId;

    if (img) {
      filename = saveImage(img);
    }

    const tempCard = new Card(null, name, filename, lore, attack, defense);
    tempCard.calculateCardCost();

    let existingCard = await CardModel.findOne({ name, userId });

    if (existingCard) {
      return res.status(409).json({ error: 'Card with this name already exists' });
    } else {
      const newCard = new CardModel({
        name,
        img: filename,
        attack,
        defense,
        cost: tempCard.cost,
        lore,
        userId,
        createdBy: userId
      });
      await newCard.save();
      return res.status(201).json(newCard);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error creating card' });
  }
});

router.get('/card-list', isLoggedIn, async (req, res) => {
  try {
    const userId = req.userId;
    let cards = await CardModel.find({ userId });

    cards = cards.map(card => {
      const cardObj = card.toObject();
      if (cardObj.img) {
        cardObj.img = req.protocol + '://' + req.get('host') + '/' + cardObj.img;
      }
      return cardObj;
    });
    return res.json(cards);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error obtaining cards' });
  }
});

router.get('/card/:cardId', isLoggedIn, async (req, res) => {
  try {
    const { cardId } = req.params;
    const card = await CardModel.findById(cardId);
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }
    if (card.img) {
      card.img = card.img;
    }
    return res.json(card);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error obtaining card' });
  }
});

router.delete('/card/:cardId', isLoggedIn, async (req, res) => {
  try {
    const cardId = req.params.id;
    const userId = req.userId;
    const card = await CardModel.findOne({ _id: cardId, userId });
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }
    await DeckModel.updateMany(
      { userId },
      { $pull: { cards: cardId } }
    );
    await card.remove();
    return res.json({ message: 'Card deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error deleting card' })
  }
});

router.put('/card/:cardId', isLoggedIn, async (req, res) => {
  try {
    const { cardId } = req.params;
    const { name, img, attack, defense, lore } = req.body;

    if (!name || !img || !attack || !defense) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    let filename = null;

    if (img && img.startsWith('data:image/')) {
      const card = await CardModel.findById(cardId);
      if (card.img) {
        removeImage(card.img);
      }
      filename = saveImage(img);
    }

    const tempCard = new Card(null, name, filename, lore, attack, defense);
    tempCard.calculateCardCost();

    const updatedCard = await CardModel.findByIdAndUpdate(cardId, {
      name,
      img: filename || undefined,
      attack,
      defense,
      cost: tempCard.cost,
      lore
    }, { new: true });

    if (!updatedCard) {
      return res.status(404).json({ error: 'Card not found' });
    }
    return res.json(updatedCard);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error updating card' });
  }
});

router.post('/generate-cardimage', isLoggedIn, async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const formData = new FormData();
    formData.append('text', prompt);
    formData.append('width', '512');
    formData.append('height', '1024');
    //formData.append('image_generator_version', 'hd');
    formData.append('genius_preference', 'anime');
    //formData.append('negative_prompt', 'blurry, bad anatomy');

    const resp = await fetch('https://api.deepai.org/api/text2img', {
      method: 'POST',
      headers: {
        'api-key': '1b6c0c0c-9128-42f0-86bd-1681c5cca41e'
      },
      body: formData
    });

    const data = await resp.json();
    return res.json({ image: data.output_url });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error generating image' });
  }
});

module.exports = router;
