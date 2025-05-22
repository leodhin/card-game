import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PageContainer from "../../containers/PageContainer";
import { getCardList, deleteCard } from '../../services/card-service';
import Card from '../../components/Card/Card';
import './CardsList.css';

function CardsListPage() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchCards = async () => {
    try {
      const response = await getCardList();
      setCards(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleEditCard = (cardId) => {
    navigate(`/card/${cardId}`);
  };

  const handleDeleteCard = async (cardId) => {
    try {
      await deleteCard(cardId);
      setCards((prevCards) => prevCards.filter((card) => card.id !== cardId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateNewCard = () => {
    navigate('/card-generator');
  };

  return (
    <PageContainer isLoading={loading} error={error}>
      <div className="cards-list-matrix">
        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            isActionable={true}
            onEdit={() => handleEditCard(card._id)}
            onDelete={() => handleDeleteCard(card._id)}
          />
        ))}
      </div>
      {/* Floating Action Button to create a new card */}
      <Fab
        color="tertiary"
        aria-label="add"
        onClick={handleCreateNewCard}
        style={{ position: 'fixed', bottom: 30, right: 30 }}
      >
        <AddIcon />
      </Fab>
    </PageContainer>
  );
}

export default CardsListPage;