import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { updateDeck, getDeck } from "../../services/deck-service";
import Card from "../../components/Card";

function DeckDetailsPage() {
  const { deckId } = useParams(); // Get the deck ID from the URL
  const [deckDetails, setDeckDetails] = useState(null);
  const [cards, setCards] = useState([]);

  useEffect(() => {
    const fetchDeckDetails = async () => {
      try {
        const deck = await getDeck(deckId);
        setDeckDetails(deck);
        setCards(deck.cards || []);
      } catch (error) {
        console.error("Error fetching deck details:", error);
      }
    };

    fetchDeckDetails();
  }, [deckId]);

  const handleCardChange = (index, field, value) => {
    const updatedCards = [...cards];
    updatedCards[index] = { ...updatedCards[index], [field]: value };
    setCards(updatedCards);
  };

  const handleSaveDeck = async () => {
    try {
      const updatedDeck = { ...deckDetails, cards };
      await updateDeck(deckId, updatedDeck);
      alert("Deck updated successfully!");
    } catch (error) {
      console.error("Error updating deck:", error);
      alert("Failed to update deck. Please try again.");
    }
  };

  const handleAddCard = () => {
    const newCard = {
      name: "New Card",
      img: "default-card.png", // Placeholder image
      attack: 0,
      defense: 0,
    };
    setCards([...cards, newCard]);
  };

  const handleDeleteCard = (index) => {
    const updatedCards = cards.filter((_, i) => i !== index);
    setCards(updatedCards);
  };

  if (!deckDetails) {
    return <p>Loading deck details...</p>;
  }

  return (
    <div>
      <h1>Deck Details</h1>
      <p>Deck Name: {deckDetails.name}</p>
      <p>Deck ID: {deckId}</p>
      <div>
        <h2>Cards</h2>
        <button onClick={handleAddCard} style={{ marginBottom: "20px" }}>
          Add New Card
        </button>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
          {cards.map((card, index) => (
            <div
              key={card._id}
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                borderRadius: "5px",
                position: "relative",
              }}
            >
              <Card card={card} isFaceUp={true} />
              <div style={{ marginTop: "10px" }}>
                <label>
                  Name:
                  <input
                    type="text"
                    value={card.name}
                    onChange={(e) => handleCardChange(index, "name", e.target.value)}
                  />
                </label>
                <label>
                  Attack:
                  <input
                    type="number"
                    value={card.attack}
                    onChange={(e) => handleCardChange(index, "attack", e.target.value)}
                  />
                </label>
                <label>
                  Defense:
                  <input
                    type="number"
                    value={card.defense}
                    onChange={(e) => handleCardChange(index, "defense", e.target.value)}
                  />
                </label>
              </div>
              <button
                onClick={() => handleDeleteCard(index)}
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  background: "red",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  padding: "5px",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
      <button onClick={handleSaveDeck} style={{ marginTop: "20px" }}>
        Save Deck
      </button>
    </div>
  );
}

export default DeckDetailsPage;