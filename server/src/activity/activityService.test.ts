import { describe, expect, it } from "vitest";
import type { JoinCode } from "@frempower/shared";
import {
  createActivityServiceDependencies,
  createInMemoryActivityService,
  createRandomJoinCodeGenerator,
} from "./activityService.js";

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
