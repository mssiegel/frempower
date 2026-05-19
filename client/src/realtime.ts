import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export type RealtimeConnectionState =
  | "connecting"
  | "connected"
  | "disconnected";

type RealtimeConnectionStatusListener = () => void;

export type RealtimeConnectionSocket = {
  on: (
    event: "connect" | "connect_error" | "disconnect",
    listener: RealtimeConnectionStatusListener,
  ) => unknown;
  off: (
    event: "connect" | "connect_error" | "disconnect",
    listener: RealtimeConnectionStatusListener,
  ) => unknown;
  connect: () => unknown;
  disconnect: () => unknown;
};

export function subscribeToRealtimeConnectionState(
  socket: RealtimeConnectionSocket,
  setStatus: (status: RealtimeConnectionState) => void,
) {
  const handleConnect = () => {
    setStatus("connected");
  };

  const handleDisconnect = () => {
    setStatus("disconnected");
  };

  socket.on("connect", handleConnect);
  socket.on("connect_error", handleDisconnect);
  socket.on("disconnect", handleDisconnect);

  socket.connect();

  return () => {
    socket.off("connect", handleConnect);
    socket.off("connect_error", handleDisconnect);
    socket.off("disconnect", handleDisconnect);
    socket.disconnect();
  };
}

export function useRealtimeConnection() {
  const [status, setStatus] =
    useState<RealtimeConnectionState>("connecting");

  useEffect(() => {
    const socket = io({ autoConnect: false });
    return subscribeToRealtimeConnectionState(socket, setStatus);
  }, []);

  return { isConnected: status === "connected", status };
}
