import { describe, expect, it } from "vitest";
import { DISTROS } from "@/data/distros";
import { filterDistros, parseCatalogQuery, searchDistros } from "@/lib/catalog";

const ratings = {
  ubuntu: { average: 4.5, count: 3 },
  "linux-mint": { average: 4.8, count: 2 },
};

describe("parseCatalogQuery", () => {
  it("parses repeated and comma-separated purposes", () => {
    const query = parseCatalogQuery({ p: "beginners,gaming", pkg: ["deb", "rpm"], rel: "lts", de: "gnome", ram: "4" });
    expect(query.purposes).toEqual(["beginners", "gaming"]);
    expect(query.packages).toEqual(["deb", "rpm"]);
    expect(query.models).toEqual(["lts"]);
    expect(query.desktops).toEqual(["gnome"]);
    expect(query.maxRam).toBe(4);
  });

  it("falls back to safe values for garbage input", () => {
    const query = parseCatalogQuery({
      p: "unknown",
      pkg: "exe",
      model: "weekly",
      desktop: "templeos",
      ram: "abc",
      sort: "random",
    });
    expect(query.purposes).toEqual([]);
    expect(query.packages).toEqual([]);
    expect(query.models).toEqual([]);
    expect(query.desktops).toEqual([]);
    expect(query.maxRam).toBeNull();
    expect(query.sort).toBe("popular");
  });
});

describe("filterDistros", () => {
  it("filters by purpose, package and RAM", () => {
    const query = parseCatalogQuery({ p: "beginners", pkg: "deb", ram: "4" });
    const result = filterDistros(query, ratings);
    expect(result.length).toBeGreaterThan(0);
    for (const distro of result) {
      expect(distro.purposes).toContain("beginners");
      expect(distro.packageManager).toBe("deb");
      expect(distro.minRam).toBeLessThanOrEqual(4);
    }
  });

  it("searches by name and description", () => {
    const query = parseCatalogQuery({ q: "arch" });
    const result = filterDistros(query, ratings);
    expect(result.map((distro) => distro.slug)).toContain("arch-linux");
    expect(result.map((distro) => distro.slug)).toContain("manjaro");
  });

  it("sorts by rating when asked", () => {
    const query = parseCatalogQuery({ sort: "rating" });
    const result = filterDistros(query, ratings);
    expect(result[0].slug).toBe("linux-mint");
  });
});

describe("searchDistros", () => {
  it("returns a limited list and handles an empty query", () => {
    expect(searchDistros("", 3)).toHaveLength(3);
    expect(searchDistros("ubuntu", 10).map((distro) => distro.slug)).toContain("ubuntu");
  });

  it("covers every distro with a query by name", () => {
    for (const distro of DISTROS) {
      expect(searchDistros(distro.name, 10).map((item) => item.slug)).toContain(distro.slug);
    }
  });
});
