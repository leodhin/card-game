const DeckModel = require("../../models/Deck.model");

module.exports.updateDeck = async (req, res) => {
    try {
        const { deckId } = req.params;
        const { name, cards, createdBy } = req.body;
        const deck = await DeckModel.findByIdAndUpdate(deckId, { name, cards, createdBy }, { new: true });
        if (!deck) {
            return res.status(404).json({ error: 'Deck not found' });
        }
        return res.json(deck);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error updating deck' });
    }
}

