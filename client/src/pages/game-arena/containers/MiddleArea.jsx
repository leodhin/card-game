import React, { useState, useEffect } from "react";
import { useDrop } from "react-dnd";
import Card, { DraggableCard } from "../../../components/Card";

function DroppableArea({ children, onDrop, style }) {
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
      {children}
    </div>
  );
}

function MiddleArea({
  opponentActiveCards,
  playerActiveCards,
  handleDropOnPlayer,
  onAttack,
}) {
  const [selectedAttackCard, setSelectedAttackCard] = useState(null);
  const [selectedTargetCard, setSelectedTargetCard] = useState(null);

  useEffect(() => {

    if (
      selectedAttackCard &&
      (selectedTargetCard || opponentActiveCards.length === 0)
    ) {
      onAttack(selectedAttackCard, selectedTargetCard);
      setSelectedAttackCard(null);
      setSelectedTargetCard(null);
    }
  }, [selectedAttackCard, selectedTargetCard, onAttack, opponentActiveCards]);

  const handleSelectAttackCard = (card) => {
    if (selectedAttackCard && selectedAttackCard._id === card._id) {
      // Unselect if the same card is clicked again
      setSelectedAttackCard(null);
    } else {
      setSelectedAttackCard(card);
    }
  };

  const handleSelectTargetCard = (card) => {
    if (selectedAttackCard) {
      if (selectedTargetCard && selectedTargetCard._id === card._id) {
        // Unselect if the same target is clicked again
        setSelectedTargetCard(null);
      } else {
        setSelectedTargetCard(card);
      }
    }
  };

  return (
    <div className="middle-area">
      <div className="active-cards">
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          {opponentActiveCards.length > 0 &&
            opponentActiveCards.map((card, idx) => (
              <div
                key={card.id || idx}
                onClick={() => handleSelectTargetCard(card)}
                style={{
                  transform:
                    selectedTargetCard && selectedTargetCard._id === card._id
                      ? "scale(1.1)"
                      : "scale(1)",
                  transition: "transform 0.2s",
                  cursor: selectedAttackCard ? "pointer" : "default",
                }}
              >
                <Card card={card} />
              </div>
            ))}
        </div>
      </div>
      <DroppableArea
        onDrop={handleDropOnPlayer}
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "10px",
        }}
      >
        {playerActiveCards.length > 0 &&
          playerActiveCards.map((card, idx) => (
            <div
              key={card.id || idx}
              onClick={() => handleSelectAttackCard(card)}
              style={{
                transform:
                  selectedAttackCard && selectedAttackCard._id === card._id
                    ? "scale(1.1)"
                    : "scale(1)",
                transition: "transform 0.2s",
                cursor: "pointer",
              }}
            >
              <DraggableCard
                card={card}
                isActionable={true}
                isDraggable={false}
              />
            </div>
          ))}
      </DroppableArea>
    </div>
  );
}

export default MiddleArea;