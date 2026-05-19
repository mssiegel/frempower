import { describe, expect, it } from "vitest";
import {
  CHAT_MESSAGE_MAX_LENGTH,
  CHAT_RECONNECT_TIMEOUT_MS,
  COMMAND_ACKNOWLEDGEMENT_ERROR_CODES,
  DEFAULT_CHARACTER_NAMES,
  DISCONNECTED_PAIRING_TIMEOUT_MS,
  JOIN_CODE_LENGTH,
  JOIN_CODE_MAX,
  JOIN_CODE_MIN,
  LOBBY_STUDENT_DISCONNECT_TIMEOUT_MS,
  TEACHER_DISCONNECT_TIMEOUT_MS,
  commandAcknowledgementError,
  commandAcknowledgementSuccess,
  normalizeCharacterNameForComparison,
  normalizeCharacterNameForStorage,
  normalizeStudentRealNameForComparison,
  normalizeStudentRealNameForStorage,
} from "./index.js";

describe("shared product constants", () => {
  it("defines the V1 Join Code range and default product limits", () => {
    expect(JOIN_CODE_LENGTH).toBe(5);
    expect(JOIN_CODE_MIN).toBe(10000);
    expect(JOIN_CODE_MAX).toBe(99999);
    expect(String(JOIN_CODE_MIN)).toHaveLength(JOIN_CODE_LENGTH);
    expect(String(JOIN_CODE_MAX)).toHaveLength(JOIN_CODE_LENGTH);
    expect(DEFAULT_CHARACTER_NAMES).toEqual([
      "Character 1",
      "Character 2",
      "Character 3",
    ]);
    expect(CHAT_MESSAGE_MAX_LENGTH).toBe(75);
  });

  it("defines disconnect timeout durations in milliseconds", () => {
    expect(TEACHER_DISCONNECT_TIMEOUT_MS).toBe(120000);
    expect(LOBBY_STUDENT_DISCONNECT_TIMEOUT_MS).toBe(15000);
    expect(DISCONNECTED_PAIRING_TIMEOUT_MS).toBe(30000);
    expect(CHAT_RECONNECT_TIMEOUT_MS).toBe(90000);
  });
});

describe("shared normalization helpers", () => {
  it("trims Character Names for storage and lowercases them for comparison", () => {
    expect(normalizeCharacterNameForStorage("  Captain Fremp  ")).toBe(
      "Captain Fremp",
    );
    expect(normalizeCharacterNameForComparison("  Captain Fremp  ")).toBe(
      "captain fremp",
    );
  });

  it("trims Student Real Names for storage and lowercases them for comparison", () => {
    expect(normalizeStudentRealNameForStorage("  Maria Cohen  ")).toBe(
      "Maria Cohen",
    );
    expect(normalizeStudentRealNameForComparison("  Maria Cohen  ")).toBe(
      "maria cohen",
    );
  });
});

describe("command acknowledgement helpers", () => {
  it("creates standard success acknowledgement results", () => {
    expect(commandAcknowledgementSuccess({ activityId: "12345" })).toEqual({
      ok: true,
      data: {
        activityId: "12345",
      },
    });
  });

  it("creates standard error acknowledgement results with stable error codes", () => {
    expect(
      commandAcknowledgementError({
        code: COMMAND_ACKNOWLEDGEMENT_ERROR_CODES.activityNotFound,
        message: "Classroom Activity is unavailable.",
      }),
    ).toEqual({
      ok: false,
      error: {
        code: "activity_not_found",
        message: "Classroom Activity is unavailable.",
      },
    });
  });
});
