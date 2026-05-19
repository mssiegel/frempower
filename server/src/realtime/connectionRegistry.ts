import type { SessionId } from "@frempower/shared";

export type TransportSocketId = string;

export type RealtimeConnectionRegistry = {
  registerSessionSocket(
    sessionId: SessionId,
    socketId: TransportSocketId,
  ): void;
  isSessionConnected(sessionId: SessionId): boolean;
  getSocketIds(sessionId: SessionId): readonly TransportSocketId[];
  getSessionIds(): readonly SessionId[];
};

export const createRealtimeConnectionRegistry =
  (): RealtimeConnectionRegistry => {
    const socketsBySessionId = new Map<SessionId, Set<TransportSocketId>>();

    return {
      registerSessionSocket(sessionId, socketId) {
        const socketIds = socketsBySessionId.get(sessionId) ?? new Set();
        socketIds.add(socketId);
        socketsBySessionId.set(sessionId, socketIds);
      },

      isSessionConnected(sessionId) {
        return (socketsBySessionId.get(sessionId)?.size ?? 0) > 0;
      },

      getSocketIds(sessionId) {
        return [...(socketsBySessionId.get(sessionId) ?? [])];
      },

      getSessionIds() {
        return [...socketsBySessionId.keys()];
      },
    };
  };
