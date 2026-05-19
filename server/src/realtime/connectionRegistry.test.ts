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

  it("allows one Session ID to have multiple simultaneous transport sockets", () => {
    const registry = createRealtimeConnectionRegistry();
    const teacherSessionId = "teacher-session-1" as SessionId;

    registry.registerSessionSocket(teacherSessionId, "teacher-socket-1");
    registry.registerSessionSocket(teacherSessionId, "teacher-socket-2");

    expect(registry.getSocketIds(teacherSessionId)).toEqual([
      "teacher-socket-1",
      "teacher-socket-2",
    ]);
    expect(registry.getSessionIds()).toEqual([teacherSessionId]);
  });

  it("considers a Session ID connected while it has at least one registered transport socket", () => {
    const registry = createRealtimeConnectionRegistry();
    const teacherSessionId = "teacher-session-1" as SessionId;
    const unknownSessionId = "unknown-session" as SessionId;

    expect(registry.isSessionConnected(teacherSessionId)).toBe(false);

    registry.registerSessionSocket(teacherSessionId, "teacher-socket-1");
    registry.registerSessionSocket(teacherSessionId, "teacher-socket-2");

    expect(registry.isSessionConnected(teacherSessionId)).toBe(true);
    expect(registry.isSessionConnected(unknownSessionId)).toBe(false);
  });
});
