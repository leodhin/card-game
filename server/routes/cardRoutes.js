const express = require('express');
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


router.post('/card-generator', async (req, res) => {
    try {
    console.log(req.body);
    const { name, img, attack, defense, cost, lore } = req.body;
    let filename = null;

if (img) {
        // Si la imagen viene como cadena base64 con prefijo, lo separamos
        let base64Data = img;
        const matches = img.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
        base64Data = matches[2];
        }
        
        // Genera un nombre único para la imagen
        filename = Date.now() + '-card.png';
        const filePath = path.join(__dirname, '../blob', filename);
        
        // Escribe el archivo en formato base64
        fs.writeFileSync(filePath, base64Data, 'base64');
}

    const newCard = new Card({ name, img: filename, attack, defense, cost, lore });
    await newCard.save();
    return res.status(201).json(newCard);
    } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al crear la carta' });
    }
});

router.get('/cards', async (req, res) => {
	try {
		const cards = await Card.find({});
		return res.json(cards);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: 'Error al obtener las cartas' });
	}
});

module.exports = router;
