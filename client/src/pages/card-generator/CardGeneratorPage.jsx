import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Card from "../../components/Card";

import { createCard, getCardById, updateCard } from "../../services/card-service";
import PageContainer from "../../containers/PageContainer";

import "./CardGenerator.css";

const CardGeneratorPage = () => {
  const { cardId } = useParams(); // Get the card ID from the URL
  const navigate = useNavigate();
  const [cardData, setCardData] = useState({
    name: "",
    img: "",
    attack: 0,
    defense: 0,
    cost: 0,
    lore: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (cardId) {
      // If an ID is present, fetch the card data for editing
      const fetchCard = async () => {
        setLoading(true);
        try {
          const response = await getCardById(cardId);
          setCardData(response);
        } catch (err) {
          setError("Failed to load card data.");
        } finally {
          setLoading(false);
        }
      };

      fetchCard();
    }
  }, [cardId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCardData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCardData((prevData) => ({
          ...prevData,
          img: reader.result, // Store the Base64 string of the image
        }));
      };
      reader.readAsDataURL(file); // Convert the file to Base64
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (cardId) {
        // Update existing card
        await updateCard(cardId, cardData);
        alert("Card successfully updated!");
      } else {
        // Create new card
        await createCard(cardData);
        alert("Card successfully created!");
      }
      navigate("/card-list"); // Redirect to the card list page
    } catch (error) {
      console.error("Error submitting card data:", error);
      alert("Failed to submit card. Please try again.");
    }
  };

  if (loading) {
    return <PageContainer isLoading={true} loadingMessage="Loading card data..." />;
  }

  if (error) {
    return <PageContainer error={error} />;
  }

  return (
    <PageContainer>
      <div className="card-generator-grid">
        {/* Left Side: Card Preview */}
        <div className="card-preview">
          <Card card={cardData} />
        </div>

        {/* Right Side: Input Form */}
        <div className="card-form">
          <h1 className="card-generator-title">
            {cardId ? "Edit Card" : "Create New Card"}
          </h1>
          <form onSubmit={handleSubmit} className="card-generator-form">
            <div className="form-group">
              <label htmlFor="name">Card Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={cardData.name}
                onChange={handleChange}
                placeholder="Enter the card's name"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="image">Card Image:</label>
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>
            <div className="form-group">
              <label htmlFor="attack">Attack Points:</label>
              <input
                type="number"
                id="attack"
                name="attack"
                value={cardData.attack}
                onChange={handleChange}
                placeholder="Enter attack points"
              />
            </div>
            <div className="form-group">
              <label htmlFor="defense">Defense Points:</label>
              <input
                type="number"
                id="defense"
                name="defense"
                value={cardData.defense}
                onChange={handleChange}
                placeholder="Enter defense points"
              />
            </div>
            <div className="form-group">
              <label htmlFor="cost">Mana Cost:</label>
              <input
                type="number"
                id="cost"
                name="cost"
                value={cardData.cost}
                onChange={handleChange}
                placeholder="Enter mana cost"
              />
            </div>
            <div className="form-group">
              <label htmlFor="lore">Card Lore:</label>
              <textarea
                id="lore"
                name="lore"
                value={cardData.lore}
                onChange={handleChange}
                placeholder="Enter the card's backstory or lore"
              />
            </div>
            <button type="submit" className="submit-button">
              {cardId ? "Update Card" : "Generate Card"}
            </button>
          </form>
        </div>
      </div>
    </PageContainer>
  );
};

export default CardGeneratorPage;