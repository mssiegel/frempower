export type RealtimeTransportDisconnectSignal = {
  event: "realtime:transportDisconnect";
  transport: "socket.io";
  transportSocketId: string;
  reason: string;
  domainBoundary: string;
};

export const createRealtimeTransportDisconnectSignal = (
  transportSocketId: string,
  reason: string,
): RealtimeTransportDisconnectSignal => ({
  event: "realtime:transportDisconnect",
  transport: "socket.io",
  transportSocketId,
  reason,
  domainBoundary:
    "Socket.IO disconnect is the transport-level signal for future Teacher Disconnect and Student Disconnect handling; domain timers wait for Session ID connection routing.",
});
