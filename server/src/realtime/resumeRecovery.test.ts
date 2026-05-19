import type {
  ActivityId,
  EntityId,
  JoinCode,
  SessionId,
  StudentActivitySnapshot,
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
  buildStudentActivitySnapshot,
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

const createSocket = (
  id = "teacher-socket-1"
): RealtimeResumeSocket & { joinedRooms: string[] } => {
  const joinedRooms: string[] = [];

  return {
    id,
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
      lobbyStudents: [
        {
          id: "student-3" as EntityId,
          studentRealName: "Grace",
          connectionStatus: "connected",
        },
      ],
      activePairings: [
        {
          id: "pairing-1" as EntityId,
          participants: [
            {
              studentId: "student-1" as EntityId,
              studentRealName: "Ada",
              characterName: "Mediator",
              connectionStatus: "connected",
            },
            {
              studentId: "student-2" as EntityId,
              studentRealName: "Linus",
              characterName: "Historian",
              connectionStatus: "connected",
            },
          ],
          recentMessages: [
            {
              id: "message-1" as EntityId,
              senderStudentId: "student-1" as EntityId,
              senderCharacterName: "Mediator",
              text: "We should compare notes.",
            },
          ],
        },
      ],
      completedChats: [
        {
          id: "completed-chat-1" as EntityId,
          pairingId: "pairing-ended-1" as EntityId,
          participants: [
            {
              studentId: "student-4" as EntityId,
              studentRealName: "Katherine",
              characterName: "Mediator",
              connectionStatus: "connected",
            },
            {
              studentId: "student-5" as EntityId,
              studentRealName: "Edsger",
              characterName: "Historian",
              connectionStatus: "connected",
            },
          ],
          previewMessages: [
            {
              id: "message-2" as EntityId,
              senderStudentId: "student-4" as EntityId,
              senderCharacterName: "Mediator",
              text: "Finished.",
            },
          ],
          messages: [
            {
              id: "message-2" as EntityId,
              senderStudentId: "student-4" as EntityId,
              senderCharacterName: "Mediator",
              text: "Finished.",
            },
          ],
        },
      ],
    });

    expect(buildTeacherActivitySnapshot(activity)).toEqual({
      activityId: "12345",
      joinCode: "12345",
      characterNames: ["Mediator", "Historian"],
      teacherEmail: "teacher@example.com",
      peerRealNameVisibility: true,
      lobbyStudents: activity.lobbyStudents,
      activePairings: activity.activePairings,
      completedChats: activity.completedChats,
      counts: {
        totalLiveStudents: 3,
        lobbyStudents: 1,
        studentsInChats: 2,
        completedChats: 1,
      },
    });
  });

  it("builds student snapshots for missed removed, activity-ended, pairing-ended, and chat state", () => {
    const activeChatSnapshot: StudentActivitySnapshot = {
      activityId: "stale" as ActivityId,
      joinCode: "stale" as JoinCode,
      studentId: "student-1" as EntityId,
      studentRealName: "Ada",
      state: "active_pairing",
      activePairing: {
        id: "pairing-1" as EntityId,
        ownCharacterName: "Mediator",
        peer: {
          studentId: "student-2" as EntityId,
          characterName: "Historian",
          studentRealName: "Linus",
          connectionStatus: "connected",
        },
        messages: [
          {
            id: "message-1" as EntityId,
            senderStudentId: "student-2" as EntityId,
            senderCharacterName: "Historian",
            text: "A missed chat message.",
          },
        ],
      },
    };
    const removedSnapshot: StudentActivitySnapshot = {
      activityId: "stale" as ActivityId,
      joinCode: "stale" as JoinCode,
      studentId: "student-3" as EntityId,
      studentRealName: "Grace",
      state: "removed",
    };
    const pairingEndedSnapshot: StudentActivitySnapshot = {
      activityId: "stale" as ActivityId,
      joinCode: "stale" as JoinCode,
      studentId: "student-4" as EntityId,
      studentRealName: "Katherine",
      state: "chat_ended",
      endedPairingId: "pairing-ended-1" as EntityId,
    };
    const activityEndedSnapshot: StudentActivitySnapshot = {
      activityId: "stale" as ActivityId,
      joinCode: "stale" as JoinCode,
      studentId: "student-5" as EntityId,
      studentRealName: "Edsger",
      state: "activity_ended",
    };
    const activity = createActivity({
      studentSnapshotsBySessionId: {
        ["student-session-active" as SessionId]: activeChatSnapshot,
        ["student-session-removed" as SessionId]: removedSnapshot,
        ["student-session-pairing-ended" as SessionId]: pairingEndedSnapshot,
        ["student-session-activity-ended" as SessionId]: activityEndedSnapshot,
      },
    });

    expect(
      buildStudentActivitySnapshot(
        activity,
        "student-session-active" as SessionId
      )
    ).toEqual({
      ...activeChatSnapshot,
      activityId: "12345",
      joinCode: "12345",
    });
    expect(
      buildStudentActivitySnapshot(
        activity,
        "student-session-removed" as SessionId
      )?.state
    ).toBe("removed");
    expect(
      buildStudentActivitySnapshot(
        activity,
        "student-session-pairing-ended" as SessionId
      )
    ).toMatchObject({
      activityId: "12345",
      joinCode: "12345",
      state: "chat_ended",
      endedPairingId: "pairing-ended-1",
    });
    expect(
      buildStudentActivitySnapshot(
        activity,
        "student-session-activity-ended" as SessionId
      )?.state
    ).toBe("activity_ended");
    expect(
      buildStudentActivitySnapshot(activity, "unknown-session" as SessionId)
    ).toBeUndefined();
  });

  it("sends a fresh teacher snapshot for the reconnecting Session ID when authoritative state exists", () => {
    const activity = createActivity();
    const registry = createRealtimeConnectionRegistry();
    const socket = createSocket();
    const delivery = createDeliveryServer();
    const disconnectedSocketIds: string[] = [];

    const result = sendTeacherResumeRecoverySnapshot({
      activityService: {
        getActivity: () => activity,
      },
      deliveryServer: delivery.server,
      registry,
      socketReplacement: {
        disconnectSocket: (socketId) => {
          disconnectedSocketIds.push(socketId);
        },
      },
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
    expect(disconnectedSocketIds).toEqual([]);
  });

  it("rejoins rooms when a newer Realtime Connection resumes the same Session ID", () => {
    const activity = createActivity();
    const registry = createRealtimeConnectionRegistry();
    const socket = createSocket("teacher-socket-2");
    const delivery = createDeliveryServer();
    const operations: string[] = [];

    registry.registerSessionSocket(
      activity.teacherSessionId,
      "teacher-socket-1"
    );

    const result = sendTeacherResumeRecoverySnapshot({
      activityService: {
        getActivity: () => activity,
      },
      deliveryServer: {
        to(roomName) {
          const target: RealtimeRoomDeliveryTarget = {
            emit(eventName, payload) {
              if (eventName !== REALTIME_EVENTS.teacherActivitySnapshot) {
                throw new Error(`Unexpected event: ${eventName}`);
              }

              delivery.server
                .to(roomName)
                .emit(eventName, payload as TeacherActivitySnapshot);
              operations.push(`emit:${eventName}`);
            },
          };

          return target;
        },
      },
      registry,
      socketReplacement: {
        disconnectSocket: (socketId) => {
          operations.push(`disconnect:${socketId}`);
        },
      },
      socket,
      sessionId: activity.teacherSessionId,
      activityId: activity.activityId,
    });

    expect(result.ok).toBe(true);
    expect(registry.getSocketIds(activity.teacherSessionId)).toEqual([
      "teacher-socket-2",
    ]);
    expect(socket.joinedRooms).toEqual([
      "frempower:session:teacher-session-1",
      "frempower:activity:12345:teachers",
    ]);
    expect(operations).toEqual([
      "disconnect:teacher-socket-1",
      `emit:${REALTIME_EVENTS.teacherActivitySnapshot}`,
    ]);
    expect(delivery.emitted).toEqual([
      {
        roomName: "frempower:activity:12345:teachers",
        eventName: REALTIME_EVENTS.teacherActivitySnapshot,
        payload: buildTeacherActivitySnapshot(activity),
      },
    ]);
  });

  it("recovers missed state changes by sending the current snapshot to the newest socket", () => {
    const activity = createActivity({
      lobbyStudents: [
        {
          id: "student-1" as EntityId,
          studentRealName: "Ada",
          connectionStatus: "connected",
        },
      ],
      activePairings: [
        {
          id: "pairing-1" as EntityId,
          participants: [
            {
              studentId: "student-2" as EntityId,
              studentRealName: "Grace",
              characterName: "Guide",
              connectionStatus: "connected",
            },
            {
              studentId: "student-3" as EntityId,
              studentRealName: "Linus",
              characterName: "Builder",
              connectionStatus: "connected",
            },
          ],
          recentMessages: [
            {
              id: "message-1" as EntityId,
              senderStudentId: "student-2" as EntityId,
              senderCharacterName: "Guide",
              text: "This happened while the teacher was reconnecting.",
            },
          ],
        },
      ],
    });
    const registry = createRealtimeConnectionRegistry();
    const socket = createSocket("teacher-socket-2");
    const delivery = createDeliveryServer();
    const disconnectedSocketIds: string[] = [];

    registry.registerSessionSocket(
      activity.teacherSessionId,
      "teacher-socket-1"
    );

    const result = sendTeacherResumeRecoverySnapshot({
      activityService: {
        getActivity: () => activity,
      },
      deliveryServer: delivery.server,
      registry,
      socketReplacement: {
        disconnectSocket: (socketId) => {
          disconnectedSocketIds.push(socketId);
        },
      },
      socket,
      sessionId: activity.teacherSessionId,
      activityId: activity.activityId,
    });

    expect(result.ok).toBe(true);
    expect(registry.getSocketIds(activity.teacherSessionId)).toEqual([
      "teacher-socket-2",
    ]);
    expect(disconnectedSocketIds).toEqual(["teacher-socket-1"]);
    expect(delivery.emitted).toEqual([
      {
        roomName: "frempower:activity:12345:teachers",
        eventName: REALTIME_EVENTS.teacherActivitySnapshot,
        payload: {
          ...buildTeacherActivitySnapshot(activity),
          counts: {
            totalLiveStudents: 3,
            lobbyStudents: 1,
            studentsInChats: 2,
            completedChats: 0,
          },
        },
      },
    ]);
  });

  it("does not send a recovery snapshot when the activity is missing", () => {
    const registry = createRealtimeConnectionRegistry();
    const socket = createSocket();
    const delivery = createDeliveryServer();
    const disconnectedSocketIds: string[] = [];

    const result = sendTeacherResumeRecoverySnapshot({
      activityService: {
        getActivity: () => undefined,
      },
      deliveryServer: delivery.server,
      registry,
      socketReplacement: {
        disconnectSocket: (socketId) => {
          disconnectedSocketIds.push(socketId);
        },
      },
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
    expect(disconnectedSocketIds).toEqual([]);
  });

  it("does not send a recovery snapshot for a non-teacher Session ID", () => {
    const activity = createActivity();
    const registry = createRealtimeConnectionRegistry();
    const socket = createSocket();
    const delivery = createDeliveryServer();
    const disconnectedSocketIds: string[] = [];

    const result = sendTeacherResumeRecoverySnapshot({
      activityService: {
        getActivity: () => activity,
      },
      deliveryServer: delivery.server,
      registry,
      socketReplacement: {
        disconnectSocket: (socketId) => {
          disconnectedSocketIds.push(socketId);
        },
      },
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
    expect(disconnectedSocketIds).toEqual([]);
  });

  it("does not authorize teacher resume from a known socket ID when the Session ID is not the teacher Session ID", () => {
    const activity = createActivity();
    const registry = createRealtimeConnectionRegistry();
    const socket = createSocket("teacher-socket-1");
    const delivery = createDeliveryServer();
    const disconnectedSocketIds: string[] = [];

    registry.registerSessionSocket(activity.teacherSessionId, socket.id);

    const result = sendTeacherResumeRecoverySnapshot({
      activityService: {
        getActivity: () => activity,
      },
      deliveryServer: delivery.server,
      registry,
      socketReplacement: {
        disconnectSocket: (socketId) => {
          disconnectedSocketIds.push(socketId);
        },
      },
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
    expect(registry.getSocketIds(activity.teacherSessionId)).toEqual([
      socket.id,
    ]);
    expect(registry.getSocketIds("other-session" as SessionId)).toEqual([]);
    expect(socket.joinedRooms).toEqual([]);
    expect(delivery.emitted).toEqual([]);
    expect(disconnectedSocketIds).toEqual([]);
  });
});
