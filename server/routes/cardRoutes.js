const express = require('express');
const config = require('../config');
const requireAuth = require('../middleware/requireAuth');
const Card = require('../models/CardModel');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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


router.post('/card', requireAuth, async (req, res) => {
    try {
    console.log(req.body);
    const { name, img, attack, defense, cost, lore } = req.body;
    let filename = null;
    const userId = req.session.userId;

    if (img) {
            let base64Data = img;
            const matches = img.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
            if (matches && matches.length === 3) {
            base64Data = matches[2];
            }
            
            filename = name + '-card.png';
            const filePath = path.join(__dirname, '../blob', filename);
            
            fs.writeFileSync(filePath, base64Data, 'base64');
    }

    const newCard = new Card({
			name,
			img: filename,
			attack,
			defense,
			cost,
			lore,
			userId: userId,
			createdBy: userId
		});
    await newCard.save();
    return res.status(201).json(newCard);
    } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error creating card' });
    }
});

router.get('/card-list', requireAuth, async (req, res) => {
	try {
		let cards = await Card.find({});
		const baseUrl = config.FORWARD_URL;
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


module.exports = router;
