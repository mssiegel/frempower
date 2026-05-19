import type {
  ActivityId,
  ChatMessageSnapshot,
  EntityId,
} from "@frempower/shared";
import { REALTIME_EVENTS } from "@frempower/shared";
import { describe, expect, it } from "vitest";
import type { ActivityService } from "../activity/activityService.js";
import {
  recordAndEmitChatMessage,
  type RecordAndEmitChatMessageOptions,
} from "./chatMessageDelivery.js";
import type {
  RealtimeRoomDeliveryServer,
  RealtimeRoomDeliveryTarget,
} from "./roomDelivery.js";

describe("Realtime Server chat message delivery", () => {
  it("records Pairing chat messages in Classroom Activity state before Realtime Server delivery", () => {
    const orderedSteps: string[] = [];
    const activityId = "12345" as ActivityId;
    const pairingId = "pairing-1" as EntityId;
    const message: ChatMessageSnapshot = {
      id: "message-1" as EntityId,
      senderStudentId: "student-1" as EntityId,
      senderCharacterName: "Character 1",
      text: "Hello there",
    };
    const activityService: RecordAndEmitChatMessageOptions["activityService"] =
      {
        recordChatMessage(
          receivedActivityId,
          receivedPairingId,
          receivedMessage
        ) {
          orderedSteps.push("record");
          expect(receivedActivityId).toBe(activityId);
          expect(receivedPairingId).toBe(pairingId);
          expect(receivedMessage).toEqual(message);

          return {
            ok: true,
            activity: {
              activityId,
              joinCode: "12345",
              teacherSessionId: "teacher-session-1",
              characterNames: ["Character 1", "Character 2"],
              peerRealNameVisibility: false,
              status: "live",
            },
          } satisfies ReturnType<ActivityService["recordChatMessage"]>;
        },
      };
    const emitted: Array<{
      eventName: typeof REALTIME_EVENTS.chatSendMessage;
      payload: ChatMessageSnapshot;
    }> = [];
    const target: RealtimeRoomDeliveryTarget = {
      emit(eventName, payload) {
        orderedSteps.push("emit");
        emitted.push({
          eventName: eventName as typeof REALTIME_EVENTS.chatSendMessage,
          payload: payload as ChatMessageSnapshot,
        });
      },
    };
    const server: RealtimeRoomDeliveryServer = {
      to(roomName) {
        expect(roomName).toBe("frempower:pairing:pairing-1");

        return target;
      },
    };

    const result = recordAndEmitChatMessage({
      activityService,
      deliveryServer: server,
      activityId,
      pairingId,
      message,
    });

    expect(result.ok).toBe(true);
    expect(orderedSteps).toEqual(["record", "emit"]);
    expect(emitted).toEqual([
      {
        eventName: REALTIME_EVENTS.chatSendMessage,
        payload: message,
      },
    ]);
  });

  it("does not emit Pairing chat messages when Classroom Activity state rejects the write", () => {
    const activityService: RecordAndEmitChatMessageOptions["activityService"] =
      {
        recordChatMessage() {
          return { ok: false, reason: "pairing_not_found" };
        },
      };
    const server: RealtimeRoomDeliveryServer = {
      to() {
        throw new Error("Chat message should not be emitted");
      },
    };

    const result = recordAndEmitChatMessage({
      activityService,
      deliveryServer: server,
      activityId: "12345" as ActivityId,
      pairingId: "pairing-1" as EntityId,
      message: {
        id: "message-1" as EntityId,
        senderStudentId: "student-1" as EntityId,
        senderCharacterName: "Character 1",
        text: "Hello there",
      },
    });

    expect(result).toEqual({ ok: false, reason: "pairing_not_found" });
  });
});
