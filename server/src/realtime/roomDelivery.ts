import type {
  ActivityId,
  ChatMessageSnapshot,
  ChatTypingPayload,
  EntityId,
  SessionId,
  StudentActivitySnapshot,
  TeacherActivitySnapshot,
} from "@frempower/shared";
import { REALTIME_EVENTS } from "@frempower/shared";
import {
  getPairingRoomName,
  getSessionRoomName,
  getTeacherActivityRoomName,
} from "./roomNames.js";
import type { RealtimeConnectionRegistry } from "./connectionRegistry.js";

export type RealtimeRoomDeliveryTarget = {
  emit(
    eventName: typeof REALTIME_EVENTS.teacherActivitySnapshot,
    payload: TeacherActivitySnapshot,
  ): void;
  emit(
    eventName: typeof REALTIME_EVENTS.studentActivitySnapshot,
    payload: StudentActivitySnapshot,
  ): void;
  emit(
    eventName: typeof REALTIME_EVENTS.chatSendMessage,
    payload: ChatMessageSnapshot,
  ): void;
  emit(
    eventName: typeof REALTIME_EVENTS.chatTyping,
    payload: ChatTypingPayload,
  ): void;
};

export type RealtimeRoomDeliveryServer = {
  to(roomName: string): RealtimeRoomDeliveryTarget;
};

export type RealtimeRoomDeliverySessionRegistry = Pick<
  RealtimeConnectionRegistry,
  "getSocketIds"
>;

export const emitTeacherActivitySnapshotToRoom = (
  server: RealtimeRoomDeliveryServer,
  activityId: ActivityId,
  snapshot: TeacherActivitySnapshot,
): void => {
  server
    .to(getTeacherActivityRoomName(activityId))
    .emit(REALTIME_EVENTS.teacherActivitySnapshot, snapshot);
};

export const emitStudentActivitySnapshotToSessionRoom = (
  server: RealtimeRoomDeliveryServer,
  registry: RealtimeRoomDeliverySessionRegistry,
  sessionId: SessionId,
  snapshot: StudentActivitySnapshot,
): boolean => {
  const currentSocketIds = registry.getSocketIds(sessionId);
  if (currentSocketIds.length !== 1) {
    return false;
  }

  server
    .to(getSessionRoomName(sessionId))
    .emit(REALTIME_EVENTS.studentActivitySnapshot, snapshot);

  return true;
};

export const emitChatMessageToPairingRoom = (
  server: RealtimeRoomDeliveryServer,
  pairingId: EntityId,
  message: ChatMessageSnapshot,
): void => {
  server
    .to(getPairingRoomName(pairingId))
    .emit(REALTIME_EVENTS.chatSendMessage, message);
};

export const emitChatTypingToPairingRoom = (
  server: RealtimeRoomDeliveryServer,
  pairingId: EntityId,
  typing: ChatTypingPayload,
): void => {
  server
    .to(getPairingRoomName(pairingId))
    .emit(REALTIME_EVENTS.chatTyping, typing);
};
