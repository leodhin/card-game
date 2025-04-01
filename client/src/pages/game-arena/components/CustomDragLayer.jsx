import { useDragLayer } from 'react-dnd';

import Card from '../../../components/Card';

function CustomDragLayer() {
  const {
    item,
    isDragging,
    currentOffset,
  } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    isDragging: monitor.isDragging(),
    currentOffset: monitor.getSourceClientOffset(),
  }));

  if (!isDragging || !currentOffset) {
    return null;
  }

  const { x, y } = currentOffset;

  return (
    <div
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        left: 0,
        top: 0,
        transform: `translate(${x}px, ${y}px)`,
        zIndex: 1000,
      }}
    >
      <Card
        card={item}
      />
    </div>
  );
}

export default CustomDragLayer;