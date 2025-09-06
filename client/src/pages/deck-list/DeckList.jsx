import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isEmpty } from "lodash";

import { listDecks, deleteDeck } from "../../services/deck-service";
import PageContainer from "../../containers/PageContainer";
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Fab,
  Grid
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import BackCardPNG from '../../assets/back-card.png';

import "./DeckList.css";

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
    navigate("/deck-generator");
  };

  useEffect(() => {
    fetchDecks();
  }, []);

  return (
    <PageContainer isLoading={loading} error={error}>
      {!isEmpty(decks)
        ? (decks.map((deck) => (
          <Grid item xs={12} sm={6} md={4} key={deck._id}>
            <Card sx={{ width: 345 }}>
              <CardActionArea onClick={() => handleNavigateToDeck(deck._id)}>
                <CardMedia
                  component="img"
                  height="180"
                  image={deck.image ? deck.image : BackCardPNG}
                  alt={deck.name}
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {deck.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {deck.description ? deck.description : "No description available."}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Card Count: {deck.cards.length}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        )))
        : (
          <Typography variant="body1" sx={{ textAlign: 'center' }}>
            No decks available. Please create a new deck.
          </Typography>
        )}
      <Fab
        color="tertiary"
        aria-label="add"
        onClick={handleCreateNewDeck}
        style={{ position: "fixed", bottom: 30, right: 30 }}
      >
        <AddIcon />
      </Fab>
    </PageContainer>
  );
}

export default DeckListPage;