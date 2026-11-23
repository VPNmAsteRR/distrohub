import { DISTROS } from "@/data/distros";
import type { Distro, PackageManager, Purpose, ReleaseModel } from "./types";

export type SortKey = "popular" | "rating" | "name" | "ram" | "new";

export interface RatingStat {
  average: number;
  count: number;
}

export interface CatalogQuery {
  q: string;
  purposes: Purpose[];
  packages: PackageManager[];
  models: ReleaseModel[];
  desktops: string[];
  maxRam: number | null;
  sort: SortKey;
}

export const SORT_LABELS: Record<SortKey, string> = {
  popular: "По популярности",
  rating: "По оценке",
  name: "По названию",
  ram: "По требованиям",
  new: "Сначала новые",
};

const SORT_KEYS = Object.keys(SORT_LABELS) as SortKey[];
const PURPOSE_VALUES = new Set<string>([
  "beginners",
  "switchers",
  "servers",
  "lightweight",
  "old-pc",
  "dev",
  "gaming",
  "privacy",
  "security",
  "containers",
]);
const PACKAGE_VALUES = new Set<string>(["deb", "rpm", "pacman", "apk", "other"]);
const MODEL_VALUES = new Set<string>(["lts", "fixed", "rolling", "immutable"]);

export function parseList(value: string | string[] | undefined): string[] {
  if (!value) return [];
  const raw = Array.isArray(value) ? value.join(",") : value;
  return raw
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

export function parseCatalogQuery(params: Record<string, string | string[] | undefined>): CatalogQuery {
  const purposes = parseList(params.p).filter((value): value is Purpose => PURPOSE_VALUES.has(value));
  const packages = parseList(params.pkg).filter(
    (value): value is PackageManager => PACKAGE_VALUES.has(value),
  );
  const models = parseList(params.rel).filter(
    (value): value is ReleaseModel => MODEL_VALUES.has(value),
  );
  const rawRam = Number(Array.isArray(params.ram) ? params.ram[0] : params.ram);
  const maxRam = Number.isFinite(rawRam) && rawRam > 0 ? rawRam : null;
  const rawSort = String(params.sort ?? "popular") as SortKey;
  const sort = SORT_KEYS.includes(rawSort) ? rawSort : "popular";
  const rawQ = Array.isArray(params.q) ? params.q[0] : params.q;

  return {
    q: (rawQ ?? "").trim(),
    purposes,
    packages,
    models,
    desktops: parseList(params.de),
    maxRam,
    sort,
  };
}

export function desktopGroups(distro: Distro): string[] {
  const text = distro.desktops.join(" ").toLowerCase();
  const groups = new Set<string>();
  if (text.includes("gnome")) groups.add("gnome");
  if (text.includes("kde")) groups.add("kde");
  if (text.includes("xfce")) groups.add("xfce");
  if (text.includes("cinnamon")) groups.add("cinnamon");
  if (text.includes("mate")) groups.add("mate");
  if (text.includes("lxqt")) groups.add("lxqt");
  if (text.includes("cosmic")) groups.add("cosmic");
  if (text.includes("icewm") || text.includes("fluxbox") || text.includes("jwm")) groups.add("other");
  if (text.includes("нет") || text.includes("любое")) groups.add("any");
  return [...groups];
}

export const DESKTOP_LABELS: Record<string, string> = {
  gnome: "GNOME",
  kde: "KDE Plasma",
  xfce: "Xfce",
  cinnamon: "Cinnamon",
  mate: "MATE",
  lxqt: "LXQt",
  cosmic: "COSMIC",
  other: "Лёгкие WM",
  any: "Без окружения",
};

export function matchesText(distro: Distro, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  const haystack = [
    distro.name,
    distro.tagline,
    distro.summary,
    distro.basedOn,
    distro.desktops.join(" "),
    distro.purposes.join(" "),
    distro.pros.join(" "),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

export function filterDistros(
  query: CatalogQuery,
  ratings: Record<string, RatingStat> = {},
): Distro[] {
  const filtered = DISTROS.filter((distro) => {
    if (!matchesText(distro, query.q)) return false;
    if (query.purposes.length && !query.purposes.some((purpose) => distro.purposes.includes(purpose))) {
      return false;
    }
    if (query.packages.length && !query.packages.includes(distro.packageManager)) return false;
    if (query.models.length && !query.models.includes(distro.releaseModel)) return false;
    if (query.maxRam && distro.minRam > query.maxRam) return false;
    if (query.desktops.length) {
      const groups = desktopGroups(distro);
      if (!query.desktops.some((desktop) => groups.includes(desktop))) return false;
    }
    return true;
  });

  return filtered.sort((a, b) => {
    switch (query.sort) {
      case "name":
        return a.name.localeCompare(b.name, "ru");
      case "ram":
        return a.minRam - b.minRam || b.popularity - a.popularity;
      case "new":
        return b.since - a.since || b.popularity - a.popularity;
      case "rating": {
        const ra = ratings[a.slug];
        const rb = ratings[b.slug];
        return (rb?.average ?? 0) - (ra?.average ?? 0) || (rb?.count ?? 0) - (ra?.count ?? 0);
      }
      default:
        return b.popularity - a.popularity;
    }
  });
}

export function searchDistros(query: string, limit = 7): Distro[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return [...DISTROS].sort((a, b) => b.popularity - a.popularity).slice(0, limit);
  }
  return DISTROS.map((distro) => {
    const name = distro.name.toLowerCase();
    let score = 0;
    if (name === q) score += 100;
    else if (name.startsWith(q)) score += 60;
    else if (name.includes(q)) score += 40;
    if (distro.tagline.toLowerCase().includes(q)) score += 12;
    if (distro.summary.toLowerCase().includes(q)) score += 6;
    if (distro.purposes.some((purpose) => purpose.includes(q))) score += 10;
    if (distro.desktops.join(" ").toLowerCase().includes(q)) score += 8;
    if (distro.basedOn.toLowerCase().includes(q)) score += 4;
    return { distro, score };
  })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || b.distro.popularity - a.distro.popularity)
    .slice(0, limit)
    .map((item) => item.distro);
}

export function buildCatalogHref(
  base: CatalogQuery,
  patch: Partial<Record<"q" | "p" | "pkg" | "rel" | "de" | "ram" | "sort", string | string[]>>,
): string {
  const params = new URLSearchParams();
  const next = { ...base, ...patch } as Record<string, unknown>;
  if (typeof next.q === "string" && next.q) params.set("q", next.q);
  if (Array.isArray(next.p) && next.p.length) params.set("p", next.p.join(","));
  if (Array.isArray(next.pkg) && next.pkg.length) params.set("pkg", next.pkg.join(","));
  if (Array.isArray(next.rel) && next.rel.length) params.set("rel", next.rel.join(","));
  if (Array.isArray(next.de) && next.de.length) params.set("de", next.de.join(","));
  if (next.ram) params.set("ram", String(next.ram));
  if (next.sort && next.sort !== "popular") params.set("sort", String(next.sort));
  const query = params.toString();
  return query ? `/distros?${query}` : "/distros";
}
