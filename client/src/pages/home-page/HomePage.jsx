import React from "react";
import { HeaderElementLayout } from "../../containers/Header";
import PageContainer from "../../containers/PageContainer";
import "./HomePage.css";

function HomePage() {
  const handleFindGame = () => {

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