const Deck = require('../../models/Deck.model');
const Card = require('../../models/Card.model');

exports.createOrUpdateDeck = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId)
      return res.status(401).json({ error: 'User not authenticated' });

    const { name, cards, createdBy } = req.body;

    if (!Array.isArray(cards) || cards.length === 0) {
      return res.status(400).json({ error: 'You must provide a list of card IDs' });
    }
    // Check if a deck with the same name already exists for this user
    const existingDeck = await Deck.findOne({ userId, name });
    if (existingDeck) {
      // Update the existing deck
      existingDeck.cards = cards;
      existingDeck.createdBy = createdBy;
      await existingDeck.save();
      return res.status(200).json(existingDeck);
    }

    // Validate that all provided card IDs exist in the database
    const foundCards = await Card.find({ _id: { $in: cards } });
    const foundIds = foundCards.map(c => c._id.toString());

    const allExist = cards.every(id => foundIds.includes(id.toString()));

    if (!allExist) {
      return res.status(400).json({ error: 'One or more provided card IDs do not exist' });
    }

    // Create a new deck if one doesn't exist
    let deck = new Deck({ userId, name, cards, createdBy });
    await deck.save();
    return res.status(201).json(deck);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error posting deck' });
  }
};

exports.getDeckList = async (req, res) => {
  try {
    const userId = req.userId;
    const decks = await Deck.find({ userId }).populate('cards');
    return res.json(decks);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error obtaining decks list' });
  }
};

exports.getDeckById = async (req, res) => {
  try {
    const { deckId } = req.params;
    let deck = await Deck.findById(deckId).populate('cards');

    if (!deck) {
      return res.status(404).json({ error: 'Deck not found' });
    }

    return res.json(deck);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error obtaining deck' });
  }
};

exports.updateDeck = async (req, res) => {
  try {
    const userId = req.userId;
    const { deckId } = req.params;
    const { name, cards, createdBy } = req.body;

    if (!Array.isArray(cards) || cards.length === 0) {
      return res.status(400).json({ error: 'You must provide a list of card IDs' });
    }
    // Validate that all provided card IDs exist in the database
    const foundCards = await Card.find({ _id: { $in: cards } });
    const foundIds = foundCards.map(c => c._id.toString());
    const allExist = cards.every(id => foundIds.includes(id.toString()));
    if (!allExist) {
      return res.status(400).json({ error: 'One or more provided card IDs do not exist' });
    }
    let deck = await Deck.findOne({ userId, _id: deckId });
    if (!deck) {
      return res.status(404).json({ error: 'Deck not found' });
    }
    deck.name = name;
    deck.cards = cards;
    deck.createdBy = createdBy;
    await deck.save();
    return res.status(200).json(deck);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error updating deck' });
  }
};

exports.deleteDeck = async (req, res) => {
  try {
    const { deckId } = req.params;
    const deck = await Deck.findByIdAndDelete(deckId);
    if (!deck) {
      return res.status(404).json({ error: 'Deck not found' });
    }
    return res.json({ message: 'Deck deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error deleting deck' });
  }
};

