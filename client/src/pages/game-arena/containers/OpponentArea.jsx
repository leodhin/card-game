import Card from "../../../components/Card/Card";

function OpponentArea({ cards }) {
  return (
    <div className="opponent-area">
      <div className="opponent-cards">
        {Array.from({ length: cards.count }, (_, index) => (
          <Card key={index} isFaceUp={false} />
        ))}
      </div>
    </div>
  );
}

export default OpponentArea;