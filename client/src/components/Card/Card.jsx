import { useEffect, useRef, useState } from 'react';
import { useDrag, DragPreviewImage } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';

function Card({ card, isActionable, onClick }) {
  const [isTransformed, setIsTransformed] = useState(false);
  const boxRef = useRef(null);

  const [{ isDragging }, drag, dragPreview] = useDrag(() => ({
    type: 'CARD',
    item: card,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: function (props, monitor) {
      return isActionable;
    },
  }));

  useEffect(() => {
    dragPreview(getEmptyImage(), { captureDraggingState: true });

    if (false) {
      const handleKeyDown = (event) => {
        if (event.key === 'Alt') {
          event.preventDefault();
          setIsTransformed(true); // Enable transform when Alt is pressed
        }
      };

      const handleKeyUp = (event) => {
        if (event.key === 'Alt') {
          event.preventDefault();
          setIsTransformed(false); // Disable transform when Alt is released
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
      };
    }
  }, [dragPreview]);

  return (
    <div ref={boxRef} onClick={onClick}>

      {/* Hide the default drag preview */}
      <DragPreviewImage connect={getEmptyImage} src={card?.img} />

      <div
        ref={drag}
        className="card"
        style={{
          opacity: isDragging ? 0 : 1, // Hide the original card when dragging
          cursor: 'grab',
          transform: isTransformed ? 'scale(2.5)' : 'scale(1)',
        }}
      >
        <img src={card?.img} alt={card?.name} className="card-image" />
        <p className="card-name">{card?.name}</p>
      </div>
    </div>
  );
}

export default Card;