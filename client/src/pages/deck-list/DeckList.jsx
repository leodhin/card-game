import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listDecks, deleteDeck } from "../../services/deck-service";
import { Fab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import "./DeckList.css";
import PageContainer from "../../containers/PageContainer";

function DeckListPage() {
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
        setDecks((prevDecks) => prevDecks.filter((deck) => deck._id !== deckId));
      } catch (error) {
        console.error("Error deleting deck:", error);
        alert("Failed to delete deck. Please try again.");
      }
    }
  };

  const handleNavigateToDeck = (deckId) => {
    navigate(`/deck/${deckId}`);
  };

  const handleCreateNewDeck = () => {
    navigate('/deck-generator');
  };

  useEffect(() => {
    fetchDecks();
  }, []);

  return (
    <PageContainer isLoading={loading} error={error}>
      <div className="deck-list">
        {decks.map((deck) => (
          <div
            key={deck._id}
            className="deck-item"
            onClick={() => handleNavigateToDeck(deck._id)}
          >
            <div className="deck-header">
              <h2>{deck.name}</h2>
              <button
                className="delete-deck-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteDeck(deck._id);
                }}
              >
                Delete
              </button>
            </div>
            <p>Cards: {deck.cards.length}</p>
            <div className="deck-preview">
              {deck.cards.slice(0, 3).map((card) => (
                <img
                  key={card._id}
                  src={card.img}
                  alt={card.name}
                  className="deck-preview-card"
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <Fab
        color="tertiary"
        aria-label="add"
        onClick={handleCreateNewDeck}
        style={{ position: 'fixed', bottom: 30, right: 30 }}
      >
        <AddIcon />
      </Fab>
    </PageContainer>
  );
}

export default DeckListPage;