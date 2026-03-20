"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextData {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextData>({
  socket: null,
  connected: false,
});

export function SocketProvider({
  children,
  teamId,
}: {
  children: React.ReactNode;
  teamId?: string;
}) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socketIo = io("http://localhost:3000", {
      path: "/socket.io",
      transports: ["websocket", "polling"],
    });

    socketIo.on("connect", () => {
      console.log("socket connected:", socketIo.id);
      setConnected(true);

      if (teamId) {
        socketIo.emit("joinTeamRoom", teamId);
      }
    });

    socketIo.on("disconnect", (reason) => {
      console.log("socket disconnected:", reason);
      setConnected(false);
    });

    socketIo.on("connect_error", (err) => {
      console.error("socket connect error:", err.message);
      setConnected(false);
    });

    setSocket(socketIo);

    return () => {
      socketIo.disconnect();
    };
  }, [teamId]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
