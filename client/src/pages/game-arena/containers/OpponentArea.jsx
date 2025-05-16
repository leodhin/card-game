import Card from "../../../components/Card/Card";

function OpponentArea({ cards, opponentHealth, opponentEnergy, isActive }) {
  return (
    <div className="opponent-area">
      {isActive && <div className="turn-indicator">Opponent Turn</div>}
      <div className="status-indicators">
        <div className="status-indicator mana-indicator">
          <span className="icon">✨</span>
          <span className="status-value">{opponentEnergy}</span>
        </div>
        <div className="status-indicator life-indicator">
          <span className="icon">❤️</span>
          <span className="status-value">{opponentHealth}</span>
        </div>
      </div>
      <div className="opponent-cards">
        {Array.from({ length: cards.count }, (_, index) => (
          <Card key={index} isFaceUp={false} />
        ))}
      </div>
    </div>
  );
}

export default OpponentArea;