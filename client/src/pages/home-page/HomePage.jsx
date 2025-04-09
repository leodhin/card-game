import React from "react";
import { useNavigate } from "react-router-dom";

import { HeaderElementLayout } from "../../containers/Header";
import PageContainer from "../../containers/PageContainer";
import { findGame } from "../../services/game-service";

import "./HomePage.css";

function HomePage() {
  const navigate = useNavigate();

  const handleFindGame = () => {
    findGame()
      .then((response) => {
        console.log("Game found:", response);
        navigate(`/game/${response.gameId}`);
      })
      .catch((error) => {
        console.error("Error finding game:", error);
      });
  };

  return (
    <>
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
            <button onClick={handleFindGame} className="play-game-button">
              Play Game
            </button>
          </div>
        </PageContainer>
      </HeaderElementLayout>
    </>
  );
}

export default HomePage;