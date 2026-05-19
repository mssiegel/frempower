import type {
  ActivityId,
  SessionId,
  StudentActivitySnapshot,
  TeacherActivitySnapshot,
} from "@frempower/shared";
import { REALTIME_EVENTS } from "@frempower/shared";
import {
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
