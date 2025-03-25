import card1 from '../../assets/card1.png';
import card2 from '../../assets/card2.png';
import card3 from '../../assets/card3.png';
import card4 from '../../assets/card4.png';
import card5 from '../../assets/card5.png';
import card6 from '../../assets/card6.png';
import card7 from '../../assets/card7.png';
import card8 from '../../assets/card8.png';
import card9 from '../../assets/card9.png';

import { DndProvider, useDrop, useDragLayer } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useState, useEffect } from 'react';
import Card from '../../components/Card/Card';
import io from 'socket.io-client';
import { useLocation } from 'react-router-dom';

const cards = [
  { id: 1, name: 'Splash Bee', img: card1, mana: 3, lore: 'A buzzing defender of the hive.' },
  { id: 2, name: 'Galactic Goblin', img: card2, mana: 5, lore: 'A mischievous traveler of the stars.' },
  { id: 3, name: 'Chamiligon', img: card3, mana: 2, lore: 'A sneaky creature that blends in anywhere.' },
  { id: 4, name: 'Chamilifenix', img: card4, mana: 4 },
  { id: 5, name: 'Chamilisaur', img: card5, mana: 6 },
  { id: 6, name: 'Chamilisaur', img: card6, mana: 1 },
  { id: 7, name: 'Chamilisaur', img: card7, mana: 3 },
  { id: 8, name: 'Chamilisaur', img: card8, mana: 2 },
  { id: 9, name: 'Chamilisaur', img: card9, mana: 4 },
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

const SERVER_URL = "localhost:3000"; // "https://9pwbk5xx-3000.uks1.devtunnels.ms/";

function GameArenaPage() {
  const [opponentCards, setOpponentCards] = useState([]);
  const [playerCards, setPlayerCards] = useState([]);
  const [opponentActiveCards, setOpponentActiveCards] = useState([]);
  const [playerActiveCards, setPlayerActiveCards] = useState([]);
  const [playerCardDeck, setPlayerCardDeck] = useState([]);
  const [movingCard, setMovingCard] = useState(null);
  const [socket, setSocket] = useState(null);

  const location = useLocation();

  const gameId = location.pathname.split('/').pop();


  useEffect(() => {
    const socket = io(SERVER_URL + '/game');
    setSocket(io(SERVER_URL + '/game'));

    socket.on('connect', () => {
      console.log('Connected to the server');
      socket.emit('ping');
    });

    socket.emit('joinRoom', gameId, localStorage.getItem('nickname'));

    socket.on('syncGameState', (data) => {
      console.log('syncGameState', data);
    });

    socket.on('error', () => {
      alert('ERROR - cant connect with server')
    });

    // CHAT GAME LOG, (DISCONNECT, CONNECT, USER CHATTING)
    socket.on('playerConnected', (nickname) => {
      const message = `${nickname} connected.`;
    });

    socket.on('playerDisconnected', (nickname) => {
      const message = ` ${nickname} disconnected.`;
    });

    socket.on('pong', () => {

    });

    socket.on('state', (data) => {
      const message = `State of the game  ${data}.`;
    });

    socket.on('receiveMessage', (player, message) => {
    });

    return () => {
      socket.disconnect();
    };
  }, []);

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
              <Card key={card.id} isFaceUp={false} />
            ))}
          </div>
          <div className="opponent-hp-mana">
            <div className="opponent-hp">HP: 30</div>&nbsp;
            <div className="opponent-mana">Mana: 10</div>
          </div>
          <div className="opponent-stack">
            {opponentCards.map((card, index) => (
              <Card
                key={card.id}
                style={{
                  position: "absolute",
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
                  <Card key={card.id} card={card} isActionable={true} isDraggable={false} />
                ))
                : 'Player Active Cards'
            }
            onDrop={handleDropOnPlayer}
          />
        </div>

        {/* Player Area */}
        <div className="player-area">
          <div className="player-hp-mana">
            <div className="player-hp">HP: 30</div>
            &nbsp;
            <div className="player-mana">Mana: 10</div>
          </div>
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
                onClick={() => handleCardClick(card)}
                isFaceUp={false}
                style={{
                  position: "absolute",
                  '--stack-offset': `${index * 10}px`, // Adjust vertical offset for stacking
                  '--stack-index': index, // Set stacking order
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </DndProvider>
  );
}

export default GameArenaPage;