import type { ActivityId, EntityId, SessionId } from "@frempower/shared";
import { describe, expect, it } from "vitest";
import {
  getPairingRoomName,
  getSessionRoomName,
  getTeacherActivityRoomName,
} from "./roomNames.js";

describe("Realtime Server room names", () => {
  it("returns stable server-private room names for Session ID, Classroom Activity, and Pairing routing scopes", () => {
    const sessionId = "teacher-session-1" as SessionId;
    const activityId = "12345" as ActivityId;
    const pairingId = "pairing-1" as EntityId;

    expect(getSessionRoomName(sessionId)).toBe(
      "frempower:session:teacher-session-1"
    );
    expect(getTeacherActivityRoomName(activityId)).toBe(
      "frempower:activity:12345:teachers"
    );
    expect(getPairingRoomName(pairingId)).toBe("frempower:pairing:pairing-1");

    expect(getSessionRoomName(sessionId)).toBe(getSessionRoomName(sessionId));
    expect(getTeacherActivityRoomName(activityId)).toBe(
      getTeacherActivityRoomName(activityId)
    );
    expect(getPairingRoomName(pairingId)).toBe(getPairingRoomName(pairingId));
  });
});
