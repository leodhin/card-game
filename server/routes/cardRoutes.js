const express = require('express');
const {isLoggedIn} = require('../middleware/requireAuth');
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


router.post('/card', isLoggedIn, async (req, res) => {
    try {
    console.log(req.body);
    const { name, img, attack, defense, cost, lore } = req.body;
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

router.get('/card-list', isLoggedIn, async (req, res) => {
	try {
        const userId  = req.userId;
		let cards = await Card.find({userId});
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
        const card = await Card.findById(cardId);
        if (!card) {
            return res.status(404).json({ error: 'Card not found' });
        }
        return res.json(card);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error obtaining card' });
    }
});


module.exports = router;
