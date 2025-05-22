import React from "react";
import { useDrop } from "react-dnd";
import Card, { DraggableCard } from "../../../components/Card";

function DroppableArea({ title, onDrop, style }) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "CARD",
    drop: (item) => onDrop(item),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`active-cards droppable-area ${isOver ? "active-drop" : ""}`}
      style={style}
    >
      {title}
    </div>
  );
}

function MiddleArea({ opponentActiveCards, playerActiveCards, handleDropOnPlayer }) {
  return (
    <div className="middle-area">
      <div
        className="active-cards"
      >
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: "10px" }}>
          {opponentActiveCards.length > 0
            ? opponentActiveCards.map((card) => <Card key={card.id} card={card} />)
            : null}
        </div>
      </div>
      <DroppableArea
        title={
          playerActiveCards.length > 0
            ? playerActiveCards.map((card) => (
              <DraggableCard key={card.id} card={card} isActionable={true} isDraggable={false} />
            ))
            : null
        }
        onDrop={handleDropOnPlayer}
        style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "10px" }}
      />
    </div>
  );
}

export default MiddleArea;