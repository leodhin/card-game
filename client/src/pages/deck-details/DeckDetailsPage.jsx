import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { updateDeck, getDeck } from "../../services/deck-service";
import PageContainer from "../../containers/PageContainer";

function DeckDetailsPage() {
  const { deckId } = useParams(); // Get the deck ID from the URL
  const [deckDetails, setDeckDetails] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [cards, setCards] = useState([]);

  useEffect(() => {
    const fetchDeckDetails = async () => {
      try {
        const deck = await getDeck(deckId);
        setDeckDetails(deck);
        setCards(deck.cards || []);
      } catch (error) {
        console.error("Error fetching deck details:", error);
      } finally {
        setIsLoading(false);
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

  const handleDeleteCard = (index) => {
    const updatedCards = cards.filter((_, i) => i !== index);
    setCards(updatedCards);
  };

  return (
    <PageContainer isLoading={isLoading}>
      <h1>Deck Details</h1>
      <p>Deck Name: {deckDetails?.name}</p>
      <p>Deck ID: {deckId}</p>
      <div>
        <h2>Cards</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #ccc", padding: "10px" }}>Name</th>
              <th style={{ border: "1px solid #ccc", padding: "10px" }}>Image</th>
              <th style={{ border: "1px solid #ccc", padding: "10px" }}>Attack</th>
              <th style={{ border: "1px solid #ccc", padding: "10px" }}>Defense</th>
              <th style={{ border: "1px solid #ccc", padding: "10px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {cards.map((card, index) => (
              <tr key={`${card?._id || "card"}-${index}`}>
                <td style={{ border: "1px solid #ccc", padding: "10px" }}>
                  <input
                    type="text"
                    value={card.name}
                    onChange={(e) => handleCardChange(index, "name", e.target.value)}
                    style={{ width: "100%" }}
                  />
                </td>
                <td style={{ border: "1px solid #ccc", padding: "10px", textAlign: "center" }}>
                  <img
                    src={card.img}
                    alt={card.name}
                    style={{ width: "50px", height: "auto" }}
                  />
                </td>
                <td style={{ border: "1px solid #ccc", padding: "10px" }}>
                  <input
                    type="number"
                    value={card.attack}
                    onChange={(e) => handleCardChange(index, "attack", e.target.value)}
                    style={{ width: "100%" }}
                  />
                </td>
                <td style={{ border: "1px solid #ccc", padding: "10px" }}>
                  <input
                    type="number"
                    value={card.defense}
                    onChange={(e) => handleCardChange(index, "defense", e.target.value)}
                    style={{ width: "100%" }}
                  />
                </td>
                <td style={{ border: "1px solid #ccc", padding: "10px", textAlign: "center" }}>
                  <button
                    onClick={() => handleDeleteCard(index)}
                    style={{
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={handleSaveDeck} style={{ marginTop: "20px" }}>
        Save Deck
      </button>
    </PageContainer>
  );
}

export default DeckDetailsPage;