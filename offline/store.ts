import { useMemo, useSyncExternalStore } from "react";

export interface ReviewItem {
  id: string;
  distro: string;
  author: string;
  rating: number;
  body: string;
  createdAt: number;
  mine?: boolean;
}

export interface ReviewSummary {
  count: number;
  average: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

const FAVORITES_KEY = "dh-offline-favorites";
const REVIEWS_KEY = "dh-offline-reviews";
const NAME_KEY = "dh-offline-name";
const EMPTY: string[] = [];

const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((listener) => listener());
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* приватный режим или переполнение: работаем без сохранения */
  }
}

let favoritesCache: string[] | null = null;
function favoritesSnapshot(): string[] {
  if (!favoritesCache) {
    const value = readJson<unknown>(FAVORITES_KEY, []);
    favoritesCache = Array.isArray(value)
      ? value.filter((item): item is string => typeof item === "string")
      : [];
  }
  return favoritesCache;
}

export function useFavorites(): string[] {
  return useSyncExternalStore(subscribe, favoritesSnapshot, () => EMPTY);
}

export function isFavorite(slug: string): boolean {
  return favoritesSnapshot().includes(slug);
}

export function toggleFavorite(slug: string) {
  const current = favoritesSnapshot();
  favoritesCache = current.includes(slug)
    ? current.filter((item) => item !== slug)
    : [...current, slug];
  writeJson(FAVORITES_KEY, favoritesCache);
  emit();
}

let localReviewsCache: ReviewItem[] | null = null;
function localReviewsSnapshot(): ReviewItem[] {
  if (!localReviewsCache) {
    const value = readJson<unknown>(REVIEWS_KEY, []);
    localReviewsCache = Array.isArray(value)
      ? value.filter((item): item is ReviewItem => {
          if (!item || typeof item !== "object") return false;
          const review = item as ReviewItem;
          return (
            typeof review.id === "string" &&
            typeof review.distro === "string" &&
            typeof review.body === "string" &&
            typeof review.rating === "number"
          );
        })
      : [];
  }
  return localReviewsCache;
}

export function useLocalReviews(): ReviewItem[] {
  return useSyncExternalStore(subscribe, localReviewsSnapshot, () => []);
}

let nameCache: string | null = null;
function nameSnapshot(): string {
  if (nameCache === null) {
    try {
      nameCache = localStorage.getItem(NAME_KEY) || "";
    } catch {
      nameCache = "";
    }
  }
  return nameCache;
}

export function useProfileName(): string {
  return useSyncExternalStore(subscribe, nameSnapshot, () => "");
}

export function setProfileName(name: string) {
  nameCache = name.trim().slice(0, 40);
  try {
    localStorage.setItem(NAME_KEY, nameCache);
  } catch {
    /* no-op */
  }
  emit();
}

const seed: ReviewItem[] = [];

export function summarize(reviews: ReviewItem[]): ReviewSummary {
  const distribution: ReviewSummary["distribution"] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  for (const review of reviews) {
    const rating = Math.min(5, Math.max(1, Math.round(review.rating))) as 1 | 2 | 3 | 4 | 5;
    distribution[rating] += 1;
    sum += review.rating;
  }
  return {
    count: reviews.length,
    average: reviews.length ? sum / reviews.length : 0,
    distribution,
  };
}

const totals: Record<string, { total: number; count: number }> = {};
for (const review of seed) {
  const current = totals[review.distro] ?? { total: 0, count: 0 };
  current.total += review.rating;
  current.count += 1;
  totals[review.distro] = current;
}

export const REVIEW_STATS: Record<string, { average: number; count: number }> = Object.fromEntries(
  Object.entries(totals).map(([slug, value]) => [
    slug,
    { average: value.count ? value.total / value.count : 0, count: value.count },
  ]),
);

export function reviewsForDistro(slug: string, local: ReviewItem[] = localReviewsSnapshot()) {
  return [...local.filter((review) => review.distro === slug), ...seed.filter((review) => review.distro === slug)]
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function useReviews(slug: string): ReviewItem[] {
  const local = useLocalReviews();
  return reviewsForDistro(slug, local);
}

export function useRatingStats(): Record<string, { average: number; count: number }> {
  const local = useLocalReviews();
  return useMemo(() => {
    const totals: Record<string, { total: number; count: number }> = {};
    for (const review of [...seed, ...local]) {
      const current = totals[review.distro] ?? { total: 0, count: 0 };
      current.total += review.rating;
      current.count += 1;
      totals[review.distro] = current;
    }
    return Object.fromEntries(
      Object.entries(totals).map(([slug, value]) => [
        slug,
        { average: value.count ? value.total / value.count : 0, count: value.count },
      ]),
    );
  }, [local]);
}

export function addReview(slug: string, rating: number, body: string, author: string) {
  const review: ReviewItem = {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    distro: slug,
    author: author.trim() || "Гость",
    rating: Math.min(5, Math.max(1, Math.round(rating))),
    body: body.trim().slice(0, 1200),
    createdAt: Date.now(),
    mine: true,
  };
  localReviewsCache = [review, ...localReviewsSnapshot()];
  writeJson(REVIEWS_KEY, localReviewsCache);
  emit();
}

export function removeReview(id: string) {
  localReviewsCache = localReviewsSnapshot().filter((review) => review.id !== id);
  writeJson(REVIEWS_KEY, localReviewsCache);
  emit();
}

export function resetLocalData() {
  favoritesCache = [];
  localReviewsCache = [];
  nameCache = "";
  try {
    localStorage.removeItem(FAVORITES_KEY);
    localStorage.removeItem(REVIEWS_KEY);
    localStorage.removeItem(NAME_KEY);
  } catch {
    /* no-op */
  }
  emit();
}
