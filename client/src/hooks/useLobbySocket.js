import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

export const useMatchmakingSocket = () => {
  const socketRef = useRef();
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [match, setMatch] = useState(null);

  useEffect(() => {
    if (status === "queued") {
      const token = localStorage.getItem("token");
      const socket = io(SERVER_URL + "/game", {
        extraHeaders: { authorization: `Bearer ${token}` },
      });
      socketRef.current = socket;

      socket.on("connect", () => setError(null));
      socket.on("match-found", payload => {
        setMatch(payload);
        setStatus("matched");
      });
      socket.on("error", (error) => {
        setError("An error occurred while connecting to the server.");
        console.error("Socket error:", error);
      });

      socket.on("unauthorized", (errorMsg) => {
        console.error("Unauthorized:", errorMsg);
        localStorage.removeItem('token');
        window.location.href = '/login';
      });

      socketRef.current?.emit("queue-1v1");

      // Handle disconnection on unmount
      return () => socket.disconnect();
    }
  }, [status]);


  const queue = () => {
    console.log("Looking for a match...");
    setStatus("queued");
  };

  const cancel = () => {
    socketRef.current?.emit("cancel-queue");
    setStatus("idle");
  };

  return { queue, cancel, status, match, error };
};

export default useMatchmakingSocket;