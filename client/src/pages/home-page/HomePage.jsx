// HomePage.tsx
import React, { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { HeaderElementLayout } from "../../containers/Header";
import PageContainer from "../../containers/PageContainer";
import useMatchmakingSocket from "../../hooks/useLobbySocket";
import "./HomePage.css";

function HomePage() {
  const navigate = useNavigate();

  const { queue, cancel, status, match } =
    useMatchmakingSocket(import.meta.env.VITE_API_URL);

  /* Jump to the play page as soon as we’re matched */
  useEffect(() => {
    if (match) navigate(`/game/${match.gameId}`, { state: match });
  }, [match, navigate]);

  /* Button handler: enqueue when idle, or let the player cancel if they change their mind */
  const handleFindGame = useCallback(() => {
    if (status === "idle") queue();
    else if (status === "queued") cancel();
  }, [status, queue, cancel]);

  /* Simple text/loader you can replace with a spinner */
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
          <div className="home-center">
            <button
              onClick={handleFindGame}
              className="play-game-button"
              disabled={status === "matched"} /* matched → navigate next frame */
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
