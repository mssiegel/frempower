import type { SessionId } from "@frempower/shared";
import { describe, expect, it } from "vitest";
import { createRealtimeConnectionRegistry } from "./connectionRegistry.js";

describe("realtime connection registry", () => {
  it("tracks current transport socket IDs by Session ID", () => {
    const registry = createRealtimeConnectionRegistry();
    const teacherSessionId = "teacher-session-1" as SessionId;
    const studentSessionId = "student-session-1" as SessionId;

    expect(
      registry.registerSessionSocket(teacherSessionId, "teacher-socket-1"),
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

  it("enforces one live transport socket per Session ID", () => {
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

  it("reports the replaced transport socket when a Session ID resumes on a new socket", () => {
    const registry = createRealtimeConnectionRegistry();
    const teacherSessionId = "teacher-session-1" as SessionId;

    registry.registerSessionSocket(teacherSessionId, "teacher-socket-1");

    expect(
      registry.registerSessionSocket(teacherSessionId, "teacher-socket-2"),
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

  it("considers a Session ID connected while it has at least one registered transport socket", () => {
    const registry = createRealtimeConnectionRegistry();
    const teacherSessionId = "teacher-session-1" as SessionId;
    const unknownSessionId = "unknown-session" as SessionId;

    expect(registry.isSessionConnected(teacherSessionId)).toBe(false);

    registry.registerSessionSocket(teacherSessionId, "teacher-socket-1");

    expect(registry.isSessionConnected(teacherSessionId)).toBe(true);
    expect(registry.isSessionConnected(unknownSessionId)).toBe(false);
  });

  it("removes disconnected transport sockets and reports the last socket for a Session ID", () => {
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
