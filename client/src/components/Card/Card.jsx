import React, { useState, useEffect } from 'react';
import { useDrag, DragPreviewImage } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { motion } from "framer-motion";
import './Card.css';

function Card({ card, isDraggable, isActionable, onClick, style, isFaceUp = true }) {
  const [isHovered, setIsHovered] = useState(false); // Track if the card is hovered
  const [isTransformed, setIsTransformed] = useState(false);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width - 0.5) * 40; // Adjust tilt intensity
    const y = ((e.clientY - top) / height - 0.5) * -10; // Invert Y for natural movement
    setRotate({ x, y });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  const [{ isDragging }, drag, dragPreview] = useDrag(() => ({
    type: 'CARD',
    item: card,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: () => isDraggable,
  }));

  useEffect(() => {
    dragPreview(getEmptyImage(), { captureDraggingState: true });

    if (isActionable) {
      const handleKeyDown = (event) => {
        if (event.key === 'Alt' && isHovered) {
          event.preventDefault();
          setIsTransformed(true); // Enable transform only for the hovered card
        }
      };

      const handleKeyUp = (event) => {
        if (event.key === 'Alt') {
          event.preventDefault();
          setIsTransformed(false); // Disable transform
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
      };
    }
  }, [isHovered, dragPreview, isActionable]);

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={isTransformed && { rotateX: rotate.y, rotateY: rotate.x }}
      transition={{ type: "spring", stiffness: 200, damping: 100 }}
      style={{ perspective: 1000 }}
    >
      <div
        ref={drag}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)} // Set hover state
        onMouseLeave={() => setIsHovered(false)} // Reset hover state
        className="card"
        style={{
          opacity: isDragging ? 0 : 1, // Hide the original card when dragging
          cursor: 'grab',
          transform: isTransformed ? 'scale(2.5)' : 'scale(1)', // Scale only the hovered card
          transformOrigin: 'bottom center', // Scale from the bottom center
          backgroundImage: isFaceUp
            ? `url(${card?.img})` // Show the front of the card
            : `url('/path/to/card-back-image.jpg')`, // Show the back of the card
          backgroundSize: 'cover', // Ensure the image covers the entire div
          backgroundPosition: 'center', // Center the image
          backgroundRepeat: 'no-repeat', // Prevent the image from repeating
          zIndex: isHovered ? 10 : 1, // Bring the hovered card to the top
          position: isHovered ? 'relative' : 'static', // Ensure proper stacking context
          ...style, // Spread the additional styles
        }}
      >
        {/* Hide the default drag preview */}
        <DragPreviewImage connect={getEmptyImage} src={card?.img} />

        {/* Show content only if the card is face up */}
        {isFaceUp && (
          <>
            {/* Mana Display */}
            <div className="mana-display">{card?.mana}</div>

            <div className="card-content">
              <p className="card-name">{card?.name}</p>
              <p className="card-lore">{card?.lore}</p>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

export default Card;