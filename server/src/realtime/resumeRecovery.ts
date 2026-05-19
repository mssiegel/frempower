import type {
  ActivityId,
  CommandAcknowledgementResult,
  EntityId,
  SessionId,
  StudentActivitySnapshot,
  TeacherActivitySnapshot,
} from "@frempower/shared";
import {
  COMMAND_ACKNOWLEDGEMENT_ERROR_CODES,
  commandAcknowledgementError,
  commandAcknowledgementSuccess,
} from "@frempower/shared";
import type {
  ActivityService,
  ClassroomActivityRecord,
} from "../activity/activityService.js";
import type {
  RealtimeConnectionRegistry,
  TransportSocketId,
} from "./connectionRegistry.js";
import {
  emitStudentActivitySnapshotToSessionRoom,
  emitTeacherActivitySnapshotToRoom,
  type RealtimeRoomDeliveryServer,
} from "./roomDelivery.js";
import {
  getPairingRoomName,
  getSessionRoomName,
  getTeacherActivityRoomName,
} from "./roomNames.js";

export type RealtimeResumeSocket = {
  id: TransportSocketId;
  join(roomName: string): void;
};

export type RealtimeResumeSocketReplacement = {
  disconnectSocket(socketId: string): void;
};

export type TeacherResumeRecoverySuccess = {
  activityId: ActivityId;
  sessionId: SessionId;
};

export type StudentResumeRecoverySuccess = {
  activityId: ActivityId;
  pairingId?: EntityId;
  sessionId: SessionId;
};

export type SendTeacherResumeRecoverySnapshotOptions = {
  activityService: Pick<ActivityService, "getActivity">;
  deliveryServer: RealtimeRoomDeliveryServer;
  registry: RealtimeConnectionRegistry;
  socketReplacement: RealtimeResumeSocketReplacement;
  socket: RealtimeResumeSocket;
  sessionId: SessionId;
  activityId: ActivityId;
};

export type SendStudentResumeRecoverySnapshotOptions = {
  activityService: Pick<ActivityService, "getActivity">;
  deliveryServer: RealtimeRoomDeliveryServer;
  registry: RealtimeConnectionRegistry;
  socketReplacement: RealtimeResumeSocketReplacement;
  socket: RealtimeResumeSocket;
  sessionId: SessionId;
  activityId: ActivityId;
};

export const buildTeacherActivitySnapshot = (
  activity: ClassroomActivityRecord
): TeacherActivitySnapshot => ({
  activityId: activity.activityId,
  joinCode: activity.joinCode,
  characterNames: activity.characterNames,
  teacherEmail: activity.teacherEmail,
  peerRealNameVisibility: activity.peerRealNameVisibility,
  lobbyStudents: activity.lobbyStudents ?? [],
  activePairings: activity.activePairings ?? [],
  completedChats: activity.completedChats ?? [],
  counts: {
    totalLiveStudents:
      (activity.lobbyStudents?.length ?? 0) +
      (activity.activePairings?.length ?? 0) * 2,
    lobbyStudents: activity.lobbyStudents?.length ?? 0,
    studentsInChats: (activity.activePairings?.length ?? 0) * 2,
    completedChats: activity.completedChats?.length ?? 0,
  },
});

export const buildStudentActivitySnapshot = (
  activity: ClassroomActivityRecord,
  sessionId: SessionId
): StudentActivitySnapshot | undefined => {
  const snapshot = activity.studentSnapshotsBySessionId?.[sessionId];

  if (snapshot === undefined) {
    return undefined;
  }

  return {
    ...snapshot,
    activityId: activity.activityId,
    joinCode: activity.joinCode,
    activePairing:
      snapshot.activePairing === undefined
        ? undefined
        : {
            ...snapshot.activePairing,
            peer: { ...snapshot.activePairing.peer },
            messages: snapshot.activePairing.messages.map((message) => ({
              ...message,
            })),
          },
  };
};

export const sendTeacherResumeRecoverySnapshot = ({
  activityService,
  deliveryServer,
  registry,
  socketReplacement,
  socket,
  sessionId,
  activityId,
}: SendTeacherResumeRecoverySnapshotOptions): CommandAcknowledgementResult<TeacherResumeRecoverySuccess> => {
  const activity = activityService.getActivity(activityId);

  if (activity === undefined || activity.status !== "live") {
    return commandAcknowledgementError({
      code: COMMAND_ACKNOWLEDGEMENT_ERROR_CODES.activityNotFound,
      message: "Classroom Activity is not available.",
    });
  }

  if (activity.teacherSessionId !== sessionId) {
    return commandAcknowledgementError({
      code: COMMAND_ACKNOWLEDGEMENT_ERROR_CODES.forbidden,
      message: "Session ID cannot resume this Classroom Activity.",
    });
  }

  const registration = registry.registerSessionSocket(sessionId, socket.id);
  if (registration.replacedSocketId !== undefined) {
    socketReplacement.disconnectSocket(registration.replacedSocketId);
  }

  socket.join(getSessionRoomName(sessionId));
  socket.join(getTeacherActivityRoomName(activityId));
  emitTeacherActivitySnapshotToRoom(
    deliveryServer,
    activityId,
    buildTeacherActivitySnapshot(activity)
  );

  return commandAcknowledgementSuccess({
    activityId,
    sessionId,
  });
};

export const sendStudentResumeRecoverySnapshot = ({
  activityService,
  deliveryServer,
  registry,
  socketReplacement,
  socket,
  sessionId,
  activityId,
}: SendStudentResumeRecoverySnapshotOptions): CommandAcknowledgementResult<StudentResumeRecoverySuccess> => {
  const activity = activityService.getActivity(activityId);

  if (activity === undefined) {
    return commandAcknowledgementError({
      code: COMMAND_ACKNOWLEDGEMENT_ERROR_CODES.activityNotFound,
      message: "Classroom Activity is not available.",
    });
  }

  const snapshot = buildStudentActivitySnapshot(activity, sessionId);
  if (snapshot === undefined) {
    return commandAcknowledgementError({
      code: COMMAND_ACKNOWLEDGEMENT_ERROR_CODES.forbidden,
      message: "Session ID cannot resume this Classroom Activity.",
    });
  }

  const registration = registry.registerSessionSocket(sessionId, socket.id);
  if (registration.replacedSocketId !== undefined) {
    socketReplacement.disconnectSocket(registration.replacedSocketId);
  }

  socket.join(getSessionRoomName(sessionId));
  if (snapshot.activePairing !== undefined) {
    socket.join(getPairingRoomName(snapshot.activePairing.id));
  }

  emitStudentActivitySnapshotToSessionRoom(
    deliveryServer,
    registry,
    sessionId,
    snapshot
  );

  return commandAcknowledgementSuccess({
    activityId,
    pairingId: snapshot.activePairing?.id,
    sessionId,
  });
};
