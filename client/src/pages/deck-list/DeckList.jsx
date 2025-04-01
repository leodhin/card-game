import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { listDecks, deleteDeck } from "../../services/deck-service";

import "./DeckList.css";
import PageContainer from "../../containers/PageContainer";

function DeckListPage() {
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Initialize useNavigate

  const fetchDecks = async () => {
    try {
      const response = await listDecks();
      setDecks(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDeck = async (deckId) => {
    if (window.confirm("Are you sure you want to delete this deck?")) {
      try {
        await deleteDeck(deckId);
        alert("Deck successfully deleted!");
        // Remove the deleted deck from the state
        setDecks((prevDecks) => prevDecks.filter((deck) => deck._id !== deckId));
      } catch (error) {
        console.error("Error deleting deck:", error);
        alert("Failed to delete deck. Please try again.");
      }
    }
  };

  const handleNavigateToDeck = (deckId) => {
    navigate(`/deck/${deckId}`); // Navigate to the deck details page
  };

  useEffect(() => {
    fetchDecks();
  }, []);

  return (
    <PageContainer isLoading={loading} error={error}>
      <div className="deck-list-container">
        <h1>Deck List</h1>
        <div className="deck-list">
          {decks.map((deck) => (
            <div
              key={deck._id}
              className="deck-item"
              onClick={() => handleNavigateToDeck(deck._id)} // Add click handler
              style={{ cursor: "pointer" }} // Add pointer cursor for better UX
            >
              <h2>{deck.name}</h2>
              <p>Cards: {deck.cards.length}</p>
              <button
                className="delete-deck-button"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent navigation when clicking delete
                  handleDeleteDeck(deck._id);
                }}
              >
                Delete Deck
              </button>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}

export default DeckListPage;