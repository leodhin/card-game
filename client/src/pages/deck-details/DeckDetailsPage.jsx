import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDeck } from "../../services/deck-service";
import PageContainer from "../../containers/PageContainer";
import { Box, Typography, Grid, Divider } from "@mui/material";
import Card from "../../components/Card";

function DeckDetailsPage() {
  const { deckId } = useParams();
  const navigate = useNavigate();
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

  const handleEditCard = (cardId) => {
    navigate(`/card/${cardId}`);
  };

  const handleDeleteCard = async (cardId) => {

  };

  return (
    <PageContainer isLoading={isLoading}>
      <Box sx={{ p: 3, minHeight: "100vh" }}>
        {/* Header Section */}
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: "bold",
              letterSpacing: 2,
              color: "primary.secondary",
            }}
          >
            {deckDetails?.name || "Unnamed Deck"}
          </Typography>
          <Divider sx={{ my: 2, borderColor: "grey.400" }} />
          {deckDetails?.description && (
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              {deckDetails.description}
            </Typography>
          )}
        </Box>
        {/* Cards Grid */}
        <Grid container spacing={3}>
          {cards.map((card, index) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={3}
              key={`${card?._id || "card"}-${index}`}
            >
              <Box>
                <Card
                  key={card.id}
                  card={card}
                  isActionable={true}
                  onEdit={() => handleEditCard(card._id)}
                  onDelete={() => handleDeleteCard(card._id)}
                />
                <Typography
                  variant="subtitle1"
                  sx={{ mt: 1, textAlign: "center", fontWeight: "bold" }}
                >
                  {card.name || "Unnamed Card"}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </PageContainer>
  );
}

export default DeckDetailsPage;