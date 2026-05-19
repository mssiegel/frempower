import type { SessionId } from "@frempower/shared";
import { describe, expect, it } from "vitest";
import { createRealtimeConnectionRegistry } from "./connectionRegistry.js";

describe("realtime connection registry", () => {
  it("tracks current transport socket IDs by Session ID", () => {
    const registry = createRealtimeConnectionRegistry();
    const teacherSessionId = "teacher-session-1" as SessionId;
    const studentSessionId = "student-session-1" as SessionId;

    registry.registerSessionSocket(teacherSessionId, "teacher-socket-1");
    registry.registerSessionSocket(studentSessionId, "student-socket-1");

    expect(registry.getSocketIds(teacherSessionId)).toEqual([
      "teacher-socket-1",
    ]);
    expect(registry.getSocketIds(studentSessionId)).toEqual([
      "student-socket-1",
    ]);
    expect(registry.getSessionIds()).toEqual([
      teacherSessionId,
      studentSessionId,
    ]);
  });
});
