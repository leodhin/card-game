import { DraggableCard } from "../../../components/Card";

function PlayerArea({ playerHand }) {
  const totalCards = playerHand.length;
  const mid = (totalCards - 1) / 2;
  return (
    <div className="player-area">
      {playerHand?.map((card, index) => {
        const offsetX = (index - mid) * 35;
        const rotation = (index - mid) * 2;
        return (
          <div
            key={card.id || `player-card-${index}`}
            className="tcg-card-wrapper"
            style={{
              "--offsetX": `${offsetX}px`,
              "--rotation": `${rotation}deg`,
              zIndex: index,
            }}
          >
            <DraggableCard
              isFaceUp={true}
              card={card}
              isDraggable={true}
              isActionable={true}
            />
          </div>
        );
      })}
    </div>
  );
}

export default PlayerArea;