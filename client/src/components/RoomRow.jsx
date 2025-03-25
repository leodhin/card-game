import React from 'react';

const RoomRow = ({ room, onJoin }) => {
  return (
    <tr>
      <td>{room.name}</td>
      <td>{room.players}/8</td>
      <td>
        <button onClick={() => onJoin(room.name)}>Join</button>
      </td>
    </tr>
  );
};

export default RoomRow;