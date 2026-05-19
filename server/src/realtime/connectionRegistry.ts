import type { SessionId } from "@frempower/shared";

export type TransportSocketId = string;

export type RealtimeSocketDisconnectResult = {
  sessionId: SessionId;
  socketId: TransportSocketId;
  remainingSocketCount: number;
  isLastSocketForSession: boolean;
};

export type RealtimeSocketRegistrationResult = {
  sessionId: SessionId;
  socketId: TransportSocketId;
  replacedSocketId?: TransportSocketId;
};

export type RealtimeConnectionRegistry = {
  registerSessionSocket(
    sessionId: SessionId,
    socketId: TransportSocketId,
  ): RealtimeSocketRegistrationResult;
  unregisterSocket(
    socketId: TransportSocketId,
  ): RealtimeSocketDisconnectResult | undefined;
  isSessionConnected(sessionId: SessionId): boolean;
  getSocketIds(sessionId: SessionId): readonly TransportSocketId[];
  getSessionIds(): readonly SessionId[];
};

export const createRealtimeConnectionRegistry =
  (): RealtimeConnectionRegistry => {
    const socketIdBySessionId = new Map<SessionId, TransportSocketId>();
    const sessionIdBySocketId = new Map<TransportSocketId, SessionId>();

    return {
      registerSessionSocket(sessionId, socketId) {
        const existingSessionId = sessionIdBySocketId.get(socketId);
        if (existingSessionId !== undefined && existingSessionId !== sessionId) {
          if (socketIdBySessionId.get(existingSessionId) === socketId) {
            socketIdBySessionId.delete(existingSessionId);
          }
        }

        const replacedSocketId = socketIdBySessionId.get(sessionId);
        if (replacedSocketId !== undefined && replacedSocketId !== socketId) {
          sessionIdBySocketId.delete(replacedSocketId);
        }

        socketIdBySessionId.set(sessionId, socketId);
        sessionIdBySocketId.set(socketId, sessionId);

        const registrationResult: RealtimeSocketRegistrationResult = {
          sessionId,
          socketId,
        };
        if (replacedSocketId !== undefined && replacedSocketId !== socketId) {
          registrationResult.replacedSocketId = replacedSocketId;
        }

        return registrationResult;
      },

      unregisterSocket(socketId) {
        const sessionId = sessionIdBySocketId.get(socketId);
        if (sessionId === undefined) {
          return undefined;
        }

        sessionIdBySocketId.delete(socketId);
        socketIdBySessionId.delete(sessionId);

        return {
          sessionId,
          socketId,
          remainingSocketCount: 0,
          isLastSocketForSession: true,
        };
      },

      isSessionConnected(sessionId) {
        return socketIdBySessionId.has(sessionId);
      },

      getSocketIds(sessionId) {
        const socketId = socketIdBySessionId.get(sessionId);
        return socketId === undefined ? [] : [socketId];
      },

      getSessionIds() {
        return [...socketIdBySessionId.keys()];
      },
    };
  };
