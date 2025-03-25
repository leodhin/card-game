import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import RoomRow from './RoomRow';

const SERVER_URL = "localhost:3000"; // "https://9pwbk5xx-3000.uks1.devtunnels.ms/";

const RoomList = () => {
  const [rooms, setRooms] = useState([]);
  const [nickname, setNickname] = useState('');
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const socket = io(SERVER_URL);
    setSocket(socket);

    const savedNick = localStorage.getItem('nickname');
    if (savedNick) {
      setNickname(savedNick);
    }

    socket.on('connect', () => {
      console.log('Connected to the server');
      socket.emit('requestRoomList');
      socket.emit('ping');
    });

    socket.on('roomList', (games) => {
      console.log('roomList', games);
      setRooms(games);
    });



    socket.on('pong', () => {
      console.log('pong');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleJoinRoom = (gameId) => {
    if (nickname) {
      localStorage.setItem('nickname', nickname);
    }
    navigate(`/game/${roomName}`);
  };

  const handleCreateRoom = () => {
    const gameId = document.getElementById('roomName').value.trim();
    console.log('Creating room', gameId);
    if (gameId) {
      navigate(`/game/${gameId}`);
    }

  };

  return (
    <div id="main-container" className="container">
      <h1>Available Rooms</h1>
      <input type="text" id="roomName" placeholder="Enter room name" />
      <button onClick={handleCreateRoom}>Create Room</button>
      <table>
        <thead>
          <tr>
            <th>Room Name</th>
            <th>Players</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => (
            <RoomRow key={room.name} room={room} onJoin={handleJoinRoom} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RoomList;