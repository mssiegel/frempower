import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export function useRealtimeConnection() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = io({ autoConnect: false });

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  return { isConnected };
}
