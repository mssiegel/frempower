import type {
  ActivityId,
  JoinCode,
  SessionId,
  TeacherActivitySnapshot,
} from "@frempower/shared";
import {
  COMMAND_ACKNOWLEDGEMENT_ERROR_CODES,
  REALTIME_EVENTS,
} from "@frempower/shared";
import { describe, expect, it } from "vitest";
import type { ClassroomActivityRecord } from "../activity/activityService.js";
import { createRealtimeConnectionRegistry } from "./connectionRegistry.js";
import type {
  RealtimeRoomDeliveryServer,
  RealtimeRoomDeliveryTarget,
} from "./roomDelivery.js";
import {
  buildTeacherActivitySnapshot,
  sendTeacherResumeRecoverySnapshot,
  type RealtimeResumeSocket,
} from "./resumeRecovery.js";

const createActivity = (
  overrides: Partial<ClassroomActivityRecord> = {}
): ClassroomActivityRecord => ({
  activityId: "12345" as ActivityId,
  joinCode: "12345" as JoinCode,
  teacherSessionId: "teacher-session-1" as SessionId,
  characterNames: ["Guide", "Builder"],
  teacherEmail: "teacher@example.com",
  peerRealNameVisibility: false,
  status: "live",
  ...overrides,
});

const createDeliveryServer = () => {
  const emitted: Array<{
    roomName: string;
    eventName: string;
    payload: TeacherActivitySnapshot;
  }> = [];

  const server: RealtimeRoomDeliveryServer = {
    to(roomName) {
      const target: RealtimeRoomDeliveryTarget = {
        emit(eventName, payload) {
          if (eventName !== REALTIME_EVENTS.teacherActivitySnapshot) {
            throw new Error(`Unexpected event: ${eventName}`);
          }

          emitted.push({
            roomName,
            eventName,
            payload: payload as TeacherActivitySnapshot,
          });
        },
      };

      return target;
    },
  };

  return { emitted, server };
};

const createSocket = (): RealtimeResumeSocket & { joinedRooms: string[] } => {
  const joinedRooms: string[] = [];

  return {
    id: "teacher-socket-1",
    joinedRooms,
    join(roomName) {
      joinedRooms.push(roomName);
    },
  };
};

describe("realtime resume recovery", () => {
  it("builds a teacher snapshot from authoritative Classroom Activity state", () => {
    const activity = createActivity({
      peerRealNameVisibility: true,
      characterNames: ["Mediator", "Historian"],
    });

    expect(buildTeacherActivitySnapshot(activity)).toEqual({
      activityId: "12345",
      joinCode: "12345",
      characterNames: ["Mediator", "Historian"],
      teacherEmail: "teacher@example.com",
      peerRealNameVisibility: true,
      lobbyStudents: [],
      activePairings: [],
      completedChats: [],
      counts: {
        totalLiveStudents: 0,
        lobbyStudents: 0,
        studentsInChats: 0,
        completedChats: 0,
      },
    });
  });

  it("sends a fresh teacher snapshot for the reconnecting Session ID when authoritative state exists", () => {
    const activity = createActivity();
    const registry = createRealtimeConnectionRegistry();
    const socket = createSocket();
    const delivery = createDeliveryServer();

    const result = sendTeacherResumeRecoverySnapshot({
      activityService: {
        getActivity: () => activity,
      },
      deliveryServer: delivery.server,
      registry,
      socket,
      sessionId: activity.teacherSessionId,
      activityId: activity.activityId,
    });

    expect(result).toEqual({
      ok: true,
      data: {
        activityId: activity.activityId,
        sessionId: activity.teacherSessionId,
      },
    });
    expect(registry.getSocketIds(activity.teacherSessionId)).toEqual([
      socket.id,
    ]);
    expect(socket.joinedRooms).toEqual([
      "frempower:session:teacher-session-1",
      "frempower:activity:12345:teachers",
    ]);
    expect(delivery.emitted).toEqual([
      {
        roomName: "frempower:activity:12345:teachers",
        eventName: REALTIME_EVENTS.teacherActivitySnapshot,
        payload: buildTeacherActivitySnapshot(activity),
      },
    ]);
  });

  it("does not send a recovery snapshot when the activity is missing", () => {
    const registry = createRealtimeConnectionRegistry();
    const socket = createSocket();
    const delivery = createDeliveryServer();

    const result = sendTeacherResumeRecoverySnapshot({
      activityService: {
        getActivity: () => undefined,
      },
      deliveryServer: delivery.server,
      registry,
      socket,
      sessionId: "teacher-session-1" as SessionId,
      activityId: "12345" as ActivityId,
    });

    expect(result).toEqual({
      ok: false,
      error: {
        code: COMMAND_ACKNOWLEDGEMENT_ERROR_CODES.activityNotFound,
        message: "Classroom Activity is not available.",
      },
    });
    expect(registry.getSessionIds()).toEqual([]);
    expect(socket.joinedRooms).toEqual([]);
    expect(delivery.emitted).toEqual([]);
  });

  it("does not send a recovery snapshot for a non-teacher Session ID", () => {
    const activity = createActivity();
    const registry = createRealtimeConnectionRegistry();
    const socket = createSocket();
    const delivery = createDeliveryServer();

    const result = sendTeacherResumeRecoverySnapshot({
      activityService: {
        getActivity: () => activity,
      },
      deliveryServer: delivery.server,
      registry,
      socket,
      sessionId: "other-session" as SessionId,
      activityId: activity.activityId,
    });

    expect(result).toEqual({
      ok: false,
      error: {
        code: COMMAND_ACKNOWLEDGEMENT_ERROR_CODES.forbidden,
        message: "Session ID cannot resume this Classroom Activity.",
      },
    });
    expect(registry.getSessionIds()).toEqual([]);
    expect(socket.joinedRooms).toEqual([]);
    expect(delivery.emitted).toEqual([]);
  });
});
