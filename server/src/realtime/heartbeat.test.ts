import { describe, expect, it } from "vitest";
import {
  domainReconnectGracePeriods,
  isRealtimeHeartbeatShorterThanReconnectGracePeriods,
  realtimeHeartbeat,
  realtimeHeartbeatDeadConnectionDetectionMs,
} from "./heartbeat.js";

describe("realtime heartbeat baseline", () => {
  it("keeps Socket.IO heartbeat timing shorter than domain reconnect grace periods", () => {
    expect(isRealtimeHeartbeatShorterThanReconnectGracePeriods()).toBe(true);

    for (const gracePeriodMs of Object.values(domainReconnectGracePeriods)) {
      expect(realtimeHeartbeat.pingInterval).toBeLessThan(gracePeriodMs);
      expect(realtimeHeartbeat.pingTimeout).toBeLessThan(gracePeriodMs);
      expect(realtimeHeartbeatDeadConnectionDetectionMs).toBeLessThan(
        gracePeriodMs,
      );
    }
  });
});
