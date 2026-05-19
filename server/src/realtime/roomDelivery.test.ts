import type {
  ActivityId,
  ChatMessageSnapshot,
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
  emitStudentActivitySnapshotToSessionRoom,
  emitTeacherActivitySnapshotToRoom,
  type RealtimeRoomDeliveryServer,
  type RealtimeRoomDeliveryTarget,
} from "./roomDelivery.js";

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
});
