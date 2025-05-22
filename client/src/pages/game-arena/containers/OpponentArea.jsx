import React from "react";
import Card from "../../../components/Card/Card";

function OpponentArea({ cards, opponentHealth, opponentEnergy }) {
  const totalCards = cards.count;
  const mid = (totalCards - 1) / 2;
  return (
    <div className="opponent-area">
      {Array.from({ length: totalCards }, (_, index) => {
        const offsetX = (index - mid) * 35; // adjust spacing as needed
        const rotation = (index - mid) * 5;   // adjust angle as needed
        return (
          <div
            key={index}
            className="tcg-card-wrapper"
            style={{
              "--offsetX": `${offsetX}px`,
              "--rotation": `${rotation}deg`,
              zIndex: index,
            }}
          >
            <Card isFaceUp={false} />
          </div>
        );
      })}
    </div>
  );
}

export default OpponentArea;