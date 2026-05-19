import type { ActivityId, EntityId, SessionId } from "@frempower/shared";

export type RealtimeRoomName = string;

const REALTIME_ROOM_PREFIX = "frempower";

export const getSessionRoomName = (sessionId: SessionId): RealtimeRoomName =>
  `${REALTIME_ROOM_PREFIX}:session:${sessionId}`;

export const getTeacherActivityRoomName = (
  activityId: ActivityId,
): RealtimeRoomName => `${REALTIME_ROOM_PREFIX}:activity:${activityId}:teachers`;

export const getPairingRoomName = (pairingId: EntityId): RealtimeRoomName =>
  `${REALTIME_ROOM_PREFIX}:pairing:${pairingId}`;
