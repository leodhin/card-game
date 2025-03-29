const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const Deck = require('../models/DeckModel');
const router = express.Router();

router.post('/deck', requireAuth, async (req, res) => {
	const userId = req.session.userId;
	if (!userId)
		return res.status(401).json({ error: 'User not authenticated' });
	
	const { name, cards, createdBy } = req.body;
	
	if (!Array.isArray(cards) || cards.length === 0) {
		return res.status(400).json({ error: 'You must provide a list of card IDs' });
	}
	
	// Validate that all provided card IDs exist in the database
	const Card = require('../models/CardModel');
	const foundCards = await Card.find({ _id: { $in: cards } });
	if (foundCards.length !== cards.length) {
		return res.status(400).json({ error: 'One or more provided card IDs do not exist' });
	}
	
	let deck = await Deck.findOne({ userId, name });
	if (deck) {
		deck.cards = cards;
		deck.createdBy = createdBy;
		await deck.save();
		return res.status(200).json(deck);
	} else {
		deck = new Deck({ userId, name, cards, createdBy });
		await deck.save();
		return res.status(201).json(deck);
	}
});

router.get('/deck-list/:userId', requireAuth, async (req, res) => {
	try {
		const { userId } = req.params;
		const decks = await Deck.find({ userId }).populate('cards');
		return res.json(decks);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: 'Error obtaining user decks' });
	}
});

router.get('/deck-list', requireAuth, async (req, res) => {
	try {
		const { userId } = req.params;
		const decks = await Deck.find({}).populate('cards');
		return res.json(decks);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: 'Error obtaining decks list' });
	}
});

router.get('/deck/:deckId', requireAuth, async (req, res) => {
	try {
		const { deckId } = req.params;
		const deck = await Deck.findById(deckId).populate('cards');
		if (!deck) {
			return res.status(404).json({ error: 'Deck not found' });
		}
		return res.json(deck);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: 'Error obtaining deck' });
	}
});

module.exports = router;