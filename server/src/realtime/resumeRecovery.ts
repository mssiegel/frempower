import type {
  ActivityId,
  CommandAcknowledgementResult,
  SessionId,
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
import type { RealtimeConnectionRegistry } from "./connectionRegistry.js";
import {
  emitTeacherActivitySnapshotToRoom,
  type RealtimeRoomDeliveryServer,
} from "./roomDelivery.js";
import { getSessionRoomName, getTeacherActivityRoomName } from "./roomNames.js";

export type RealtimeResumeSocket = {
  id: string;
  join(roomName: string): void;
};

export type TeacherResumeRecoverySuccess = {
  activityId: ActivityId;
  sessionId: SessionId;
};

export type SendTeacherResumeRecoverySnapshotOptions = {
  activityService: Pick<ActivityService, "getActivity">;
  deliveryServer: RealtimeRoomDeliveryServer;
  registry: RealtimeConnectionRegistry;
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

export const sendTeacherResumeRecoverySnapshot = ({
  activityService,
  deliveryServer,
  registry,
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

  registry.registerSessionSocket(sessionId, socket.id);
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
