import { useDragLayer } from 'react-dnd';

function CustomDragLayer() {
  const { item, isDragging, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    isDragging: monitor.isDragging(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getSourceClientOffset(),
  }));

  if (!isDragging || !currentOffset) {
    return null;
  }

  const { x, y } = currentOffset;

  return (
    <div className="custom-drag-layer">
      <div
        className="drag-preview"
        style={{
          transform: `translate(${x}px, ${y}px) rotate(-10deg)`,
          opacity: 1,
        }}
      >
        <img src={item.img} alt={item.name} className="drag-preview-image" />
      </div>
    </div>
  );
}

export default CustomDragLayer;