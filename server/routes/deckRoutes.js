const express = require('express');
const Deck = require('../models/DeckModel');

const router = express.Router();

router.post('/deck', async (req, res) => {
	try {
		const { userId, name, cards, createdBy } = req.body;
		let deck = await Deck.findOne({ userId, name });
		if (deck) {
			deck.cards = cards;
			deck.createdBy = createdBy; 
			return res.status(200).json(deck);
		} else {
			deck = new Deck({ userId, name, cards, createdBy });
			await deck.save();
			return res.status(201).json(deck);
		}
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: 'Error processing deck' });
	}
});

router.get('/deck-list/:userId', async (req, res) => {
	try {
		const { userId } = req.params;
		const decks = await Deck.find({ userId }).populate('cards');
		return res.json(decks);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: 'Error obtaining user decks' });
	}
});

router.get('/deck-list', async (req, res) => {
	try {
		const { userId } = req.params;
		const decks = await Deck.find({}).populate('cards');
		return res.json(decks);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: 'Error obtaining decks list' });
	}
});

router.get('/deck/:deckId', async (req, res) => {
	try {
		const { deckId } = req.params;
		const deck = await Deck.findById(deckId).populate('cards');
		if (!deck) {
			return res.status(404).json({ error: 'Deck not found' });
		}
		return res.json(deck);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: 'Error al obtener el deck' });
	}
});

module.exports = router;