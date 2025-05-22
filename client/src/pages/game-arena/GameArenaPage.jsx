import React, { useState, useEffect, useMemo } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useLocation } from "react-router-dom";
import useSocket from "../../hooks/useSocket";
import PageContainer from "../../containers/PageContainer";
import OpponentArea from "./containers/OpponentArea";
import PlayerArea from "./containers/PlayerArea";
import MiddleArea from "./containers/MiddleArea";
import ActionButtons from "./containers/ActionButtons";
import Chat from "./containers/chat";
import CustomDragLayer from "./components/CustomDragLayer";
import Card from "../../components/Card";
import ChatIcon from "@mui/icons-material/Chat"; // Using Material UI Chat icon
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
  const [chatOpen, setChatOpen] = useState(false);

  const { api, socket, connecting, hasjoined, error: connectionError, data, userId } =
    useSocket(SERVER_URL, gameId);

  // Compute myPlayer and enemyPlayer
  const { myPlayer, enemyPlayer } = useMemo(() => {
    if (!data || !data.players) return { myPlayer: null, enemyPlayer: null };
    const myPlayer = data.players.find((p) => p.id === userId);
    const enemyPlayer = data.players.find((p) => p.id !== userId);
    return { myPlayer, enemyPlayer };
  }, [data, userId]);

  useEffect(() => {
    if (data) {
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
      setIsMyTurn(activePlayer && activePlayer.id === userId);
    }
  }, [data, userId]);

  const handleDropOnPlayer = (item) => {
    api.playerPlayCard(item.id);
  };

  const renderStack = (stack) => {
    return Array.from({ length: stack?.count }).map((_, index) => (
      <div
        key={`stack-card-${index}`}
        className="stack-card"
        style={{
          position: "absolute",
          top: `${index * 5}px`,
          left: `${index * 5}px`,
          zIndex: index,
        }}
      >
        <Card isFaceUp={false} alt="Card Back" />
      </div>
    ));
  };

  const toggleChat = () => {
    setChatOpen((prev) => !prev);
  };

  return (
    <PageContainer isLoading={!connecting && !hasjoined} loadingMessage="Loading game..." error={connectionError}>
      <DndProvider backend={HTML5Backend}>
        <CustomDragLayer />

        {/* Left side profiles */}
        <div className="left-profiles">
          <div className={`profile ${!isMyTurn ? 'active-turn' : ''}`}>
            <img className="profile-pic" src="https://picsum.photos/200/300" alt="Opponent" />
            <div className="profile-info">
              <span className="profile-name">{enemyPlayer?.name}</span>
              <div className="profile-stats">
                <span className="profile-hp">❤️ {opponentHealth}</span>
                <span className="profile-mana">💧 {opponentEnergy}</span>
              </div>
            </div>
          </div>
          <div className={`profile ${isMyTurn ? 'active-turn' : ''}`}>
            <img className="profile-pic" src="https://picsum.photos/200/300" alt="Player" />
            <div className="profile-info">
              <span className="profile-name">{myPlayer?.name}</span>
              <div className="profile-stats">
                <span className="profile-hp">❤️ {playerHealth}</span>
                <span className="profile-mana">💧 {playerEnergy}</span>
              </div>
            </div>
          </div>
        </div>

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
            onAttack={(playerCard, opponentCard) => {
              api.playerAttack(playerCard.id, opponentCard.id);
            }}
          />
          <PlayerArea
            playerHand={playerHand}
            playerHealth={playerHealth}
            playerEnergy={playerEnergy}
          />
        </div>

        {/* Fixed ActionButtons positioned at bottom center with fancy styling */}
        {isMyTurn && (
          <div className="action-buttons-container">
            <ActionButtons onPass={api.playerPassTurn} onAttack={api.playerAttack} socket={socket} />
          </div>
        )}

        <div className="opponent-stack">
          <div className="stack-container">{renderStack(opponentStack)}</div>
        </div>

        <div className="player-stack">
          <div className="stack-container">{renderStack(playerStack)}</div>
        </div>
      </DndProvider>

      {/* Chat toggle button remains the same */}
      <div className="chat-toggle" onClick={toggleChat}>
        <ChatIcon style={{ fontSize: 40, color: "#f7d155" }} />
      </div>

      {/* Always mount Chat and toggle visibility with a CSS class */}
      <div className={`chat-overlay ${chatOpen ? "open" : "closed"}`}>
        <Chat socket={socket} />
      </div>
    </PageContainer>
  );
}

export default GameArenaPage;