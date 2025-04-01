import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const useSocket = (serverUrl, gameId, nickname, onGameStateUpdate) => {
  const socketRef = useRef(null);
  const [connecting, setConnecting] = useState(true); // Track connection status
  const [error, setError] = useState(null); // Track connection errors

  useEffect(() => {
    const myToken = localStorage.getItem("token");
    const socket = io(serverUrl + "/game", {
      withCredentials: true,
      extraHeaders: {
        authorization: `Bearer ${myToken}`,
      },
    });

    socketRef.current = socket;

    // Handle connection
    socket.on("connect", () => {
      console.info("Connected to the server");
      socket.emit("joinRoom", gameId, nickname);
      setConnecting(false); // Connection established
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
      onGameStateUpdate(data, socket.id);
    });

    // Handle errors
    socket.on("error", (errorMsg) => {
      alert(errorMsg);
    });

    // Handle player connection events
    socket.on("playerConnected", (nickname) => {
      console.info(`${nickname} connected.`);
    });

    socket.on("playerDisconnected", (nickname) => {
      console.info(`${nickname} disconnected.`);
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

  // Emit events to the server
  const emitEvent = (event, data) => {
    if (socketRef.current) {
      console.info(`Emitting event: ${event}`, data);
      socketRef.current.emit(event, data);
    }
  };

  return { socket: socketRef.current, emitEvent, connecting, error };
};

export default useSocket;