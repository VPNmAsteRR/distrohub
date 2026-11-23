import { describe, expect, it } from "vitest";
import { DISTROS } from "@/data/distros";
import {
  answersToQuery,
  parseAnswers,
  recommend,
  type Answers,
} from "@/lib/recommend";

const base: Answers = {
  experience: "newbie",
  ram: 8,
  use: "everyday",
  updates: "stable",
  look: "windows",
};

describe("recommend", () => {
  it("returns five ranked systems with reasons", () => {
    const result = recommend(base);
    expect(result).toHaveLength(5);
    expect(result[0].reasons.length).toBeGreaterThan(0);
    expect(result[0].match).toBeGreaterThanOrEqual(result[1].match);
  });

  it("does not offer a system below the RAM budget", () => {
    const result = recommend({ ...base, ram: 2, use: "revive", updates: "balanced" });
    for (const item of result) {
      expect(item.distro.minRam).toBeLessThanOrEqual(2);
    }
    expect(result[0].distro.purposes).toContain("old-pc");
  });

  it("puts a gaming distro first for a gaming request", () => {
    const result = recommend({
      experience: "some",
      ram: 16,
      use: "gaming",
      updates: "balanced",
      look: "any",
    });
    expect(result[0].distro.purposes).toContain("gaming");
  });

  it("keeps server recommendations free of desktop-first systems", () => {
    const result = recommend({
      experience: "pro",
      ram: 8,
      use: "server",
      updates: "stable",
      look: "minimal",
    });
    expect(result[0].distro.purposes.some((p) => p === "servers" || p === "containers")).toBe(true);
  });

  it("round-trips answers through the query string", () => {
    const query = answersToQuery(base);
    const parsed = parseAnswers(Object.fromEntries(new URLSearchParams(query).entries()));
    expect(parsed).toEqual(base);
  });

  it("rejects incomplete or invalid answers", () => {
    expect(parseAnswers({ exp: "newbie" })).toBeNull();
    expect(parseAnswers({ exp: "wizard", ram: "8", use: "dev", upd: "fresh", look: "any" })).toBeNull();
    expect(parseAnswers({ exp: "some", ram: "3", use: "dev", upd: "fresh", look: "any" })).toBeNull();
  });
});

describe("catalog data", () => {
  it("contains 20 distros with unique slugs and valid links", () => {
    expect(DISTROS).toHaveLength(20);
    expect(new Set(DISTROS.map((distro) => distro.slug)).size).toBe(20);
    for (const distro of DISTROS) {
      expect(distro.logo).toMatch(/^\/logos\/.+\.svg$/);
      expect(distro.downloadUrl).toMatch(/^https:\/\//);
      expect(distro.purposes.length).toBeGreaterThan(0);
      expect(distro.description.length).toBeGreaterThan(0);
    }
  });
});
