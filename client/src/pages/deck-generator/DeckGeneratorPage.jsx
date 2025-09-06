import React, { useState, useEffect, useRef } from "react";
import { getCardList } from "../../services/card-service";
import { createDeck } from "../../services/deck-service";
import PageContainer from "../../containers/PageContainer";
import Card from "../../components/Card";

import "./DeckGeneratorPage.css";

const DeckGeneratorPage = () => {
  const [deckName, setDeckName] = useState("");
  const [availableCards, setAvailableCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await getCardList();
        setAvailableCards(response);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, []);

  const handleDeckNameChange = (e) => {
    setDeckName(e.target.value);
  };

  const handleAddCardToDeck = (card) => {
    setSelectedCards((prevCards) => [...prevCards, card]);
  };

  const handleRemoveCardFromDeck = (index) => {
    setSelectedCards((prevCards) => prevCards.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: deckName,
      cards: selectedCards.map((card) => card._id), // Send only card IDs
    };

    try {
      const response = await createDeck(payload);
      console.log("Deck Created:", response);
      alert("Deck successfully created!");
    } catch (error) {
      console.error("Error creating deck:", error);
      alert("Failed to create deck. Please try again.");
    }
  };

  const handlePostDeck = async () => {
    const payload = {
      name: deckName,
      cards: selectedCards.map((card) => card._id), // Send only card IDs
    };

    try {
      const response = await createDeck(payload); // Replace with your post logic
      console.log("Deck Posted:", response);
      alert("Deck successfully posted!");
    } catch (error) {
      console.error("Error posting deck:", error);
      alert("Failed to post deck. Please try again.");
    }
  };

  return (
    <PageContainer isLoading={loading} error={error} full={true}>
      <div className="deck-generator-container">
        <form onSubmit={handleSubmit} className="deck-generator-form">

          <div className="deck-builder">
            <div className="form-group">
              <label htmlFor="deckName">Deck Name:</label>
              <input
                type="text"
                id="deckName"
                name="deckName"
                value={deckName}
                onChange={handleDeckNameChange}
                placeholder="Enter deck name"
                required
              />

              <button
                type="button"
                className="post-deck-button"
                onClick={handlePostDeck}
                style={{
                  marginTop: "20px",
                  padding: "10px 20px",
                  fontSize: "14px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Post Deck
              </button>
            </div>
            <div className="available-cards">
              <h2>Available Cards</h2>
              <div className="cards-grid">
                {availableCards.map((card) => (
                  <Card card={card} key={card._id} onClick={() => handleAddCardToDeck(card)} />
                ))}
              </div>
            </div>
            <div className="selected-cards">
              <h2>Selected Cards</h2>
              <div className="cards-grid">
                {selectedCards.map((card, index) => (
                  <Card card={card} key={`${card._id}-${index}`} onClick={() => handleRemoveCardFromDeck(index)} />
                ))}
              </div>

            </div>
          </div>
        </form>
      </div>
    </PageContainer>
  );
};

export default DeckGeneratorPage;