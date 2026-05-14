import type {
  ActivityId,
  CharacterName,
  JoinCode,
  SessionId,
  TeacherEmail,
} from "@frempower/shared";

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
  getActivity(activityId: ActivityId): ClassroomActivityRecord | undefined;
  listActivities(): ClassroomActivityRecord[];
};

export const createInMemoryActivityService = (): ActivityService => {
  const activities = new Map<ActivityId, ClassroomActivityRecord>();
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

    getActivity(activityId) {
      const activity = activities.get(activityId);

      return activity ? cloneActivity(activity) : undefined;
    },

    listActivities() {
      return [...activities.values()].map(cloneActivity);
    },
  };
};
