import type {
  ActivityId,
  ChatMessageSnapshot,
  EntityId,
} from "@frempower/shared";
import type { ActivityService } from "../activity/activityService.js";
import {
  emitChatMessageToPairingRoom,
  type RealtimeRoomDeliveryServer,
} from "./roomDelivery.js";

export type RecordAndEmitChatMessageOptions = {
  activityService: Pick<ActivityService, "recordChatMessage">;
  deliveryServer: RealtimeRoomDeliveryServer;
  activityId: ActivityId;
  pairingId: EntityId;
  message: ChatMessageSnapshot;
};

export const recordAndEmitChatMessage = ({
  activityService,
  deliveryServer,
  activityId,
  pairingId,
  message,
}: RecordAndEmitChatMessageOptions): ReturnType<
  ActivityService["recordChatMessage"]
> => {
  const result = activityService.recordChatMessage(
    activityId,
    pairingId,
    message
  );

  if (!result.ok) {
    return result;
  }

  emitChatMessageToPairingRoom(deliveryServer, pairingId, message);

  return result;
};
