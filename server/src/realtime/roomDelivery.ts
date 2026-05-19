import type { ActivityId, TeacherActivitySnapshot } from "@frempower/shared";
import { REALTIME_EVENTS } from "@frempower/shared";
import { getTeacherActivityRoomName } from "./roomNames.js";

export type RealtimeTeacherActivitySnapshotTarget = {
  emit(
    eventName: typeof REALTIME_EVENTS.teacherActivitySnapshot,
    payload: TeacherActivitySnapshot,
  ): void;
};

export type RealtimeRoomDeliveryServer = {
  to(roomName: string): RealtimeTeacherActivitySnapshotTarget;
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
