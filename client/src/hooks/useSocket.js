import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { jwtDecode } from "jwt-decode";
import { toast } from 'react-toastify';


const useSocket = (serverUrl, gameId, nickname) => {
  const socketRef = useRef(null);
  const [connecting, setConnecting] = useState(true); // Track connection status
  const [hasjoined, setHasJoined] = useState(false); // Track if the user has joined the game
  const [error, setError] = useState(null); // Track connection errors
  const [data, setData] = useState(null); // Track game state data
  const [userId, setUserId] = useState(null); // Track user ID

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserId(decoded.userId);
      } catch (error) {
        console.error("Failed to decode token", error);
      }
    }
    const socket = io(serverUrl + "/game", {
      withCredentials: true,
      extraHeaders: {
        authorization: `Bearer ${token}`,
      },
    });

    socketRef.current = socket;

    // Handle connection
    socket.on("connect", () => {
      console.info("Connected to the server");
      socket.emit("joinRoom", gameId, nickname);
      setConnecting(false); // Socket connection established
      setError(null); // Clear any previous errors

    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.info("Disconnected from the server");
      setConnecting(false);
    });


    // unauthorized
    socket.on("unauthorized", () => {
      console.info("unauthorized");
      setConnecting(false);
      setError("Unauthorized. Please log in again.");
      window.location.href = '/login';
    });

    // Handle connection errors
    socket.on("connect_error", (err) => {
      console.error("Connection error:", err.message);
      setError("Failed to connect to the server. Please try again.");
      setConnecting(false); // Stop showing "connecting" if there's an error
    });

    // Handle game state updates
    socket.on("syncGameState", (data) => {
      setData(data);
    });

    // Handle errors
    socket.on("error", (errorMsg) => {
      if (errorMsg === "NOT_ENOUGH_MANA") {
        toast.error("Not enough mana to play this card.");
      }
      else if (errorMsg === "Game not found.") {
        console.error("Game not found.");
        setError("Game not found. Please check the game ID.");
      } else {
        toast.error("Something went wrong");
      }
      setConnecting(false);
    });

    // Handle player connection events
    socket.on("playerConnected", (nickname) => {
      console.info(`${nickname} connected.`);
    });

    socket.on("playerDisconnected", (nickname) => {
      console.info(`${nickname} disconnected.`);
    });

    socket.on("joinedRoom", (nickname) => {
      console.info(`${nickname} joined the game.`);
      setHasJoined(true);
    });

    // Handle server pong response
    socket.on("pong", () => {
      console.info("Pong received from server");
    });

    // Handle draw card event
    socket.on("drawCard", () => {
      console.info("Draw card event received from server");
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, []);


  const api = {
    playerDrawCard: () => {
      if (socketRef.current) {
        socketRef.current.emit("drawCard");
      }
    },
    playerPlayCard: (cardIndex) => {
      if (socketRef.current) {
        socketRef.current.emit("playCard", cardIndex);
      }
    },
    playerAttack: (attacker, defender) => {
      if (socketRef.current) {
        socketRef.current.emit("attack");
      }
    },
    playerPassTurn: () => {
      if (socketRef.current) {
        socketRef.current.emit("pass");
      }
    },
  };

  return { socket: socketRef.current, api, connecting, hasjoined, error, data, userId };
};

export default useSocket;