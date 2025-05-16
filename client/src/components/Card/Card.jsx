import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MoreVert } from '@mui/icons-material';

import BackCardPNG from '../../assets/back-card.png';
import './Card.css';

function Card({ card, isFaceUp = true, onClick, style, onEdit, onDelete }) {
  const [isHovered, setIsHovered] = useState(false);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    if (e.altKey) {

      const dx = e.clientX - (left + width / 2);
      const dy = e.clientY - (top + height / 2);
      const maxAngle = 50;

      const rotateY = -(dx / (width / 2)) * maxAngle;
      const rotateX = -(dy / (height / 2)) * maxAngle;
      setRotate({ x: rotateY, y: rotateX });
      setIsHovered(true);
    } else {
      setRotate({ x: 0, y: 0 });
      setIsHovered(false);
    }
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const toggleMenu = (e) => {
    e.stopPropagation();
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX: rotate.y, rotateY: rotate.x }}
      transition={{ type: 'spring', stiffness: 40, damping: 50 }}
      style={{ perspective: 1000, width: '100%', height: '100%' }}
    >
      <div
        onClick={onClick}
        onMouseEnter={(e) => setIsHovered(e.altKey)}
        onMouseLeave={handleMouseLeave}
        className="card"
        style={{
          transform: isHovered ? 'scale(1.5)' : 'scale(1)',
          transformOrigin: 'bottom center',
          backgroundImage: isFaceUp
            ? `url(${card?.img})`
            : `url(${BackCardPNG})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: isHovered ? 10 : 1,
          position: isHovered ? 'relative' : 'static',
          ...style,
        }}
      >
        {/* Three Dots Menu */}
        {(onEdit || onDelete) && (
          <div className="card-menu">
            <MoreVert className="menu-icon" onClick={toggleMenu} />
            <div className="menu-dropdown">
              <button onClick={onEdit}>Edit</button>
              <button onClick={onDelete}>Delete</button>
            </div>
          </div>
        )}

        {isFaceUp && (
          <>
            <div className="mana-display">{card?.cost}</div>
            <div className="card-content">
              <p className="card-name">{card?.name}</p>
              <p className="card-lore">{card?.lore}</p>
            </div>
            <div className="attack-display">{card?.attack ?? ''}</div>
            <div className="defense-display">{card?.defense ?? ''}</div>
          </>
        )}
      </div>
    </motion.div>
  );
}

export default Card;