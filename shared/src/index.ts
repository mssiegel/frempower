export const SHARED_PACKAGE_NAME = "@frempower/shared";

export const JOIN_CODE_LENGTH = 5;
export const JOIN_CODE_MIN = 10000;
export const JOIN_CODE_MAX = 99999;

export const DEFAULT_CHARACTER_NAMES = [
  "Character 1",
  "Character 2",
  "Character 3",
] as const;

export const CHAT_MESSAGE_MAX_LENGTH = 75;

export const TEACHER_DISCONNECT_TIMEOUT_MS = 2 * 60 * 1000;
export const LOBBY_STUDENT_DISCONNECT_TIMEOUT_MS = 15 * 1000;
export const DISCONNECTED_PAIRING_TIMEOUT_MS = 30 * 1000;
export const CHAT_RECONNECT_TIMEOUT_MS = 90 * 1000;

export type JoinCode = string;
export type ActivityId = string;
export type EntityId = string;
export type SessionId = string;

export type CharacterName = string;
export type StudentRealName = string;
export type TeacherEmail = string;

export type CommandAcknowledgementSuccess<TData = undefined> = {
  ok: true;
  data: TData;
};

export const COMMAND_ACKNOWLEDGEMENT_ERROR_CODES = {
  invalidPayload: "invalid_payload",
  invalidSession: "invalid_session",
  validationFailed: "validation_failed",
  activityNotFound: "activity_not_found",
  activityUnavailable: "activity_unavailable",
  forbidden: "forbidden",
  conflict: "conflict",
  internalError: "internal_error",
} as const;

export type CommandAcknowledgementErrorCode =
  (typeof COMMAND_ACKNOWLEDGEMENT_ERROR_CODES)[keyof typeof COMMAND_ACKNOWLEDGEMENT_ERROR_CODES];

export type CommandAcknowledgementErrorPayload<TDetails = undefined> = {
  code: CommandAcknowledgementErrorCode;
  message: string;
  details?: TDetails;
};

export type CommandAcknowledgementError<
  TError extends CommandAcknowledgementErrorPayload =
    CommandAcknowledgementErrorPayload,
> = {
  ok: false;
  error: TError;
};

export type CommandAcknowledgementResult<
  TData = undefined,
  TError extends CommandAcknowledgementErrorPayload =
    CommandAcknowledgementErrorPayload,
> =
  | CommandAcknowledgementSuccess<TData>
  | CommandAcknowledgementError<TError>;

export const commandAcknowledgementSuccess = <TData = undefined>(
  data: TData,
): CommandAcknowledgementSuccess<TData> => ({
  ok: true,
  data,
});

export const commandAcknowledgementError = <
  TError extends CommandAcknowledgementErrorPayload,
>(
  error: TError,
): CommandAcknowledgementError<TError> => ({
  ok: false,
  error,
});

export const REALTIME_EVENTS = {
  teacherHostActivity: "teacher:hostActivity",
  teacherResumeActivity: "teacher:resumeActivity",
  teacherUpdateCharacters: "teacher:updateCharacters",
  teacherUpdateEmail: "teacher:updateEmail",
  teacherUpdatePeerRealNameVisibility:
    "teacher:updatePeerRealNameVisibility",
  teacherActivitySnapshot: "teacher:activitySnapshot",
  studentCheckActivity: "student:checkActivity",
  studentJoinActivity: "student:joinActivity",
  studentResumeActivity: "student:resumeActivity",
  studentActivitySnapshot: "student:activitySnapshot",
  chatSendMessage: "chat:sendMessage",
  chatTyping: "chat:typing",
} as const;

export type RealtimeEventName =
  (typeof REALTIME_EVENTS)[keyof typeof REALTIME_EVENTS];

export type ParticipantConnectionStatus = "connected" | "reconnecting";

export type StudentActivityState =
  | "registering"
  | "lobby"
  | "active_pairing"
  | "chat_ended"
  | "removed"
  | "activity_ended";

export type TeacherSnapshotLobbyStudent = {
  id: EntityId;
  studentRealName: StudentRealName;
  connectionStatus: ParticipantConnectionStatus;
  disconnectDeadlineAt?: string;
};

export type ChatMessageSnapshot = {
  id: EntityId;
  senderStudentId: EntityId;
  senderCharacterName: CharacterName;
  text: string;
};

export type PairingParticipantSnapshot = {
  studentId: EntityId;
  studentRealName: StudentRealName;
  characterName: CharacterName;
  connectionStatus: ParticipantConnectionStatus;
  disconnectDeadlineAt?: string;
};

export type TeacherActivePairingSnapshot = {
  id: EntityId;
  participants: [PairingParticipantSnapshot, PairingParticipantSnapshot];
  recentMessages: ChatMessageSnapshot[];
};

export type CompletedChatSnapshot = {
  id: EntityId;
  pairingId: EntityId;
  participants: [PairingParticipantSnapshot, PairingParticipantSnapshot];
  previewMessages: ChatMessageSnapshot[];
  messages: ChatMessageSnapshot[];
};

export type TeacherActivitySnapshot = {
  activityId: ActivityId;
  joinCode: JoinCode;
  characterNames: CharacterName[];
  teacherEmail?: TeacherEmail;
  peerRealNameVisibility: boolean;
  lobbyStudents: TeacherSnapshotLobbyStudent[];
  activePairings: TeacherActivePairingSnapshot[];
  completedChats: CompletedChatSnapshot[];
  counts: {
    totalLiveStudents: number;
    lobbyStudents: number;
    studentsInChats: number;
    completedChats: number;
  };
};

export type StudentPairingPeerSnapshot = {
  studentId: EntityId;
  characterName: CharacterName;
  studentRealName?: StudentRealName;
  connectionStatus: ParticipantConnectionStatus;
  disconnectDeadlineAt?: string;
};

export type StudentActivePairingSnapshot = {
  id: EntityId;
  ownCharacterName: CharacterName;
  peer: StudentPairingPeerSnapshot;
  messages: ChatMessageSnapshot[];
  typingStudentId?: EntityId;
};

export type StudentActivitySnapshot = {
  activityId: ActivityId;
  joinCode: JoinCode;
  studentId?: EntityId;
  studentRealName?: StudentRealName;
  state: StudentActivityState;
  activePairing?: StudentActivePairingSnapshot;
  endedPairingId?: EntityId;
};

export type TeacherHostActivityPayload = {
  characterNames: CharacterName[];
  teacherEmail?: TeacherEmail;
};

export type TeacherHostActivityResult = {
  activityId: ActivityId;
  joinCode: JoinCode;
  sessionId: SessionId;
};

export type TeacherResumeActivityPayload = {
  activityId: ActivityId;
};

export type TeacherUpdateCharactersPayload = {
  activityId: ActivityId;
  characterNames: CharacterName[];
};

export type TeacherUpdateEmailPayload = {
  activityId: ActivityId;
  teacherEmail?: TeacherEmail;
};

export type TeacherUpdatePeerRealNameVisibilityPayload = {
  activityId: ActivityId;
  peerRealNameVisibility: boolean;
};

export type StudentCheckActivityPayload = {
  activityId: ActivityId;
};

export type StudentCheckActivityResult = {
  activityId: ActivityId;
  joinCode: JoinCode;
};

export type StudentJoinActivityPayload = {
  activityId: ActivityId;
  studentRealName: StudentRealName;
};

export type StudentJoinActivityResult = {
  activityId: ActivityId;
  joinCode: JoinCode;
  studentId: EntityId;
  sessionId: SessionId;
};

export type StudentResumeActivityPayload = {
  activityId: ActivityId;
};

export type ChatSendMessagePayload = {
  activityId: ActivityId;
  pairingId: EntityId;
  text: string;
};

export type ChatTypingPayload = {
  activityId: ActivityId;
  pairingId: EntityId;
  isTyping: boolean;
};

export type RealtimeCommandPayloads = {
  [REALTIME_EVENTS.teacherHostActivity]: TeacherHostActivityPayload;
  [REALTIME_EVENTS.teacherResumeActivity]: TeacherResumeActivityPayload;
  [REALTIME_EVENTS.teacherUpdateCharacters]: TeacherUpdateCharactersPayload;
  [REALTIME_EVENTS.teacherUpdateEmail]: TeacherUpdateEmailPayload;
  [REALTIME_EVENTS.teacherUpdatePeerRealNameVisibility]: TeacherUpdatePeerRealNameVisibilityPayload;
  [REALTIME_EVENTS.studentCheckActivity]: StudentCheckActivityPayload;
  [REALTIME_EVENTS.studentJoinActivity]: StudentJoinActivityPayload;
  [REALTIME_EVENTS.studentResumeActivity]: StudentResumeActivityPayload;
  [REALTIME_EVENTS.chatSendMessage]: ChatSendMessagePayload;
  [REALTIME_EVENTS.chatTyping]: ChatTypingPayload;
};

export type RealtimeServerPayloads = {
  [REALTIME_EVENTS.teacherActivitySnapshot]: TeacherActivitySnapshot;
  [REALTIME_EVENTS.studentActivitySnapshot]: StudentActivitySnapshot;
};
