import React, { useEffect } from 'react';
import { useDrag, DragPreviewImage } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';

function withDrag(WrappedComponent) {
  return function DraggableComponent({ card, isDraggable, ...props }) {
    const [{ isDragging }, drag, dragPreview] = useDrag(() => ({
      type: 'CARD',
      item: {
        id: card?._id,
        img: card?.img,
        name: card?.name,
        cost: card?.cost,
        lore: card?.lore,
        attack: card?.attack,
        defense: card?.defense,
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      canDrag: () => isDraggable,
    }));

    useEffect(() => {
      // Hide the default drag preview
      dragPreview(getEmptyImage(), { captureDraggingState: true });
    }, [dragPreview]);

    return (
      <div ref={drag} style={{ opacity: isDragging ? 0 : 1 }}>
        <DragPreviewImage connect={getEmptyImage} src={card?.img} />
        <WrappedComponent card={card} {...props} />
      </div>
    );
  };
}

export default withDrag;