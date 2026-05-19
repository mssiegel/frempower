import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type {
  ActivityId,
  EntityId,
  JoinCode,
  SessionId,
} from "@frempower/shared";
import {
  createActivityServiceDependencies,
  createInMemoryActivityService,
  createRandomJoinCodeGenerator,
} from "./activityService.js";

describe("activity service architecture", () => {
  it("does not import Socket.IO transport concerns", () => {
    const source = readFileSync(
      new URL("./activityService.ts", import.meta.url),
      "utf8"
    );

    expect(source).not.toMatch(/from\s+["']socket\.io["']/);
    expect(source).not.toMatch(/require\(["']socket\.io["']\)/);
  });
});

describe("activity service dependencies", () => {
  it("accepts deterministic clock, random, and Join Code dependencies", () => {
    const clockNow = new Date("2026-05-14T10:00:00.000Z");
    const generatedJoinCode = "54321" as JoinCode;

    const dependencies = createActivityServiceDependencies({
      clock: {
        now: () => clockNow,
      },
      random: {
        next: () => 0.5,
      },
      generateJoinCode: () => generatedJoinCode,
    });

    expect(dependencies.clock.now()).toBe(clockNow);
    expect(dependencies.random.next()).toBe(0.5);
    expect(dependencies.generateJoinCode(new Set())).toBe(generatedJoinCode);
    const service = createInMemoryActivityService({
      dependencies,
    });

    expect(service.reserveJoinCode()).toBe(generatedJoinCode);
    expect(service.listActivities()).toEqual([]);
  });

  it("generates a deterministic available Join Code after collisions", () => {
    const randomValues = [0, 0, 0.5];
    const generator = createRandomJoinCodeGenerator({
      next: () => randomValues.shift() ?? 0.5,
    });

    const reservedJoinCodes = new Set<JoinCode>(["10000" as JoinCode]);

    expect(generator(reservedJoinCodes)).toBe("55000");
  });
});

describe("activity service chat messages", () => {
  it("stores chat messages in authoritative active Pairing and student snapshot state", () => {
    const service = createInMemoryActivityService();
    const activityId = "12345" as ActivityId;
    const pairingId = "pairing-1" as EntityId;
    const message = {
      id: "message-1" as EntityId,
      senderStudentId: "student-1" as EntityId,
      senderCharacterName: "Character 1",
      text: "Hello there",
    };

    service.createActivity({
      activityId,
      joinCode: "12345",
      teacherSessionId: "teacher-session-1" as SessionId,
      characterNames: ["Character 1", "Character 2"],
      peerRealNameVisibility: false,
      status: "live",
      activePairings: [
        {
          id: pairingId,
          participants: [
            {
              studentId: "student-1" as EntityId,
              studentRealName: "Ada",
              characterName: "Character 1",
              connectionStatus: "connected",
            },
            {
              studentId: "student-2" as EntityId,
              studentRealName: "Grace",
              characterName: "Character 2",
              connectionStatus: "connected",
            },
          ],
          recentMessages: [],
        },
      ],
      studentSnapshotsBySessionId: {
        ["student-session-1" as SessionId]: {
          activityId,
          joinCode: "12345",
          studentId: "student-1" as EntityId,
          studentRealName: "Ada",
          state: "active_pairing",
          activePairing: {
            id: pairingId,
            ownCharacterName: "Character 1",
            peer: {
              studentId: "student-2" as EntityId,
              characterName: "Character 2",
              connectionStatus: "connected",
            },
            messages: [],
          },
        },
      },
    });

    const result = service.recordChatMessage(activityId, pairingId, message);

    expect(result.ok).toBe(true);
    expect(
      service.getActivity(activityId)?.activePairings?.[0]?.recentMessages
    ).toEqual([message]);
    expect(
      service.getActivity(activityId)?.studentSnapshotsBySessionId?.[
        "student-session-1" as SessionId
      ]?.activePairing?.messages
    ).toEqual([message]);
  });
});
