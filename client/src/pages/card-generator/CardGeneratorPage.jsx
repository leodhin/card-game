import React, { useState } from "react";
import Card from "../../components/Card"; // Import the Card component
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { createCard } from "../../services/card-service";
import PageContainer from "../../containers/PageContainer";

import "./CardGenerator.css"; // Import the CSS file for styling

const CardGeneratorPage = () => {
  const [cardData, setCardData] = useState({
    name: "",
    img: "",
    attack: 0,
    defense: 0,
    cost: 0,
    lore: "",
  });

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

    const payload = {
      name: cardData.name,
      attack: cardData.attack,
      defense: cardData.defense,
      cost: cardData.cost,
      lore: cardData.lore,
      img: cardData.img, // Base64-encoded image
    };

    try {
      await createCard(payload);
      alert("Card successfully submitted!");
    } catch (error) {
      console.error("Error submitting card data:", error);
      alert("Failed to submit card. Please try again.");
    }
  };

  return (
    <PageContainer>
      <div className="card-generator-grid">
        {/* Left Side: Card Preview */}
        <div className="card-preview">
          <DndProvider backend={HTML5Backend}>
            <Card card={cardData} />
          </DndProvider>
        </div>

        {/* Right Side: Input Form */}
        <div className="card-form">
          <h1 className="card-generator-title">Card Generator</h1>
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
              Generate Card
            </button>
          </form>
        </div>
      </div>
    </PageContainer>
  );
};

export default CardGeneratorPage;