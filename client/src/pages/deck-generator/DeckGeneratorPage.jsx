import React, { useState, useEffect, useRef } from "react";
import { getCardList } from "../../services/card-service";
import { createDeck } from "../../services/deck-service";
import PageContainer from "../../containers/PageContainer";
import "./DeckGeneratorPage.css";

const DeckGeneratorPage = () => {
  const [deckName, setDeckName] = useState("");
  const [availableCards, setAvailableCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cardSelectRef = useRef(null);

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

  const handleAddCardToDeck = () => {
    const selectedCardId = cardSelectRef.current.value;


    const cardToAdd = availableCards.find((card) => String(card._id) === selectedCardId);
    setSelectedCards((prevCards) => [...prevCards, cardToAdd]);
  };

  const handleRemoveCardFromDeck = (cardId) => {
    setSelectedCards((prevCards) =>
      prevCards.filter((card) => card.id !== cardId)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: deckName,
      cards: selectedCards.map((card) => card._id), // Send only card IDs
    };

    try {
      const response = createDeck(payload);

      console.log("Deck Created:", response);
      alert("Deck successfully created!");
    } catch (error) {
      console.error("Error creating deck:", error);
      alert("Failed to create deck. Please try again.");
    }
  };


  return (
    <PageContainer isLoading={loading} error={error}>
      <div className="deck-generator-container">
        <h1>Deck Generator</h1>
        <form onSubmit={handleSubmit} className="deck-generator-form">
          <div className="form-group">
            <label htmlFor="deckName">Deck Name:</label>
            <input
              type="text"
              id="deckName"
              name="deckName"
              value={deckName}
              onChange={handleDeckNameChange}
              placeholder="Enter the deck's name"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="cardSelect">Select a Card:</label>
            <select id="cardSelect" ref={cardSelectRef}>
              <option value="" disabled>
                -- Select a Card --
              </option>
              {availableCards.map((card) => (
                <option key={card._id} value={card._id}>
                  {card.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="add-card-button"
              onClick={handleAddCardToDeck}
            >
              Add to Deck
            </button>
          </div>
          <div className="selected-cards">
            <h2>Selected Cards</h2>
            <div className="cards-list">
              {selectedCards.map((card) => (
                <div key={card.id} className="card-item">
                  <p>{card.name}</p>
                  <button
                    type="button"
                    onClick={() => handleRemoveCardFromDeck(card.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
          <button type="submit" className="submit-button">
            Create Deck
          </button>
        </form>
      </div>
    </PageContainer>
  );
};

export default DeckGeneratorPage;