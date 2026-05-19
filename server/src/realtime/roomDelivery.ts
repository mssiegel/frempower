import type {
  ActivityId,
  ChatMessageSnapshot,
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
};

export type RealtimeRoomDeliveryServer = {
  to(roomName: string): RealtimeRoomDeliveryTarget;
};

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
  sessionId: SessionId,
  snapshot: StudentActivitySnapshot,
): void => {
  server
    .to(getSessionRoomName(sessionId))
    .emit(REALTIME_EVENTS.studentActivitySnapshot, snapshot);
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
