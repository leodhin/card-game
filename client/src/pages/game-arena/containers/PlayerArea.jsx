import React from "react";
import Card from "../../../components/Card";

function PlayerArea({ playerHand, playerHealth, playerEnergy }) {
  return (
    <div className="player-area">
      <div className="player-hp-mana">
        <div className="player-hp">HP: {playerHealth}</div>&nbsp;
        <div className="player-mana">Mana: {playerEnergy}</div>
      </div>
      <div className="player-cards">
        {playerHand.map((card, index) => (
          <Card
            key={card.id || `player-card-${index}`}
            isFaceUp={true}
            card={card}
            isDraggable={true}
            isActionable={true}
          />
        ))}
      </div>
    </div>
  );
}

export default PlayerArea;