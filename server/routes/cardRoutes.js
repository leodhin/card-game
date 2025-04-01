const express = require('express');
const {isLoggedIn} = require('../middleware/requireAuth');
const CardModel = require('../models/CardModel');
const Card = require('../game/Card');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { NotBeforeError } = require('jsonwebtoken');

const router = express.Router();


const storage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, path.join(__dirname, '../blob')); 
	},
	filename: function(req, file, cb) {
		
		cb(null, Date.now() + '-' + file.originalname);
	}
});

const upload = multer({ storage: storage });


router.post('/card', isLoggedIn, async (req, res) => {
	try {
		const { name, img, attack, defense, lore } = req.body;
		let filename = null;
		const userId = req.userId;

		if (img) {
			let base64Data = img;
			const matches = img.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
			if (matches && matches.length === 3) {
				base64Data = matches[2];
			}

			filename = name.replace(/\s/g, '') + '-card.png';
			const filePath = path.join(__dirname, '../blob', filename);
			fs.writeFileSync(filePath, base64Data, 'base64');
		}

		const tempCard = new Card(null, name, filename, lore, attack, defense);
		tempCard.calculateCardCost();

		let existingCard = await CardModel.findOne({ name, userId });

		if (existingCard) {
			existingCard.img = filename;
			existingCard.attack = attack;
			existingCard.defense = defense;
			existingCard.cost = tempCard.cost;
			existingCard.lore = lore;
			existingCard.modifiedAt = new Date();

			await existingCard.save();
			return res.status(200).json(existingCard);
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
		return res.status(500).json({ error: 'Error creating/updating card' });
	}
});

router.get('/card-list', isLoggedIn, async (req, res) => {
	try {
        const userId  = req.userId;
		let cards = await CardModel.find({userId});
		const baseUrl = process.env.FORWARD_URL;
		cards = cards.map(card => {
			const cardObj = card.toObject();
			if (cardObj.img) {
				cardObj.img = baseUrl + cardObj.img;
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
        return res.json(card);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error obtaining card' });
    }
});

router.delete('/card/:cardId', isLoggedIn, async (req, res) => {
    try {
        const { cardId } = req.params;
        const card = await CardModel.findByIdAndDelete(cardId);
        if (!card) {
            return res.status(404).json({ error: 'Card not found' });
        }
        return res.json({ message: 'Card deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error deleting card' });
    }
});

module.exports = router;
