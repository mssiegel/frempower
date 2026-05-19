import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export type RealtimeConnectionState =
  | "connecting"
  | "connected"
  | "disconnected";

export function useRealtimeConnection() {
  const [status, setStatus] =
    useState<RealtimeConnectionState>("connecting");

  useEffect(() => {
    const socket = io({ autoConnect: false });

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
  }, []);

  return { isConnected: status === "connected", status };
}
