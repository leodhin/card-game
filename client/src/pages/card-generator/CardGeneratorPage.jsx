import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Card from "../../components/Card";

import { createCard, getCardById, updateCard, generateAIImage } from "../../services/card-service";
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
  // New state for modal and input prompt
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");

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

  // Modified function: Now opens the modal instead of generating immediately
  const handleGenerateImage = () => {
    setIsModalOpen(true);
  };

  // New function: Confirm image generation using the prompt entered in modal
  const handleConfirmGenerateImage = async () => {
    if (!aiPrompt) {
      alert("Please provide a prompt for image generation.");
      return;
    }
    setLoading(true);
    try {
      const result = await generateAIImage(aiPrompt);
      if (result?.image) {
        const response = await fetch(result.image);
        const imageBinary = await response.blob();
        const reader = new FileReader();
        reader.readAsDataURL(imageBinary);
        reader.onloadend = () => {
          const base64data = reader.result;
          setCardData(prevData => ({ ...prevData, img: base64data }));
        };
      }
    } catch (err) {
      alert("Failed to generate image. Please try again.");
    } finally {
      setLoading(false);
      setIsModalOpen(false);
      setAiPrompt("");
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
          <Card card={cardData} style={{ width: "100%", height: "100%" }} />
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
              <label htmlFor="image">
                Card Image:
                <span
                  className="ai-generate-icon"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleGenerateImage();
                  }}
                  style={{ cursor: "pointer", marginLeft: "8px" }}
                >
                  ⭐
                </span>
              </label>
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
      {/* Modal for entering AI image prompt */}
      {isModalOpen && (
        <div className="modal-overlay" style={{
          position: "fixed",
          top: 0, left: 0,
          width: "100%", height: "100%",
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}>
          <div className="modal" style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "4px",
            minWidth: "300px"
          }}>
            <h2>Enter Image Description</h2>
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Describe the image..."
              style={{ width: "100%", marginBottom: "10px" }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setIsModalOpen(false)} style={{ marginRight: "10px" }}>
                Cancel
              </button>
              <button onClick={handleConfirmGenerateImage}>
                Generate
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default CardGeneratorPage;