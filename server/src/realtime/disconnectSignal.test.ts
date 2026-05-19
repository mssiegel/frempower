import { describe, expect, it } from "vitest";
import { createRealtimeTransportDisconnectSignal } from "./disconnectSignal.js";

describe("realtime disconnect signal instrumentation", () => {
  it("treats Socket.IO disconnect as a transport-level signal for future domain disconnect behavior", () => {
    const signal = createRealtimeTransportDisconnectSignal(
      "socket-1",
      "ping timeout",
    );

    expect(signal).toMatchObject({
      event: "realtime:transportDisconnect",
      transport: "socket.io",
      transportSocketId: "socket-1",
      reason: "ping timeout",
    });
    expect(signal.domainBoundary).toContain("transport-level signal");
    expect(signal.domainBoundary).toContain("Teacher Disconnect");
    expect(signal.domainBoundary).toContain("Student Disconnect");
    expect(signal.domainBoundary).toContain("Session ID connection routing");
  });
});
