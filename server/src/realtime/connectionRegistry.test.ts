import type { SessionId } from "@frempower/shared";
import { describe, expect, it } from "vitest";
import { createRealtimeConnectionRegistry } from "./connectionRegistry.js";

describe("Realtime Connection registry", () => {
  it("tracks current Realtime Connection socket IDs by Session ID", () => {
    const registry = createRealtimeConnectionRegistry();
    const teacherSessionId = "teacher-session-1" as SessionId;
    const studentSessionId = "student-session-1" as SessionId;

    expect(
      registry.registerSessionSocket(teacherSessionId, "teacher-socket-1")
    ).toEqual({
      sessionId: teacherSessionId,
      socketId: "teacher-socket-1",
    });
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

  it("allows only one live Realtime Connection for one Session ID", () => {
    const registry = createRealtimeConnectionRegistry();
    const teacherSessionId = "teacher-session-1" as SessionId;

    registry.registerSessionSocket(teacherSessionId, "teacher-socket-1");
    registry.registerSessionSocket(teacherSessionId, "teacher-socket-2");

    expect(registry.getSocketIds(teacherSessionId)).toEqual([
      "teacher-socket-2",
    ]);
    expect(registry.getSessionIds()).toEqual([teacherSessionId]);
    expect(registry.unregisterSocket("teacher-socket-1")).toBeUndefined();
    expect(registry.isSessionConnected(teacherSessionId)).toBe(true);
  });

  it("replaces an older Realtime Connection when the same Session ID resumes on a newer socket", () => {
    const registry = createRealtimeConnectionRegistry();
    const teacherSessionId = "teacher-session-1" as SessionId;

    registry.registerSessionSocket(teacherSessionId, "teacher-socket-1");

    expect(
      registry.registerSessionSocket(teacherSessionId, "teacher-socket-2")
    ).toEqual({
      sessionId: teacherSessionId,
      socketId: "teacher-socket-2",
      replacedSocketId: "teacher-socket-1",
    });
    expect(registry.getSocketIds(teacherSessionId)).toEqual([
      "teacher-socket-2",
    ]);
    expect(registry.unregisterSocket("teacher-socket-1")).toBeUndefined();
  });

  it("keeps the newer Realtime Connection current when an older socket disconnects", () => {
    const registry = createRealtimeConnectionRegistry();
    const teacherSessionId = "teacher-session-1" as SessionId;

    registry.registerSessionSocket(teacherSessionId, "teacher-socket-1");
    registry.registerSessionSocket(teacherSessionId, "teacher-socket-2");

    expect(registry.unregisterSocket("teacher-socket-1")).toBeUndefined();
    expect(registry.isSessionConnected(teacherSessionId)).toBe(true);
    expect(registry.getSocketIds(teacherSessionId)).toEqual([
      "teacher-socket-2",
    ]);

    expect(registry.unregisterSocket("teacher-socket-2")).toEqual({
      sessionId: teacherSessionId,
      socketId: "teacher-socket-2",
      remainingSocketCount: 0,
      isLastSocketForSession: true,
    });
    expect(registry.isSessionConnected(teacherSessionId)).toBe(false);
  });

  it("considers a Session ID connected while its current Realtime Connection socket remains registered", () => {
    const registry = createRealtimeConnectionRegistry();
    const teacherSessionId = "teacher-session-1" as SessionId;
    const unknownSessionId = "unknown-session" as SessionId;

    expect(registry.isSessionConnected(teacherSessionId)).toBe(false);

    registry.registerSessionSocket(teacherSessionId, "teacher-socket-1");

    expect(registry.isSessionConnected(teacherSessionId)).toBe(true);
    expect(registry.isSessionConnected(unknownSessionId)).toBe(false);

    registry.registerSessionSocket(teacherSessionId, "teacher-socket-2");

    expect(registry.unregisterSocket("teacher-socket-1")).toBeUndefined();
    expect(registry.isSessionConnected(teacherSessionId)).toBe(true);
  });

  it("removes the current Realtime Connection and reports the Session ID as disconnected", () => {
    const registry = createRealtimeConnectionRegistry();
    const teacherSessionId = "teacher-session-1" as SessionId;

    registry.registerSessionSocket(teacherSessionId, "teacher-socket-1");

    expect(registry.unregisterSocket("unknown-socket")).toBeUndefined();

    expect(registry.unregisterSocket("teacher-socket-1")).toEqual({
      sessionId: teacherSessionId,
      socketId: "teacher-socket-1",
      remainingSocketCount: 0,
      isLastSocketForSession: true,
    });
    expect(registry.isSessionConnected(teacherSessionId)).toBe(false);
    expect(registry.getSocketIds(teacherSessionId)).toEqual([]);
    expect(registry.getSessionIds()).toEqual([]);
  });
});
