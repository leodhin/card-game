import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MoreVert } from '@mui/icons-material';
import { isEmpty } from 'lodash';

import BackCardPNG from '../../assets/back-card.png';
import './Card.css';

function Card({ card, isFaceUp = true, onClick, style, onEdit, onDelete }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isTransformed] = useState(false);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width - 0.5) * 40;
    const y = ((e.clientY - top) / height - 0.5) * -10;
    setRotate({ x, y });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  const toggleMenu = (e) => {
    e.stopPropagation(); // Prevent triggering card click
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={isTransformed && { rotateX: rotate.y, rotateY: rotate.x }}
      transition={{ type: 'spring', stiffness: 200, damping: 100 }}
      style={{ perspective: 1000 }}
    >
      <div
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="card"
        style={{
          transform: isTransformed ? 'scale(2.5)' : 'scale(1)',
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