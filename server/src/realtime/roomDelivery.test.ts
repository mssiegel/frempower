import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
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
import { describe, expect, it } from "vitest";
import { createRealtimeConnectionRegistry } from "./connectionRegistry.js";
import {
  emitChatMessageToPairingRoom,
  emitChatTypingToPairingRoom,
  emitStudentActivitySnapshotToSessionRoom,
  emitTeacherActivitySnapshotToRoom,
  type RealtimeRoomDeliveryServer,
  type RealtimeRoomDeliveryTarget,
} from "./roomDelivery.js";

type RoomDeliveryEvent =
  | typeof REALTIME_EVENTS.teacherActivitySnapshot
  | typeof REALTIME_EVENTS.studentActivitySnapshot
  | typeof REALTIME_EVENTS.chatSendMessage
  | typeof REALTIME_EVENTS.chatTyping;

type RoomDeliveryPayload =
  | TeacherActivitySnapshot
  | StudentActivitySnapshot
  | ChatMessageSnapshot
  | ChatTypingPayload;

type DeliveredEvent = {
  eventName: RoomDeliveryEvent;
  payload: RoomDeliveryPayload;
};

const sourceRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

const listSourceFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      return listSourceFiles(entryPath);
    }

    return entry.isFile() && entry.name.endsWith(".ts") ? [entryPath] : [];
  });

const createRoomScopedDeliveryServer = () => {
  const socketIdsByRoomName = new Map<string, Set<string>>();
  const deliveredEventsBySocketId = new Map<string, DeliveredEvent[]>();

  const joinRoom = (roomName: string, socketId: string) => {
    const socketIds = socketIdsByRoomName.get(roomName) ?? new Set<string>();
    socketIds.add(socketId);
    socketIdsByRoomName.set(roomName, socketIds);
    deliveredEventsBySocketId.set(socketId, []);
  };

  const server: RealtimeRoomDeliveryServer = {
    to(roomName) {
      const target: RealtimeRoomDeliveryTarget = {
        emit(eventName, payload) {
          const socketIds = socketIdsByRoomName.get(roomName) ?? new Set();
          for (const socketId of socketIds) {
            const deliveredEvents =
              deliveredEventsBySocketId.get(socketId) ?? [];
            deliveredEvents.push({
              eventName: eventName as RoomDeliveryEvent,
              payload: payload as RoomDeliveryPayload,
            });
            deliveredEventsBySocketId.set(socketId, deliveredEvents);
          }
        },
      };

      return target;
    },
  };

  return {
    server,
    joinRoom,
    getDeliveredEvents(socketId: string) {
      return deliveredEventsBySocketId.get(socketId) ?? [];
    },
  };
};

describe("realtime room delivery", () => {
  it("emits teacher activity snapshots to the teacher activity room", () => {
    const activityId = "12345" as ActivityId;
    const emitted: Array<{
      eventName: typeof REALTIME_EVENTS.teacherActivitySnapshot;
      payload: TeacherActivitySnapshot;
    }> = [];
    const roomNames: string[] = [];
    const target: RealtimeRoomDeliveryTarget = {
      emit(eventName, payload) {
        if (eventName !== REALTIME_EVENTS.teacherActivitySnapshot) {
          throw new Error(`Unexpected event: ${eventName}`);
        }
        emitted.push({ eventName, payload: payload as TeacherActivitySnapshot });
      },
    };
    const server: RealtimeRoomDeliveryServer = {
      to(roomName) {
        roomNames.push(roomName);

        return target;
      },
    };
    const snapshot: TeacherActivitySnapshot = {
      activityId,
      joinCode: "12345",
      characterNames: ["Character 1", "Character 2"],
      peerRealNameVisibility: false,
      lobbyStudents: [],
      activePairings: [],
      completedChats: [],
      counts: {
        totalLiveStudents: 0,
        lobbyStudents: 0,
        studentsInChats: 0,
        completedChats: 0,
      },
    };

    emitTeacherActivitySnapshotToRoom(server, activityId, snapshot);

    expect(roomNames).toEqual(["frempower:activity:12345:teachers"]);
    expect(emitted).toEqual([
      {
        eventName: REALTIME_EVENTS.teacherActivitySnapshot,
        payload: snapshot,
      },
    ]);
  });

  it("emits student activity snapshots to the student Session ID room", () => {
    const sessionId = "student-session-1" as SessionId;
    const registry = createRealtimeConnectionRegistry();
    registry.registerSessionSocket(sessionId, "student-socket-1");
    const emitted: Array<{
      eventName: typeof REALTIME_EVENTS.studentActivitySnapshot;
      payload: StudentActivitySnapshot;
    }> = [];
    const roomNames: string[] = [];
    const target: RealtimeRoomDeliveryTarget = {
      emit(eventName, payload) {
        if (eventName !== REALTIME_EVENTS.studentActivitySnapshot) {
          throw new Error(`Unexpected event: ${eventName}`);
        }
        emitted.push({ eventName, payload: payload as StudentActivitySnapshot });
      },
    };
    const server: RealtimeRoomDeliveryServer = {
      to(roomName) {
        roomNames.push(roomName);

        return target;
      },
    };
    const snapshot: StudentActivitySnapshot = {
      activityId: "12345",
      joinCode: "12345",
      studentId: "student-1",
      studentRealName: "Ada",
      state: "lobby",
    };

    expect(
      emitStudentActivitySnapshotToSessionRoom(
        server,
        registry,
        sessionId,
        snapshot,
      ),
    ).toBe(true);

    expect(roomNames).toEqual(["frempower:session:student-session-1"]);
    expect(emitted).toEqual([
      {
        eventName: REALTIME_EVENTS.studentActivitySnapshot,
        payload: snapshot,
      },
    ]);
  });

  it("does not emit student activity snapshots without exactly one current socket for the Session ID", () => {
    const sessionId = "student-session-1" as SessionId;
    const emitted: Array<{
      eventName: typeof REALTIME_EVENTS.studentActivitySnapshot;
      payload: StudentActivitySnapshot;
    }> = [];
    const roomNames: string[] = [];
    const target: RealtimeRoomDeliveryTarget = {
      emit(eventName, payload) {
        emitted.push({
          eventName: eventName as typeof REALTIME_EVENTS.studentActivitySnapshot,
          payload: payload as StudentActivitySnapshot,
        });
      },
    };
    const server: RealtimeRoomDeliveryServer = {
      to(roomName) {
        roomNames.push(roomName);

        return target;
      },
    };
    const snapshot: StudentActivitySnapshot = {
      activityId: "12345",
      joinCode: "12345",
      studentId: "student-1",
      studentRealName: "Ada",
      state: "lobby",
    };

    expect(
      emitStudentActivitySnapshotToSessionRoom(
        server,
        { getSocketIds: () => [] },
        sessionId,
        snapshot,
      ),
    ).toBe(false);
    expect(
      emitStudentActivitySnapshotToSessionRoom(
        server,
        { getSocketIds: () => ["student-socket-1", "student-socket-2"] },
        sessionId,
        snapshot,
      ),
    ).toBe(false);

    expect(roomNames).toEqual([]);
    expect(emitted).toEqual([]);
  });

  it("emits chat messages to the active Pairing room", () => {
    const pairingId = "pairing-1" as EntityId;
    const emitted: Array<{
      eventName: typeof REALTIME_EVENTS.chatSendMessage;
      payload: ChatMessageSnapshot;
    }> = [];
    const roomNames: string[] = [];
    const target: RealtimeRoomDeliveryTarget = {
      emit(eventName, payload) {
        if (eventName !== REALTIME_EVENTS.chatSendMessage) {
          throw new Error(`Unexpected event: ${eventName}`);
        }
        emitted.push({ eventName, payload: payload as ChatMessageSnapshot });
      },
    };
    const server: RealtimeRoomDeliveryServer = {
      to(roomName) {
        roomNames.push(roomName);

        return target;
      },
    };
    const message: ChatMessageSnapshot = {
      id: "message-1",
      senderStudentId: "student-1",
      senderCharacterName: "Character 1",
      text: "Hello there",
    };

    emitChatMessageToPairingRoom(server, pairingId, message);

    expect(roomNames).toEqual(["frempower:pairing:pairing-1"]);
    expect(emitted).toEqual([
      {
        eventName: REALTIME_EVENTS.chatSendMessage,
        payload: message,
      },
    ]);
  });

  it("emits ephemeral typing indicators to the active Pairing room", () => {
    const pairingId = "pairing-1" as EntityId;
    const emitted: Array<{
      eventName: typeof REALTIME_EVENTS.chatTyping;
      payload: ChatTypingPayload;
    }> = [];
    const roomNames: string[] = [];
    const target: RealtimeRoomDeliveryTarget = {
      emit(eventName, payload) {
        if (eventName !== REALTIME_EVENTS.chatTyping) {
          throw new Error(`Unexpected event: ${eventName}`);
        }
        emitted.push({ eventName, payload: payload as ChatTypingPayload });
      },
    };
    const server: RealtimeRoomDeliveryServer = {
      to(roomName) {
        roomNames.push(roomName);

        return target;
      },
    };
    const typing: ChatTypingPayload = {
      activityId: "12345" as ActivityId,
      pairingId,
      isTyping: true,
    };

    emitChatTypingToPairingRoom(server, pairingId, typing);

    expect(roomNames).toEqual(["frempower:pairing:pairing-1"]);
    expect(emitted).toEqual([
      {
        eventName: REALTIME_EVENTS.chatTyping,
        payload: typing,
      },
    ]);
  });

  it("does not deliver teacher activity snapshots to sockets outside the teacher activity room", () => {
    const activityId = "12345" as ActivityId;
    const roomDelivery = createRoomScopedDeliveryServer();
    roomDelivery.joinRoom(
      "frempower:activity:12345:teachers",
      "teacher-socket-1",
    );
    roomDelivery.joinRoom(
      "frempower:activity:67890:teachers",
      "teacher-socket-2",
    );
    roomDelivery.joinRoom("frempower:session:student-session-1", "student-1");
    const snapshot: TeacherActivitySnapshot = {
      activityId,
      joinCode: "12345",
      characterNames: ["Character 1", "Character 2"],
      peerRealNameVisibility: false,
      lobbyStudents: [],
      activePairings: [],
      completedChats: [],
      counts: {
        totalLiveStudents: 0,
        lobbyStudents: 0,
        studentsInChats: 0,
        completedChats: 0,
      },
    };

    emitTeacherActivitySnapshotToRoom(
      roomDelivery.server,
      activityId,
      snapshot,
    );

    expect(roomDelivery.getDeliveredEvents("teacher-socket-1")).toEqual([
      {
        eventName: REALTIME_EVENTS.teacherActivitySnapshot,
        payload: snapshot,
      },
    ]);
    expect(roomDelivery.getDeliveredEvents("teacher-socket-2")).toEqual([]);
    expect(roomDelivery.getDeliveredEvents("student-1")).toEqual([]);
  });

  it("does not deliver student activity snapshots to sockets outside the Session ID room", () => {
    const sessionId = "student-session-1" as SessionId;
    const registry = createRealtimeConnectionRegistry();
    registry.registerSessionSocket(sessionId, "student-socket-1");
    const roomDelivery = createRoomScopedDeliveryServer();
    roomDelivery.joinRoom("frempower:session:student-session-1", "student-1");
    roomDelivery.joinRoom("frempower:session:student-session-2", "student-2");
    roomDelivery.joinRoom(
      "frempower:activity:12345:teachers",
      "teacher-socket-1",
    );
    const snapshot: StudentActivitySnapshot = {
      activityId: "12345",
      joinCode: "12345",
      studentId: "student-1",
      studentRealName: "Ada",
      state: "lobby",
    };

    expect(
      emitStudentActivitySnapshotToSessionRoom(
        roomDelivery.server,
        registry,
        sessionId,
        snapshot,
      ),
    ).toBe(true);

    expect(roomDelivery.getDeliveredEvents("student-1")).toEqual([
      {
        eventName: REALTIME_EVENTS.studentActivitySnapshot,
        payload: snapshot,
      },
    ]);
    expect(roomDelivery.getDeliveredEvents("student-2")).toEqual([]);
    expect(roomDelivery.getDeliveredEvents("teacher-socket-1")).toEqual([]);
  });

  it("does not deliver chat messages to sockets outside the active Pairing room", () => {
    const pairingId = "pairing-1" as EntityId;
    const roomDelivery = createRoomScopedDeliveryServer();
    roomDelivery.joinRoom("frempower:pairing:pairing-1", "student-1");
    roomDelivery.joinRoom("frempower:pairing:pairing-1", "student-2");
    roomDelivery.joinRoom("frempower:pairing:pairing-2", "student-3");
    roomDelivery.joinRoom(
      "frempower:activity:12345:teachers",
      "teacher-socket-1",
    );
    const message: ChatMessageSnapshot = {
      id: "message-1",
      senderStudentId: "student-1",
      senderCharacterName: "Character 1",
      text: "Hello there",
    };

    emitChatMessageToPairingRoom(roomDelivery.server, pairingId, message);

    expect(roomDelivery.getDeliveredEvents("student-1")).toEqual([
      {
        eventName: REALTIME_EVENTS.chatSendMessage,
        payload: message,
      },
    ]);
    expect(roomDelivery.getDeliveredEvents("student-2")).toEqual([
      {
        eventName: REALTIME_EVENTS.chatSendMessage,
        payload: message,
      },
    ]);
    expect(roomDelivery.getDeliveredEvents("student-3")).toEqual([]);
    expect(roomDelivery.getDeliveredEvents("teacher-socket-1")).toEqual([]);
  });

  it("keeps Realtime Server room-scoped delivery isolated across teacher, student, and Pairing audiences", () => {
    const activityId = "12345" as ActivityId;
    const studentSessionId = "student-session-1" as SessionId;
    const pairingId = "pairing-1" as EntityId;
    const registry = createRealtimeConnectionRegistry();
    const roomDelivery = createRoomScopedDeliveryServer();
    registry.registerSessionSocket(studentSessionId, "student-session-socket");
    roomDelivery.joinRoom(
      "frempower:activity:12345:teachers",
      "teacher-socket-1",
    );
    roomDelivery.joinRoom(
      "frempower:activity:67890:teachers",
      "other-teacher-socket",
    );
    roomDelivery.joinRoom(
      "frempower:session:student-session-1",
      "student-session-socket",
    );
    roomDelivery.joinRoom(
      "frempower:session:student-session-2",
      "other-student-session-socket",
    );
    roomDelivery.joinRoom("frempower:pairing:pairing-1", "pairing-student-1");
    roomDelivery.joinRoom("frempower:pairing:pairing-1", "pairing-student-2");
    roomDelivery.joinRoom(
      "frempower:pairing:pairing-2",
      "other-pairing-student",
    );
    const teacherSnapshot: TeacherActivitySnapshot = {
      activityId,
      joinCode: "12345",
      characterNames: ["Character 1", "Character 2"],
      peerRealNameVisibility: false,
      lobbyStudents: [],
      activePairings: [],
      completedChats: [],
      counts: {
        totalLiveStudents: 0,
        lobbyStudents: 0,
        studentsInChats: 0,
        completedChats: 0,
      },
    };
    const studentSnapshot: StudentActivitySnapshot = {
      activityId,
      joinCode: "12345",
      studentId: "student-1",
      studentRealName: "Ada",
      state: "lobby",
    };
    const message: ChatMessageSnapshot = {
      id: "message-1",
      senderStudentId: "student-1",
      senderCharacterName: "Character 1",
      text: "Hello there",
    };

    emitTeacherActivitySnapshotToRoom(
      roomDelivery.server,
      activityId,
      teacherSnapshot,
    );
    expect(
      emitStudentActivitySnapshotToSessionRoom(
        roomDelivery.server,
        registry,
        studentSessionId,
        studentSnapshot,
      ),
    ).toBe(true);
    emitChatMessageToPairingRoom(roomDelivery.server, pairingId, message);

    expect(roomDelivery.getDeliveredEvents("teacher-socket-1")).toEqual([
      {
        eventName: REALTIME_EVENTS.teacherActivitySnapshot,
        payload: teacherSnapshot,
      },
    ]);
    expect(roomDelivery.getDeliveredEvents("student-session-socket")).toEqual([
      {
        eventName: REALTIME_EVENTS.studentActivitySnapshot,
        payload: studentSnapshot,
      },
    ]);
    expect(roomDelivery.getDeliveredEvents("pairing-student-1")).toEqual([
      {
        eventName: REALTIME_EVENTS.chatSendMessage,
        payload: message,
      },
    ]);
    expect(roomDelivery.getDeliveredEvents("pairing-student-2")).toEqual([
      {
        eventName: REALTIME_EVENTS.chatSendMessage,
        payload: message,
      },
    ]);
    expect(roomDelivery.getDeliveredEvents("other-teacher-socket")).toEqual([]);
    expect(
      roomDelivery.getDeliveredEvents("other-student-session-socket"),
    ).toEqual([]);
    expect(roomDelivery.getDeliveredEvents("other-pairing-student")).toEqual(
      [],
    );
  });

  it("does not deliver ephemeral typing indicators to sockets outside the active Pairing room", () => {
    const pairingId = "pairing-1" as EntityId;
    const roomDelivery = createRoomScopedDeliveryServer();
    roomDelivery.joinRoom("frempower:pairing:pairing-1", "student-1");
    roomDelivery.joinRoom("frempower:pairing:pairing-1", "student-2");
    roomDelivery.joinRoom("frempower:pairing:pairing-2", "student-3");
    roomDelivery.joinRoom(
      "frempower:activity:12345:teachers",
      "teacher-socket-1",
    );
    const typing: ChatTypingPayload = {
      activityId: "12345" as ActivityId,
      pairingId,
      isTyping: true,
    };

    emitChatTypingToPairingRoom(roomDelivery.server, pairingId, typing);

    expect(roomDelivery.getDeliveredEvents("student-1")).toEqual([
      {
        eventName: REALTIME_EVENTS.chatTyping,
        payload: typing,
      },
    ]);
    expect(roomDelivery.getDeliveredEvents("student-2")).toEqual([
      {
        eventName: REALTIME_EVENTS.chatTyping,
        payload: typing,
      },
    ]);
    expect(roomDelivery.getDeliveredEvents("student-3")).toEqual([]);
    expect(roomDelivery.getDeliveredEvents("teacher-socket-1")).toEqual([]);
  });

  it("keeps audience-specific realtime event emits behind room delivery helpers", () => {
    const roomDeliveryPath = join(sourceRoot, "realtime", "roomDelivery.ts");
    const audienceScopedEvents = [
      {
        constantName: "teacherActivitySnapshot",
        eventName: REALTIME_EVENTS.teacherActivitySnapshot,
      },
      {
        constantName: "studentActivitySnapshot",
        eventName: REALTIME_EVENTS.studentActivitySnapshot,
      },
      {
        constantName: "chatSendMessage",
        eventName: REALTIME_EVENTS.chatSendMessage,
      },
      {
        constantName: "chatTyping",
        eventName: REALTIME_EVENTS.chatTyping,
      },
    ] as const;
    const globalEmitReferences = listSourceFiles(sourceRoot)
      .filter((sourceFilePath) => !sourceFilePath.endsWith(".test.ts"))
      .filter((sourceFilePath) => sourceFilePath !== roomDeliveryPath)
      .flatMap((sourceFilePath) => {
        const source = readFileSync(sourceFilePath, "utf8");
        const sourceLines = source.split(/\r?\n/);

        return sourceLines.flatMap((line, lineIndex) => {
          if (
            !line.includes(".emit(") ||
            !audienceScopedEvents.some(
              ({ constantName, eventName }) =>
                line.includes(`REALTIME_EVENTS.${constantName}`) ||
                line.includes(`"${eventName}"`) ||
                line.includes(`'${eventName}'`),
            )
          ) {
            return [];
          }

          return [
            `${relative(sourceRoot, sourceFilePath)}:${lineIndex + 1}: ${line.trim()}`,
          ];
        });
      });

    expect(globalEmitReferences).toEqual([]);
  });
});
