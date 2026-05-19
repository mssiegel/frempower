import type { SessionId } from "@frempower/shared";

export type TransportSocketId = string;

export type RealtimeSocketDisconnectResult = {
  sessionId: SessionId;
  socketId: TransportSocketId;
  remainingSocketCount: number;
  isLastSocketForSession: boolean;
};

export type RealtimeConnectionRegistry = {
  registerSessionSocket(
    sessionId: SessionId,
    socketId: TransportSocketId,
  ): void;
  unregisterSocket(
    socketId: TransportSocketId,
  ): RealtimeSocketDisconnectResult | undefined;
  isSessionConnected(sessionId: SessionId): boolean;
  getSocketIds(sessionId: SessionId): readonly TransportSocketId[];
  getSessionIds(): readonly SessionId[];
};

export const createRealtimeConnectionRegistry =
  (): RealtimeConnectionRegistry => {
    const socketsBySessionId = new Map<SessionId, Set<TransportSocketId>>();
    const sessionIdBySocketId = new Map<TransportSocketId, SessionId>();

    return {
      registerSessionSocket(sessionId, socketId) {
        const existingSessionId = sessionIdBySocketId.get(socketId);
        if (existingSessionId !== undefined && existingSessionId !== sessionId) {
          const existingSocketIds = socketsBySessionId.get(existingSessionId);
          existingSocketIds?.delete(socketId);
          if (existingSocketIds?.size === 0) {
            socketsBySessionId.delete(existingSessionId);
          }
        }

        const socketIds = socketsBySessionId.get(sessionId) ?? new Set();
        socketIds.add(socketId);
        socketsBySessionId.set(sessionId, socketIds);
        sessionIdBySocketId.set(socketId, sessionId);
      },

      unregisterSocket(socketId) {
        const sessionId = sessionIdBySocketId.get(socketId);
        if (sessionId === undefined) {
          return undefined;
        }

        sessionIdBySocketId.delete(socketId);

        const socketIds = socketsBySessionId.get(sessionId);
        socketIds?.delete(socketId);

        const remainingSocketCount = socketIds?.size ?? 0;
        const isLastSocketForSession = remainingSocketCount === 0;
        if (isLastSocketForSession) {
          socketsBySessionId.delete(sessionId);
        }

        return {
          sessionId,
          socketId,
          remainingSocketCount,
          isLastSocketForSession,
        };
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
