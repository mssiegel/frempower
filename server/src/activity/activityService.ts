import type {
  ActivityId,
  CharacterName,
  JoinCode,
  SessionId,
  TeacherEmail,
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
};

export type ActivityServiceChangeReason =
  | "activity_created"
  | "activity_updated"
  | "activity_ended";

export type ActivityServiceChange = {
  activityId: ActivityId;
  reason: ActivityServiceChangeReason;
};

export type ActivityServiceSubscriber = (
  change: ActivityServiceChange,
) => void;

export type ActivityService = {
  subscribe(subscriber: ActivityServiceSubscriber): () => void;
  reserveJoinCode(): JoinCode;
  releaseJoinCode(joinCode: JoinCode): void;
  getActivity(activityId: ActivityId): ClassroomActivityRecord | undefined;
  listActivities(): ClassroomActivityRecord[];
};

export type ActivityServiceClock = {
  now(): Date;
};

export type ActivityServiceRandom = {
  next(): number;
};

export type ActivityServiceJoinCodeGenerator = (
  reservedJoinCodes: ReadonlySet<JoinCode>,
) => JoinCode;

export type ActivityServiceDependencies = {
  clock: ActivityServiceClock;
  random: ActivityServiceRandom;
  generateJoinCode: ActivityServiceJoinCodeGenerator;
};

export type CreateInMemoryActivityServiceOptions = {
  dependencies?: Partial<ActivityServiceDependencies>;
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
        joinCodeRangeSize - 1,
      );
      const joinCode = String(JOIN_CODE_MIN + randomOffset) as JoinCode;

      if (!reservedJoinCodes.has(joinCode)) {
        return joinCode;
      }
    }

    throw new Error("Unable to generate an available Join Code");
  };

export const createActivityServiceDependencies = (
  overrides: Partial<ActivityServiceDependencies> = {},
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
  options: CreateInMemoryActivityServiceOptions = {},
): ActivityService => {
  const dependencies = createActivityServiceDependencies(options.dependencies);
  const activities = new Map<ActivityId, ClassroomActivityRecord>();
  const reservedJoinCodes = new Set<JoinCode>();
  const subscribers = new Set<ActivityServiceSubscriber>();

  const cloneActivity = (
    activity: ClassroomActivityRecord,
  ): ClassroomActivityRecord => ({
    ...activity,
    characterNames: [...activity.characterNames],
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
  };
};
