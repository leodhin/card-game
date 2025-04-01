import React from "react";
import Card from "../../../components/Card/Card";

function OpponentArea({ cards, opponentHealth, opponentEnergy }) {
  return (
    <div className="opponent-area">
      <div className="opponent-cards">
        {Array.from({ length: cards.count }, (_, index) => (
          <Card key={index} isFaceUp={false} />
        ))}
      </div>
      <div className="opponent-hp-mana">
        <div className="opponent-hp">HP: {opponentHealth}</div>&nbsp;
        <div className="opponent-mana">Mana: {opponentEnergy}</div>
      </div>
    </div>
  );
}

export default OpponentArea;