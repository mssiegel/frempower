import { describe, expect, it } from "vitest";
import {
  domainReconnectGracePeriods,
  isRealtimeHeartbeatShorterThanReconnectGracePeriods,
  realtimeHeartbeat,
  realtimeHeartbeatDeadConnectionDetectionMs,
} from "./heartbeat.js";

describe("Realtime Server heartbeat baseline", () => {
  it("configures explicit Realtime Server heartbeat settings", () => {
    expect(realtimeHeartbeat).toEqual({
      pingInterval: 5000,
      pingTimeout: 5000,
    });
  });

  it("keeps Realtime Server heartbeat timing shorter than domain reconnect grace periods", () => {
    expect(isRealtimeHeartbeatShorterThanReconnectGracePeriods()).toBe(true);

    for (const gracePeriodMs of Object.values(domainReconnectGracePeriods)) {
      expect(realtimeHeartbeat.pingInterval).toBeLessThan(gracePeriodMs);
      expect(realtimeHeartbeat.pingTimeout).toBeLessThan(gracePeriodMs);
      expect(realtimeHeartbeatDeadConnectionDetectionMs).toBeLessThan(
        gracePeriodMs
      );
    }
  });
});
