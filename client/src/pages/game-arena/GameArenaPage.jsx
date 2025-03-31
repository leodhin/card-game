import React, { useState } from "react";
import { DndProvider, useDragLayer, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useLocation } from "react-router-dom";
import useSocket from "../../hooks/useSocket";
import Card from "../../components/Card/Card";
import "./GameArenaPage.css";
import PageContainer from "../../containers/PageContainer";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

function DroppableArea({ title, onDrop, style }) {
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
        ...style,
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

function GameArenaPage() {
  const location = useLocation();
  const gameId = location.pathname.split("/").pop();
  const nickname = localStorage.getItem("nickname");

  const [opponentHand, setOpponentHand] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);
  const [opponentActiveCards, setOpponentActiveCards] = useState([]);
  const [playerActiveCards, setPlayerActiveCards] = useState([]);
  const [playerHealth, setPlayerHealth] = useState(0);
  const [playerEnergy, setPlayerEnergy] = useState(0);
  const [opponentHealth, setOpponentHealth] = useState(0);
  const [opponentEnergy, setOpponentEnergy] = useState(0);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [gamePhase, setGamePhase] = useState("");
  const [drawingCard, setDrawingCard] = useState(null); // Card being animated

  const [opponentStack, setOpponentStack] = useState(
    Array.from({ length: 10 }, (_, index) => ({
      id: `opponent-card-${index}`,
      name: `Opponent Card ${index + 1}`,
      isFaceUp: false,
    }))
  );

  const [playerStack, setPlayerStack] = useState(
    Array.from({ length: 10 }, (_, index) => ({
      id: `player-card-${index}`,
      name: `Player Card ${index + 1}`,
      isFaceUp: false,
    }))
  );

  const onGameStateUpdate = (data, socketId) => {
    console.info("Game state updated:", data);
    const myPlayer = data.players.find((p) => p.id === socketId);
    if (myPlayer) {
      setPlayerHealth(myPlayer.health);
      setPlayerEnergy(myPlayer.energy);
      setPlayerHand(myPlayer.hand);
      setPlayerActiveCards(myPlayer.field);

      const opponent = data.players.find((p) => p.id !== socketId);
      if (opponent) {
        setOpponentHand(opponent.hand);
        setOpponentHealth(opponent.health);
        setOpponentEnergy(opponent.energy);
        setOpponentActiveCards(opponent.field);
      }

      const activePlayer = data.players[data.currentTurn];
      setGamePhase(data.phase);

      if (activePlayer && activePlayer.id === socketId && data.state === "playing") {
        setIsMyTurn(true);
      } else {
        setIsMyTurn(false);
      }
    }
  };

  const { emitEvent, socket, connecting, error: connectionError } = useSocket(SERVER_URL, gameId, nickname, onGameStateUpdate);

  const handleDropOnPlayer = (item) => {
    emitEvent("playCard", item.id);
  };


  const drawCardFromPlayerStack = () => {
    if (playerStack.length > 0) {
      const cardToDraw = playerStack[playerStack.length - 1]; // Get the top card
      setDrawingCard(cardToDraw); // Set the card being animated

      // Remove the card from the stack after the animation
      setTimeout(() => {
        setPlayerStack((prevStack) => prevStack.slice(0, -1)); // Remove the card from the stack
        setPlayerHand((prevHand) => [...prevHand, cardToDraw]); // Add the card to the player's hand
        setDrawingCard(null); // Clear the animated card
      }, 1000); // Match the animation duration
    }
  };

  const renderStack = (stack) => {
    return stack.map((card, index) => (
      <div
        key={card.id}
        className="stack-card"
        style={{
          position: "absolute",
          top: `${index * 5}px`, // Offset each card slightly
          left: `${index * 5}px`,
          zIndex: index,
        }}
      >
        <Card isFaceUp={false} alt="Card Back" className="stack-card-image" />
      </div>
    ));
  };

  return (
    <PageContainer isLoading={connecting} loadingMessage="Find players ..." error={connectionError}>
      <DndProvider backend={HTML5Backend}>
        <CustomDragLayer />
        <div className="game-board">
          {/* Opponent Area */}
          <div className="opponent-area">
            <div className="opponent-cards">
              {Array.from({ length: opponentHand.count }, (_, index) => (
                <Card key={index} isFaceUp={false} />
              ))}
            </div>
            <div className="opponent-hp-mana">
              <div className="opponent-hp">HP: {opponentHealth}</div>&nbsp;
              <div className="opponent-mana">Mana: {opponentEnergy}</div>
            </div>
          </div>

          {/** Buttons */}
          {isMyTurn && (
            <button
              className="attack-button"
              style={{ backgroundColor: 'red', color: 'white', fontWeight: 'bold', margin: '1rem', width: '100px', height: '50px' }}
              onClick={() => {
                if (socket) {
                  console.info("Emitting attack event");
                  emitEvent('attack');
                }
              }}>
              Attack!
            </button>
          )}
          {isMyTurn && (
            <button
              className="attack-button"
              style={{ backgroundColor: 'grey', color: 'white', fontWeight: 'bold', margin: '1rem', width: '100px', height: '50px' }}
              onClick={() => {
                if (socket) {
                  console.info("Emitting pass event");
                  emitEvent('pass');
                }
              }}>
              Pass
            </button>
          )}

          {/* Middle Area */}
          <div className="middle-area">
            <div className="active-cards" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {opponentActiveCards.length > 0
                ? opponentActiveCards.map((card) => (
                  <Card key={card.id} card={card} />
                ))
                : "Opponent Active Cards"}
            </div>
            <DroppableArea
              title={
                playerActiveCards.length > 0
                  ? playerActiveCards.map((card) => (
                    <Card key={card.id} card={card} isActionable={true} isDraggable={false} />
                  ))
                  : "Player Active Cards"
              }
              onDrop={handleDropOnPlayer}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            />
          </div>

          {/* Player Area */}
          <div className="player-area">
            <div className="player-hp-mana">
              <div className="player-hp">HP: {playerHealth}</div>
              &nbsp;
              <div className="player-mana">Mana: {playerEnergy}</div>
            </div>
            <div className="player-cards">
              {playerHand.map((card) => (
                <Card key={card.id} card={card} isDraggable={true} isActionable={true} />
              ))}
            </div>
          </div>
        </div>


        {/* Opponent Stack */}
        <div className="opponent-stack">
          <div className="stack-container">{renderStack([])}</div>
        </div>

        {/* Player Stack */}
        <div className="player-stack">
          <div className="stack-container" onClick={drawCardFromPlayerStack}>{renderStack(playerStack)}</div>
        </div>
        {/* Animated Card */}
        {drawingCard && (
          <div
            className="animated-card"
            style={{
              top: "calc(100% - 200px)", // Start from the stack's position
              left: "50px", // Adjust to match the stack's position
            }}
          >
            <Card isFaceUp={false} alt="Card Back" className="stack-card-image" />
          </div>
        )}
      </DndProvider>
    </PageContainer>
  );
}

export default GameArenaPage;