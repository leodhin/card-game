import React, { useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { getCardList } from '../../services/card-service';
import PageContainer from "../../containers/PageContainer";

import Card from '../../components/Card/Card';
import './CardsList.css';

function CardsListPage() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <PageContainer isLoading={loading} error={error}>
      <DndProvider backend={HTML5Backend}>
        <div className="cards-list-matrix">
          {cards.map((card) => (
            <Card key={card.id} card={card} isActionable={true} />
          ))}
        </div>
      </DndProvider>
    </PageContainer>
  );
}

export default CardsListPage;