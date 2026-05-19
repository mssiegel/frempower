import { describe, expect, it } from "vitest";
import {
  type RealtimeConnectionSocket,
  subscribeToRealtimeConnectionState,
} from "./realtime";

type RealtimeConnectionEvent = Parameters<RealtimeConnectionSocket["on"]>[0];
type RealtimeConnectionListener = Parameters<
  RealtimeConnectionSocket["on"]
>[1];

class FakeRealtimeConnectionSocket implements RealtimeConnectionSocket {
  connected = false;
  disconnected = false;

  private readonly listeners = new Map<
    RealtimeConnectionEvent,
    Set<RealtimeConnectionListener>
  >();

  on(
    event: RealtimeConnectionEvent,
    listener: RealtimeConnectionListener,
  ): void {
    this.listeners.set(
      event,
      (this.listeners.get(event) ?? new Set()).add(listener),
    );
  }

  off(
    event: RealtimeConnectionEvent,
    listener: RealtimeConnectionListener,
  ): void {
    this.listeners.get(event)?.delete(listener);
  }

  connect(): void {
    this.connected = true;
  }

  disconnect(): void {
    this.disconnected = true;
  }

  emit(event: RealtimeConnectionEvent): void {
    for (const listener of this.listeners.get(event) ?? []) {
      listener();
    }
  }
}

describe("subscribeToRealtimeConnectionState", () => {
  it("reports connected when Socket.IO connects", () => {
    const socket = new FakeRealtimeConnectionSocket();
    const statuses: string[] = [];

    subscribeToRealtimeConnectionState(socket, (status) => {
      statuses.push(status);
    });

    socket.emit("connect");

    expect(socket.connected).toBe(true);
    expect(statuses).toEqual(["connected"]);
  });

  it("reports disconnected when Socket.IO disconnects or cannot connect", () => {
    const socket = new FakeRealtimeConnectionSocket();
    const statuses: string[] = [];

    subscribeToRealtimeConnectionState(socket, (status) => {
      statuses.push(status);
    });

    socket.emit("connect");
    socket.emit("disconnect");
    socket.emit("connect_error");

    expect(statuses).toEqual([
      "connected",
      "disconnected",
      "disconnected",
    ]);
  });

  it("removes listeners and disconnects the socket during cleanup", () => {
    const socket = new FakeRealtimeConnectionSocket();
    const statuses: string[] = [];

    const cleanup = subscribeToRealtimeConnectionState(socket, (status) => {
      statuses.push(status);
    });

    cleanup();
    socket.emit("connect");
    socket.emit("disconnect");

    expect(socket.disconnected).toBe(true);
    expect(statuses).toEqual([]);
  });
});
