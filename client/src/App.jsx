import './App.css';
import card1 from './assets/card1.png';
import card2 from './assets/card2.png';
import card3 from './assets/card3.png';
import card4 from './assets/card4.png';
import card5 from './assets/card5.png';
import card6 from './assets/card6.png';
import card7 from './assets/card7.png';
import { DndProvider, useDrop, useDragLayer } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useState } from 'react';
import Card from './components/Card/Card';

const cards = [
  { id: 1, name: 'Splash bee', img: card1 },
  { id: 2, name: 'Galatic goblin', img: card2 },
  { id: 3, name: 'Chamiligon', img: card3 },
  { id: 4, name: 'Chamilifenix', img: card4 },
  { id: 5, name: 'Chamilisaur', img: card5 },
  { id: 6, name: 'Chamilisaur', img: card6 },
  { id: 7, name: 'Chamilisaur', img: card7 },
];


function DroppableArea({ title, onDrop }) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'CARD',
    drop: (item) => onDrop(item),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className="active-cards"
      style={{
        backgroundColor: isOver ? '#d4edda' : '#f8d7da',
      }}
    >
      {title}
    </div>
  );
}

function CustomDragLayer() {
  const { item, isDragging, currentOffset, initialOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    isDragging: monitor.isDragging(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getSourceClientOffset(),
  }));

  if (!isDragging || !currentOffset) {
    return null;
  }

  const { x, y } = currentOffset;

  return (
    <div className="custom-drag-layer">
      <div
        className="drag-preview"
        style={{
          transform: `translate(${x}px, ${y}px) rotate(-10deg)`, // Tilt the card
        }}
      >
        <img src={item.img} alt={item.name} className="drag-preview-image" />
      </div>
    </div>
  );
}

function App() {
  const [opponentCards, setOpponentCards] = useState(cards.slice(3));
  const [playerCards, setPlayerCards] = useState(cards.slice(0, 3));
  const [opponentActiveCards, setOpponentActiveCards] = useState([]);
  const [playerActiveCards, setPlayerActiveCards] = useState([]);
  const [playerCardDeck, setPlayerCardDeck] = useState(cards.slice(0, 3)); // Player's deck
  const [movingCard, setMovingCard] = useState(null); // Track the card being moved

  const handleCardClick = (card) => {
    // Set the moving card to trigger the animation
    setMovingCard(card);

    // After the animation ends, move the card to the player's active cards
    setTimeout(() => {
      setPlayerCards((prev) => [...prev, card]);
      setPlayerCardDeck((prev) => prev.filter((c) => c.id !== card.id)); // Remove from the deck
      setMovingCard(null); // Reset the moving card
    }, 500); // Match the animation duration
  };

  const handleDropOnPlayer = (item) => {
    // Move the card to the player's active cards
    setPlayerActiveCards((prev) => [...prev, item]);
    setPlayerCards((prev) => prev.filter((c) => c.id !== item.id));
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <CustomDragLayer />
      <div className="game-board">
        {/* Opponent Area */}
        <div className="opponent-area">
          <div className="opponent-cards">
            {opponentCards.map((card) => (
              <Card key={card.id} card={card} isDraggable={true} />
            ))}
          </div>
          <div className="opponent-stack">
            {opponentCards.map((card, index) => (
              <Card
                key={card.id}
                card={card}
                isDraggable={true}
                style={{
                  '--stack-offset': `${index * 10}px`, // Adjust overlap
                  '--stack-index': index,
                }}
              />
            ))}
          </div>
        </div>

        {/* Middle Area */}
        <div className="middle-area">
          <div className="active-cards">
            {opponentActiveCards.length > 0
              ? opponentActiveCards.map((card) => (
                <Card key={card.id} card={card} />
              ))
              : 'Opponent Active Cards'}
          </div>
          <DroppableArea
            title={
              playerActiveCards.length > 0
                ? playerActiveCards.map((card) => (
                  <Card key={card.id} card={card} />
                ))
                : 'Player Active Cards'
            }
            onDrop={handleDropOnPlayer}
          />
        </div>

        {/* Player Area */}
        <div className="player-area">
          <div className="player-cards">
            {playerCards.map((card) => (
              <Card key={card.id} card={card} isDraggable={true} isActionable={true} />
            ))}
          </div>
          <div className="player-stack">
            {playerCardDeck.map((card, index) => (
              <Card
                key={card.id}
                card={card}
                isDraggable={false} // Disable dragging for deck cards
                onClick={() => handleCardClick(card)} // Move card on click
                style={{
                  '--stack-offset': `${index * 10}px`, // Adjust overlap
                  '--stack-index': index,
                  '--is-moving': movingCard?.id === card.id ? 'true' : 'false', // Add moving state
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </DndProvider>
  );
}

export default App;