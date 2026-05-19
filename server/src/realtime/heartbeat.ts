import {
  CHAT_RECONNECT_TIMEOUT_MS,
  DISCONNECTED_PAIRING_TIMEOUT_MS,
  LOBBY_STUDENT_DISCONNECT_TIMEOUT_MS,
  TEACHER_DISCONNECT_TIMEOUT_MS,
} from "@frempower/shared";

export const realtimeHeartbeat = {
  pingInterval: 5000,
  pingTimeout: 5000,
} as const;

export const domainReconnectGracePeriods = {
  teacherDisconnect: TEACHER_DISCONNECT_TIMEOUT_MS,
  lobbyStudentDisconnect: LOBBY_STUDENT_DISCONNECT_TIMEOUT_MS,
  disconnectedPairing: DISCONNECTED_PAIRING_TIMEOUT_MS,
  chatReconnect: CHAT_RECONNECT_TIMEOUT_MS,
} as const;

export const realtimeHeartbeatDeadConnectionDetectionMs =
  realtimeHeartbeat.pingInterval + realtimeHeartbeat.pingTimeout;

export const isRealtimeHeartbeatShorterThanReconnectGracePeriods = (): boolean =>
  Object.values(domainReconnectGracePeriods).every(
    (gracePeriodMs) =>
      realtimeHeartbeat.pingInterval < gracePeriodMs &&
      realtimeHeartbeat.pingTimeout < gracePeriodMs &&
      realtimeHeartbeatDeadConnectionDetectionMs < gracePeriodMs,
  );
