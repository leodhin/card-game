import { DraggableCard } from "../../../components/Card";

function PlayerArea({ playerHand, playerHealth, playerEnergy, isActive }) {
  return (
    <div className="player-area">
      {isActive && <div className="turn-indicator">Your Turn</div>}
      <div className="status-indicators">
        <div className="status-indicator mana-indicator">
          <span className="icon">✨</span>
          <span className="status-value">{playerEnergy}</span>
        </div>
        <div className="status-indicator life-indicator">
          <span className="icon">❤️</span>
          <span className="status-value">{playerHealth}</span>
        </div>
      </div>
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