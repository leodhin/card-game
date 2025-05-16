import React, { useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useNavigate } from 'react-router-dom';

import { getCardList, deleteCard } from '../../services/card-service';
import PageContainer from "../../containers/PageContainer";

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
  }
  return (
    <PageContainer isLoading={loading} error={error}>
      <div className="cards-list-matrix">
        {cards.map((card) => (
          <Card key={card.id} card={card} isActionable={true} onEdit={() => handleEditCard(card._id)} onDelete={() => handleDeleteCard(card._id)} />
        ))}
      </div>
    </PageContainer>
  );
}

export default CardsListPage;