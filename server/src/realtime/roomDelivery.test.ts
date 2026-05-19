import type {
  ActivityId,
  SessionId,
  StudentActivitySnapshot,
  TeacherActivitySnapshot,
} from "@frempower/shared";
import { REALTIME_EVENTS } from "@frempower/shared";
import { describe, expect, it } from "vitest";
import {
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

    emitStudentActivitySnapshotToSessionRoom(server, sessionId, snapshot);

    expect(roomNames).toEqual(["frempower:session:student-session-1"]);
    expect(emitted).toEqual([
      {
        eventName: REALTIME_EVENTS.studentActivitySnapshot,
        payload: snapshot,
      },
    ]);
  });
});
