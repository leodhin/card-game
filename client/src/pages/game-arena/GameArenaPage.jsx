import React, { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useLocation } from "react-router-dom";
import useSocket from "../../hooks/useSocket";
import PageContainer from "../../containers/PageContainer";
import OpponentArea from "./containers/OpponentArea";
import PlayerArea from "./containers/PlayerArea";
import MiddleArea from "./containers/MiddleArea";
import ActionButtons from "./containers/ActionButtons";
import CustomDragLayer from "./components/CustomDragLayer";
import Card from "../../components/Card/Card";
import "./GameArenaPage.css";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

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
  const [playerStack, setPlayerStack] = useState(
    Array.from({ length: 10 }, (_, index) => ({
      id: `player-card-${index}`,
      name: `Player Card ${index + 1}`,
      isFaceUp: false,
    }))
  );

  const onGameStateUpdate = (data, socketId) => {
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
    <PageContainer isLoading={connecting} loadingMessage="Finding players..." error={connectionError}>
      <DndProvider backend={HTML5Backend}>
        <CustomDragLayer />
        <div className="game-board">
          <OpponentArea
            cards={opponentHand}
            opponentHealth={opponentHealth}
            opponentEnergy={opponentEnergy}
          />
          <MiddleArea
            opponentActiveCards={opponentActiveCards}
            playerActiveCards={playerActiveCards}
            handleDropOnPlayer={handleDropOnPlayer}
          />
          <PlayerArea
            playerHand={playerHand}
            playerHealth={playerHealth}
            playerEnergy={playerEnergy}
          />
        </div>


        {isMyTurn && (
          <ActionButtons
            emitEvent={emitEvent}
            socket={socket}
          />
        )}

        {/* Opponent Stack
        <div className="opponent-stack">
          <div className="stack-container">{renderStack([])}</div>
        </div>
        */}
        {/* Player Stack 
        <div className="player-stack">
          <div className="stack-container">{renderStack(playerStack)}</div>
        </div>
        */}
      </DndProvider>
    </PageContainer>
  );
}

export default GameArenaPage;