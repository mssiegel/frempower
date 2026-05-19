import type {
  ActivityId,
  CharacterName,
  ChatMessageSnapshot,
  CompletedChatSnapshot,
  EntityId,
  JoinCode,
  SessionId,
  StudentActivitySnapshot,
  TeacherEmail,
  TeacherActivePairingSnapshot,
  TeacherSnapshotLobbyStudent,
} from "@frempower/shared";
import { JOIN_CODE_MAX, JOIN_CODE_MIN } from "@frempower/shared";

export type ClassroomActivityStatus = "live" | "ended";

export type ClassroomActivityRecord = {
  activityId: ActivityId;
  joinCode: JoinCode;
  teacherSessionId: SessionId;
  characterNames: CharacterName[];
  teacherEmail?: TeacherEmail;
  peerRealNameVisibility: boolean;
  status: ClassroomActivityStatus;
  lobbyStudents?: TeacherSnapshotLobbyStudent[];
  activePairings?: TeacherActivePairingSnapshot[];
  completedChats?: CompletedChatSnapshot[];
  studentSnapshotsBySessionId?: Partial<
    Record<SessionId, StudentActivitySnapshot>
  >;
};

export type ActivityServiceChangeReason =
  | "activity_created"
  | "activity_updated"
  | "activity_ended";

export type ActivityServiceChange = {
  activityId: ActivityId;
  reason: ActivityServiceChangeReason;
};

export type ActivityServiceSubscriber = (change: ActivityServiceChange) => void;

export type ActivityService = {
  subscribe(subscriber: ActivityServiceSubscriber): () => void;
  createActivity(activity: ClassroomActivityRecord): void;
  reserveJoinCode(): JoinCode;
  releaseJoinCode(joinCode: JoinCode): void;
  getActivity(activityId: ActivityId): ClassroomActivityRecord | undefined;
  listActivities(): ClassroomActivityRecord[];
  recordChatMessage(
    activityId: ActivityId,
    pairingId: EntityId,
    message: ChatMessageSnapshot
  ): RecordChatMessageResult;
};

export type ActivityServiceClock = {
  now(): Date;
};

export type ActivityServiceRandom = {
  next(): number;
};

export type ActivityServiceJoinCodeGenerator = (
  reservedJoinCodes: ReadonlySet<JoinCode>
) => JoinCode;

export type ActivityServiceDependencies = {
  clock: ActivityServiceClock;
  random: ActivityServiceRandom;
  generateJoinCode: ActivityServiceJoinCodeGenerator;
};

export type CreateInMemoryActivityServiceOptions = {
  dependencies?: Partial<ActivityServiceDependencies>;
};

export type RecordChatMessageResult =
  | {
      ok: true;
      activity: ClassroomActivityRecord;
    }
  | {
      ok: false;
      reason: "activity_not_found" | "activity_not_live" | "pairing_not_found";
    };

const createDefaultClock = (): ActivityServiceClock => ({
  now: () => new Date(),
});

const createDefaultRandom = (): ActivityServiceRandom => ({
  next: () => Math.random(),
});

export const createRandomJoinCodeGenerator =
  (random: ActivityServiceRandom): ActivityServiceJoinCodeGenerator =>
  (reservedJoinCodes) => {
    const joinCodeRangeSize = JOIN_CODE_MAX - JOIN_CODE_MIN + 1;
    const maxAttempts = joinCodeRangeSize;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const randomOffset = Math.min(
        Math.floor(random.next() * joinCodeRangeSize),
        joinCodeRangeSize - 1
      );
      const joinCode = String(JOIN_CODE_MIN + randomOffset) as JoinCode;

      if (!reservedJoinCodes.has(joinCode)) {
        return joinCode;
      }
    }

    throw new Error("Unable to generate an available Join Code");
  };

export const createActivityServiceDependencies = (
  overrides: Partial<ActivityServiceDependencies> = {}
): ActivityServiceDependencies => {
  const clock = overrides.clock ?? createDefaultClock();
  const random = overrides.random ?? createDefaultRandom();

  return {
    clock,
    random,
    generateJoinCode:
      overrides.generateJoinCode ?? createRandomJoinCodeGenerator(random),
  };
};

export const createInMemoryActivityService = (
  options: CreateInMemoryActivityServiceOptions = {}
): ActivityService => {
  const dependencies = createActivityServiceDependencies(options.dependencies);
  const activities = new Map<ActivityId, ClassroomActivityRecord>();
  const reservedJoinCodes = new Set<JoinCode>();
  const subscribers = new Set<ActivityServiceSubscriber>();

  const notifySubscribers = (change: ActivityServiceChange) => {
    for (const subscriber of subscribers) {
      subscriber(change);
    }
  };

  const cloneStudentSnapshot = (
    snapshot: StudentActivitySnapshot
  ): StudentActivitySnapshot => ({
    ...snapshot,
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
  });

  const cloneActivity = (
    activity: ClassroomActivityRecord
  ): ClassroomActivityRecord => ({
    ...activity,
    characterNames: [...activity.characterNames],
    lobbyStudents: activity.lobbyStudents?.map((student) => ({ ...student })),
    activePairings: activity.activePairings?.map((pairing) => ({
      ...pairing,
      participants: [
        { ...pairing.participants[0] },
        { ...pairing.participants[1] },
      ],
      recentMessages: pairing.recentMessages.map((message) => ({ ...message })),
    })),
    completedChats: activity.completedChats?.map((completedChat) => ({
      ...completedChat,
      participants: [
        { ...completedChat.participants[0] },
        { ...completedChat.participants[1] },
      ],
      previewMessages: completedChat.previewMessages.map((message) => ({
        ...message,
      })),
      messages: completedChat.messages.map((message) => ({ ...message })),
    })),
    studentSnapshotsBySessionId:
      activity.studentSnapshotsBySessionId === undefined
        ? undefined
        : Object.fromEntries(
            Object.entries(activity.studentSnapshotsBySessionId).map(
              ([sessionId, snapshot]) => [
                sessionId,
                snapshot === undefined
                  ? undefined
                  : cloneStudentSnapshot(snapshot),
              ]
            )
          ),
  });

  return {
    subscribe(subscriber) {
      subscribers.add(subscriber);

      return () => {
        subscribers.delete(subscriber);
      };
    },

    reserveJoinCode() {
      const joinCode = dependencies.generateJoinCode(reservedJoinCodes);
      reservedJoinCodes.add(joinCode);

      return joinCode;
    },

    createActivity(activity) {
      activities.set(activity.activityId, cloneActivity(activity));
      reservedJoinCodes.add(activity.joinCode);
      notifySubscribers({
        activityId: activity.activityId,
        reason: "activity_created",
      });
    },

    releaseJoinCode(joinCode) {
      reservedJoinCodes.delete(joinCode);
    },

    getActivity(activityId) {
      const activity = activities.get(activityId);

      return activity ? cloneActivity(activity) : undefined;
    },

    listActivities() {
      return [...activities.values()].map(cloneActivity);
    },

    recordChatMessage(activityId, pairingId, message) {
      const activity = activities.get(activityId);

      if (activity === undefined) {
        return { ok: false, reason: "activity_not_found" };
      }

      if (activity.status !== "live") {
        return { ok: false, reason: "activity_not_live" };
      }

      const activePairing = activity.activePairings?.find(
        (pairing) => pairing.id === pairingId
      );

      if (activePairing === undefined) {
        return { ok: false, reason: "pairing_not_found" };
      }

      activePairing.recentMessages = [
        ...activePairing.recentMessages,
        { ...message },
      ];

      if (activity.studentSnapshotsBySessionId !== undefined) {
        for (const snapshot of Object.values(
          activity.studentSnapshotsBySessionId
        )) {
          if (snapshot?.activePairing?.id !== pairingId) {
            continue;
          }

          snapshot.activePairing.messages = [
            ...snapshot.activePairing.messages,
            { ...message },
          ];
        }
      }

      notifySubscribers({ activityId, reason: "activity_updated" });

      return { ok: true, activity: cloneActivity(activity) };
    },
  };
};
