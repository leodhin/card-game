const express = require('express');
const CardPower = require('../models/CardPower.model');
const {isLoggedIn} = require('../middleware/http/requireAuthHTTP');

const router = express.Router();

// GET all card powers
router.get('/card-power-list', isLoggedIn, async (req, res) => {
	try {
		const powers = await CardPower.find({});
		return res.json(powers);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: 'Error retrieving card powers' });
	}
});

// POST create a new card power
router.post('/card-power', isLoggedIn, async (req, res) => {
	try {
		const { name, description, effectKey } = req.body;
		const newPower = new CardPower({ name, description, effectKey });
		await newPower.save();
		return res.status(201).json(newPower);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: 'Error creating card power' });
	}
});

// PUT update a card power by ID
router.put('/card-power/:id', isLoggedIn, async (req, res) => {
	try {
		const { id } = req.params;
		const { name, description, effectKey } = req.body;
		const updatedPower = await CardPower.findByIdAndUpdate(
			id,
			{ name, description, effectKey, modifiedAt: Date.now() },
			{ new: true }
		);
		if (!updatedPower) {
			return res.status(404).json({ error: 'Card power not found' });
		}
		return res.json(updatedPower);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: 'Error updating card power' });
	}
});

// DELETE remove a card power by ID
router.delete('/card-power/:id', isLoggedIn, async (req, res) => {
	try {
		const { id } = req.params;
		const deletedPower = await CardPower.findByIdAndDelete(id);
		if (!deletedPower) {
			return res.status(404).json({ error: 'Card power not found' });
		}
		return res.json({ message: 'Card power deleted successfully' });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: 'Error deleting card power' });
	}
});

module.exports = router;
