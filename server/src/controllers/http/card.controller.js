const { PutObjectCommand } = require('@aws-sdk/client-s3');

const Card = require('../../game/Card');
const { consumeAIUsage } = require('../../services/User.service');
const { saveImage, removeImage } = require('../../utils/utils');
const S3Client = require('../../config/cloudfare.config');
const DeckModel = require('../../models/Deck.model')
const CardModel = require('../../models/Card.model');

exports.createCard = async (req, res) => {
  try {
    const { name, img, attack, defense, lore } = req.body;

    // Remove all whitespace from the name
    const sanitizedName = name.replace(/\s/g, '');
    if (!sanitizedName) {
      return res.status(400).json({ error: 'Card name must not be empty or contain only spaces' });
    }

    let filename = null;
    const userId = req.userId;

    const tempCard = new Card(null, sanitizedName, filename, lore, attack, defense);
    tempCard.calculateCardCost();

    let existingCard = await CardModel.findOne({ sanitizedName, userId });

    if (existingCard) {
      return res.status(409).json({ error: 'Card with this name already exists' });
    } else {
      if (img && img.startsWith('data:image/')) {
        const id = Date.now();
        const command = new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: `cards/${id}-${sanitizedName}.png`,
          Body: Buffer.from(img.split(',')[1], 'base64'),
          ContentType: 'image/png'
        });
        await S3Client.send(command);
        filename = `https://pub-c498e737c85849229e42440f8001b793.r2.dev/cards/${id}-${sanitizedName}.png`;
      }
      const newCard = new CardModel({
        name: sanitizedName,
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
};

exports.getCardList = async (req, res) => {
  try {
    const userId = req.userId;
    let cards = await CardModel.find({ userId });

    cards = cards.map(card => {
      const cardObj = card.toObject();
      return cardObj;
    });
    return res.json(cards);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error obtaining cards' });
  }
};

exports.getCardById = async (req, res) => {
  try {
    const { cardId } = req.params;
    const card = await CardModel.findById(cardId);
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }
    // If card has an image, reuse the URL
    if (card.img) {
      card.img = card.img;
    }
    return res.json(card);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error obtaining card' });
  }
};

exports.deleteCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const userId = req.userId;
    const card = await CardModel.findOne({ _id: cardId, userId });

    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }
    // Noting: DeckModel is referenced here – ensure it is required if needed
    DeckModel.updateMany(
      { userId },
      { $pull: { cards: cardId } }
    );
    await CardModel.findOneAndDelete({ _id: cardId, userId });
    return res.json({ message: 'Card deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error deleting card' });
  }
};

exports.updateCard = async (req, res) => {
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
};

exports.generateCardImage = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('text', prompt);
    formData.append('width', '512');
    formData.append('height', '1024');
    formData.append('genius_preference', 'anime');

    const resp = await fetch('https://api.deepai.org/api/text2img', {
      method: 'POST',
      headers: {
        'api-key': '1b6c0c0c-9128-42f0-86bd-1681c5cca41e'
      },
      body: formData
    });

    const data = await resp.json();

    await consumeAIUsage(req.userId);
    return res.json({ image: data.output_url });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error generating image' });
  }
};