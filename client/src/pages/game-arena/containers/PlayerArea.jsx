import { DraggableCard } from "../../../components/Card";

function PlayerArea({ playerHand }) {
  return (
    <div className="player-area">
      <div className="player-cards">
        {playerHand.map((card, index) => (
          <DraggableCard
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