import React, { useState, useEffect } from "react";
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
import Card from "../../components/Card";
import "./GameArenaPage.css";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

function GameArenaPage() {
  const location = useLocation();
  const gameId = location.pathname.split("/").pop();

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
  const [playerStack, setPlayerStack] = useState([]);
  const [opponentStack, setOpponentStack] = useState([]);

  const { emitEvent, socket, connecting, hasjoined, error: connectionError, data, userId } =
    useSocket(SERVER_URL, gameId);

  useEffect(() => {
    if (data) {
      const myPlayer = data.players.find((p) => p.id === userId);
      const enemyPlayer = data.players.find((p) => p.id !== userId);

      setPlayerStack(myPlayer.deck);
      setOpponentStack(enemyPlayer.deck);

      if (myPlayer) {
        setPlayerHealth(myPlayer.health);
        setPlayerEnergy(myPlayer.energy);
        setPlayerHand(myPlayer.hand);
        setPlayerActiveCards(myPlayer.field);
      }
      if (enemyPlayer) {
        setOpponentHand(enemyPlayer.hand);
        setOpponentHealth(enemyPlayer.health);
        setOpponentEnergy(enemyPlayer.energy);
        setOpponentActiveCards(enemyPlayer.field);
      }

      const activePlayer = data.players[data.currentTurn];
      setGamePhase(data.phase);
      setIsMyTurn(activePlayer && activePlayer.id === userId && data.state === "playing");
    }
  }, [data, userId]);

  const handleDropOnPlayer = (item) => {
    emitEvent("playCard", item?.id);
  };

  const renderStack = (stack) => {
    return Array.from({ length: stack?.count }).map((_, index) => (
      <div
        key={`stack-card-${index}`}
        className="stack-card"
        style={{
          position: "absolute",
          top: `${index * 2}px`,
          left: `${index * 2}px`,
          zIndex: index,
        }}
      >
        <Card isFaceUp={false} alt="Card Back" className="stack-card-image" />
      </div>
    ));
  };

  console.log("connectionError", connectionError);
  return (
    <PageContainer isLoading={!connecting && !hasjoined} loadingMessage="Loading game..." error={connectionError}>
      <DndProvider backend={HTML5Backend}>
        <CustomDragLayer />

        {/* Left side profiles */}
        <div className="left-profiles">
          <div className="profile opponent-profile">
            <img className="profile-pic" src="https://picsum.photos/200/300" alt="Opponent" />
            <span className="profile-name">Enemy nickname</span>
          </div>
          <div className="profile player-profile">
            <img className="profile-pic" src="https://picsum.photos/200/300" alt="Player" />
            <span className="profile-name">Player nickname</span>
          </div>
        </div>

        <div className="game-board">
          <OpponentArea
            cards={opponentHand}
            opponentHealth={opponentHealth}
            opponentEnergy={opponentEnergy}
            isActive={!isMyTurn}
          />
          <MiddleArea opponentActiveCards={opponentActiveCards} playerActiveCards={playerActiveCards} handleDropOnPlayer={handleDropOnPlayer} />
          <PlayerArea
            playerHand={playerHand}
            playerHealth={playerHealth}
            playerEnergy={playerEnergy}
            isActive={isMyTurn}
          />
        </div>

        {isMyTurn && <ActionButtons emitEvent={emitEvent} socket={socket} />}

        <div className="opponent-stack">
          <div className="stack-container">{renderStack(opponentStack)}</div>
        </div>

        <div className="player-stack">
          <div className="stack-container">{renderStack(playerStack)}</div>
        </div>
      </DndProvider>
    </PageContainer>
  );
}

export default GameArenaPage;