import React from "react";
import { useDrop } from "react-dnd";
import Card, { DraggableCard } from "../../../components/Card";


function DroppableArea({ title, onDrop, style }) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'CARD',
    drop: (item) => onDrop(item),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className="active-cards"
      style={{
        backgroundColor: isOver ? '#d4edda' : null,
        ...style,
      }}
    >
      {title}
    </div>
  );
}

function MiddleArea({ opponentActiveCards, playerActiveCards, handleDropOnPlayer }) {
  return (
    <div className="middle-area">
      <div className="active-cards" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {opponentActiveCards.length > 0
          ? opponentActiveCards.map((card) => (
            <Card key={card.id} card={card} />
          ))
          : "Opponent Active Cards"}
      </div>
      <DroppableArea
        title={
          playerActiveCards.length > 0
            ? playerActiveCards.map((card) => (
              <DraggableCard key={card.id} card={card} isActionable={true} isDraggable={false} />
            ))
            : "Player Active Cards"
        }
        onDrop={handleDropOnPlayer}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      />
    </div>
  );
}

export default MiddleArea;