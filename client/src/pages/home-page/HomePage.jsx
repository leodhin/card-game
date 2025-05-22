import React, { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { HeaderElementLayout } from "../../containers/Header";
import PageContainer from "../../containers/PageContainer";
import useMatchmakingSocket from "../../hooks/useLobbySocket";
import "./HomePage.css";

function HomePage() {
  const navigate = useNavigate();

  const { queue, cancel, status, match } = useMatchmakingSocket();

  useEffect(() => {
    if (match) navigate(`/game/${match.gameId}`, { state: match });
  }, [match, navigate]);

  const handleFindGame = useCallback(() => {
    if (status === "idle") queue();
    else if (status === "queued") cancel();
  }, [status, queue, cancel]);

  const buttonLabel =
    status === "queued" ? "Looking for opponent… (cancel)" : "Play Game";

  return (
    <HeaderElementLayout>
      <PageContainer isLoading={false} error={null}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
          }}
        >
          <div className="home-intro">
            <h1>Play your best deck</h1>
            <p>
              Engage in intense card battles against strategic opponents. Learn
              your skills, build your deck, and prove your mastery!
            </p>
            <p>
              Explore game rules, check out our tutorials, or dive straight into
              the action.
            </p>
          </div>
          <div className="home-center">
            <button
              onClick={handleFindGame}
              className="play-game-button"
              disabled={status === "matched"}
            >
              {buttonLabel}
            </button>
          </div>
        </div>
      </PageContainer>
    </HeaderElementLayout>
  );
}

export default HomePage;