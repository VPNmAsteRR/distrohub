import { DISTROS } from "@/data/distros";
import { formatRam } from "@/lib/taxonomy";
import type { Distro, Purpose } from "@/lib/types";
import { clamp } from "@/lib/utils";

export type Experience = "newbie" | "some" | "pro";
export type RamBudget = 2 | 4 | 8 | 16;
export type UseCase = "everyday" | "dev" | "server" | "gaming" | "privacy" | "revive";
export type UpdatePref = "stable" | "balanced" | "fresh";
export type LookPref = "windows" | "macos" | "minimal" | "any";

export interface Answers {
  experience: Experience;
  ram: RamBudget;
  use: UseCase;
  updates: UpdatePref;
  look: LookPref;
}

export interface Recommendation {
  distro: Distro;
  score: number;
  match: number;
  reasons: string[];
}

const USE_WEIGHTS: Record<UseCase, Partial<Record<Purpose, number>>> = {
  everyday: { beginners: 5, switchers: 4, lightweight: 1 },
  dev: { dev: 6, containers: 2 },
  server: { servers: 6, containers: 2 },
  gaming: { gaming: 7 },
  privacy: { privacy: 8, security: 1 },
  revive: { "old-pc": 7, lightweight: 3 },
};

const HARD_DISTROS = new Set(["arch-linux", "alpine-linux", "kali-linux"]);
const NO_GUI = (distro: Distro) =>
  distro.desktops.some((desktop) => desktop.toLowerCase().includes("нет"));
const HAS_DESKTOP = (distro: Distro, ...names: string[]) =>
  distro.desktops.some((desktop) =>
    names.some((name) => desktop.toLowerCase().includes(name.toLowerCase())),
  );

function lookScore(distro: Distro, look: LookPref): number {
  switch (look) {
    case "windows":
      if (HAS_DESKTOP(distro, "cinnamon")) return 3;
      if (HAS_DESKTOP(distro, "kde")) return 2;
      if (HAS_DESKTOP(distro, "lxqt", "xfce", "mate")) return 1;
      if (HAS_DESKTOP(distro, "gnome")) return -1;
      return 0;
    case "macos":
      if (HAS_DESKTOP(distro, "zorin")) return 4;
      if (HAS_DESKTOP(distro, "gnome", "cosmic")) return 3;
      if (HAS_DESKTOP(distro, "kde")) return 1;
      return 0;
    case "minimal":
      if (HAS_DESKTOP(distro, "icewm", "fluxbox", "jwm")) return 3;
      if (HAS_DESKTOP(distro, "xfce", "lxqt")) return 2;
      if (NO_GUI(distro) || HAS_DESKTOP(distro, "любое")) return 1;
      if (HAS_DESKTOP(distro, "gnome")) return -2;
      if (HAS_DESKTOP(distro, "kde", "cinnamon")) return -1;
      return 0;
    default:
      return 0;
  }
}

function experienceScore(distro: Distro, experience: Experience): number {
  if (experience === "newbie") {
    let score = 0;
    if (distro.purposes.includes("beginners")) score += 4;
    if (distro.purposes.includes("switchers")) score += 2;
    if (HARD_DISTROS.has(distro.slug)) score -= 6;
    if (NO_GUI(distro)) score -= 4;
    if (distro.packageManager === "pacman") score -= 1;
    return score;
  }
  if (experience === "pro") {
    let score = 0;
    if (HARD_DISTROS.has(distro.slug)) score += 3;
    if (distro.releaseModel === "rolling") score += 1;
    if (distro.packageManager === "pacman") score += 1;
    return score;
  }
  return distro.packageManager === "deb" || distro.packageManager === "rpm" ? 1 : 0;
}

function updateScore(distro: Distro, updates: UpdatePref): number {
  if (updates === "stable") {
    return { lts: 4, fixed: 2, immutable: 2, rolling: -3 }[distro.releaseModel];
  }
  if (updates === "fresh") {
    return { rolling: 4, immutable: 2, fixed: 1, lts: -1 }[distro.releaseModel];
  }
  return { fixed: 3, lts: 2, immutable: 1, rolling: 0 }[distro.releaseModel];
}

function buildReasons(answers: Answers, distro: Distro, useMatched: Purpose[]): string[] {
  const reasons: string[] = [];

  if (useMatched.length > 0) {
    const primary = useMatched[0];
    const reasonByUse: Record<UseCase, string> = {
      everyday: "Рассчитан на повседневную работу без терминала",
      dev: "Удобен для разработки: свежие инструменты и контейнеры",
      server: "Серверная система с предсказуемыми обновлениями",
      gaming: "Готов к играм: Proton, драйверы и игровой стек",
      privacy: "Минимум следов и трафик через Tor",
      revive: "Работает на старом железе без апгрейда",
    };
    reasons.push(reasonByUse[answers.use]);
  }

  if (distro.minRam <= answers.ram) {
    reasons.push(
      `Хватит ${formatRam(distro.minRam)} ОЗУ, ${answers.ram > distro.minRam ? "с запасом" : "впритык"}`,
    );
  }

  if (answers.look !== "any") {
    if (answers.look === "windows" && HAS_DESKTOP(distro, "cinnamon", "kde", "lxqt")) {
      reasons.push("Знакомый интерфейс после Windows");
    }
    if (answers.look === "macos" && HAS_DESKTOP(distro, "gnome", "cosmic", "zorin")) {
      reasons.push("Интерфейс в духе macOS");
    }
    if (answers.look === "minimal" && HAS_DESKTOP(distro, "xfce", "lxqt", "icewm", "jwm")) {
      reasons.push("Минималистичный рабочий стол");
    }
  }

  if (answers.updates === "stable" && distro.releaseModel === "lts") {
    reasons.push("LTS: обновления редко и только по делу");
  }
  if (answers.updates === "fresh" && distro.releaseModel === "rolling") {
    reasons.push("Rolling: свежие пакеты каждый день");
  }
  if (distro.releaseModel === "immutable") {
    reasons.push("Иммутабельная система: сложно сломать");
  }
  if (answers.experience === "newbie" && distro.purposes.includes("beginners")) {
    reasons.push("Понятная установка и большое сообщество");
  }

  return [...new Set(reasons)].slice(0, 3);
}

export function recommend(answers: Answers): Recommendation[] {
  const available = DISTROS.filter((distro) => distro.minRam <= answers.ram + 0.01);
  const pool = available.length >= 3 ? available : DISTROS;
  const useWeights = USE_WEIGHTS[answers.use];

  const scored = pool.map((distro) => {
    let score = 0;
    const matchedPurposes: Purpose[] = [];

    for (const [purpose, weight] of Object.entries(useWeights) as [Purpose, number][]) {
      if (distro.purposes.includes(purpose)) {
        score += weight;
        matchedPurposes.push(purpose);
      }
    }
    matchedPurposes.sort((a, b) => (useWeights[b] ?? 0) - (useWeights[a] ?? 0));

    score += experienceScore(distro, answers.experience);
    score += updateScore(distro, answers.updates);
    score += lookScore(distro, answers.look);

    if (distro.minRam <= answers.ram / 2) score += 1;
    if (answers.use === "server" && NO_GUI(distro)) score += 2;
    if (answers.use === "everyday" && NO_GUI(distro)) score -= 4;
    if (answers.use === "revive" && distro.minRam <= 1) score += 1;
    if (answers.use === "gaming" && distro.releaseModel === "immutable") score += 2;

    return {
      distro,
      score,
      reasons: buildReasons(answers, distro, matchedPurposes),
    };
  });

  const maxScore = Math.max(...scored.map((item) => item.score));

  return scored
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.distro.minRam - b.distro.minRam ||
        b.distro.popularity - a.distro.popularity,
    )
    .slice(0, 5)
    .map((item, index) => ({
      ...item,
      match: clamp(Math.round(98 - index * 4 - (maxScore - item.score)), 55, 98),
    }));
}

const EXPERIENCE_VALUES: Experience[] = ["newbie", "some", "pro"];
const USE_VALUES: UseCase[] = ["everyday", "dev", "server", "gaming", "privacy", "revive"];
const UPDATE_VALUES: UpdatePref[] = ["stable", "balanced", "fresh"];
const LOOK_VALUES: LookPref[] = ["windows", "macos", "minimal", "any"];

export function parseAnswers(
  params: Record<string, string | string[] | undefined>,
): Answers | null {
  const one = (key: string): string | undefined => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };
  const experience = one("exp") as Experience;
  const use = one("use") as UseCase;
  const updates = one("upd") as UpdatePref;
  const look = one("look") as LookPref;
  const ram = Number(one("ram")) as RamBudget;

  if (
    !EXPERIENCE_VALUES.includes(experience) ||
    !USE_VALUES.includes(use) ||
    !UPDATE_VALUES.includes(updates) ||
    !LOOK_VALUES.includes(look) ||
    ![2, 4, 8, 16].includes(ram)
  ) {
    return null;
  }
  return { experience, ram, use, updates, look };
}

export function answersToQuery(answers: Answers): string {
  return new URLSearchParams({
    exp: answers.experience,
    ram: String(answers.ram),
    use: answers.use,
    upd: answers.updates,
    look: answers.look,
  }).toString();
}

export function describeAnswers(answers: Answers): string {
  const experience = { newbie: "новичок", some: "есть опыт", pro: "опытный" }[answers.experience];
  const use = {
    everyday: "повседневность",
    dev: "разработка",
    server: "сервер",
    gaming: "игры",
    privacy: "приватность",
    revive: "старый ПК",
  }[answers.use];
  return `${experience} · ${answers.ram} ГБ ОЗУ · ${use}`;
}
