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
