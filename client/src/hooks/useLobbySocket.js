import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { toast } from "react-toastify";

import useSessionStore from "../stores/sessionStore";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

export const useMatchmakingSocket = () => {
  const socketRef = useRef();
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [match, setMatch] = useState(null);
  const { logout, token } = useSessionStore();

  useEffect(() => {
    const socket = io(SERVER_URL + "/lobby", {
      extraHeaders: { authorization: `Bearer ${token}` },
    });

    socketRef.current = socket;

    socket.on("connect", () => setError(null));

    socket.on("error", (error) => {
      if (error.message === "ALREADY_IN_GAME") {
        setStatus("idle");
        setMatch(error.roomId);
      }
      else if (error.message === "ALREADY_IN_QUEUE") {
        setStatus("idle");
        toast.error("You are already in a queue.");
      } else {
        console.error("Socket error:", error);
        toast.error("Something went wrong. Please try again.");
        setStatus("idle");
      }
    });

    socket.on("match-found", payload => {
      setMatch(payload?.gameId);
      setStatus("matched");
    });

    socket.on("unauthorized", (errorMsg) => {
      console.error("Unauthorized:", errorMsg);
      logout();
      window.location.href = '/login';
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    if (status === "queued") {

      socketRef.current?.emit("queue-1v1");

    }
  }, [status]);


  const queue = () => {
    console.log("Looking for a match...");
    setStatus("queued");
  };

  const cancel = () => {
    socketRef.current?.disconnect();
    setStatus("idle");
  };

  return { queue, cancel, status, match, error };
};

export default useMatchmakingSocket;