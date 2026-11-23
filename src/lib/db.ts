import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

export interface UserRow {
  id: number;
  email: string;
  name: string;
  password_hash: string;
  created_at: number;
}

export interface ReviewRow {
  id: number;
  distro: string;
  user_id: number;
  rating: number;
  body: string;
  created_at: number;
  updated_at: number;
  author: string;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name          TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS reviews (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  distro     TEXT NOT NULL,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating     INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body       TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE (distro, user_id)
);

CREATE INDEX IF NOT EXISTS reviews_distro_idx ON reviews(distro);

CREATE TABLE IF NOT EXISTS favorites (
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  distro     TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, distro)
);
`;

declare global {
  // eslint-disable-next-line no-var
  var __distrohubDb: Database.Database | undefined;
}

function open(): Database.Database {
  const dir = process.env.DISTROHUB_DATA_DIR || path.join(process.cwd(), "data");
  fs.mkdirSync(dir, { recursive: true });
  const db = new Database(path.join(dir, "distrohub.db"));
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.pragma("busy_timeout = 5000");
  db.exec(SCHEMA);
  return db;
}

export function getDb(): Database.Database {
  if (!globalThis.__distrohubDb) {
    globalThis.__distrohubDb = open();
  }
  return globalThis.__distrohubDb;
}

export function getUserByEmail(email: string): UserRow | undefined {
  return getDb()
    .prepare("SELECT * FROM users WHERE email = ? COLLATE NOCASE")
    .get(email) as UserRow | undefined;
}

export function getUserById(id: number): UserRow | undefined {
  return getDb().prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow | undefined;
}

export function createUser(email: string, name: string, passwordHash: string): UserRow {
  const now = Date.now();
  const result = getDb()
    .prepare(
      "INSERT INTO users (email, name, password_hash, created_at) VALUES (?, ?, ?, ?)",
    )
    .run(email, name, passwordHash, now);
  return getUserById(Number(result.lastInsertRowid))!;
}

export function listReviews(distro: string): ReviewRow[] {
  return getDb()
    .prepare(
      `SELECT r.*, u.name AS author
       FROM reviews r JOIN users u ON u.id = r.user_id
       WHERE r.distro = ? ORDER BY r.updated_at DESC`,
    )
    .all(distro) as ReviewRow[];
}

export function reviewSummary(distro: string): {
  average: number;
  count: number;
  distribution: Record<number, number>;
} {
  const row = getDb()
    .prepare(
      "SELECT COUNT(*) AS count, COALESCE(AVG(rating), 0) AS average FROM reviews WHERE distro = ?",
    )
    .get(distro) as { count: number; average: number };
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const rows = getDb()
    .prepare("SELECT rating, COUNT(*) AS n FROM reviews WHERE distro = ? GROUP BY rating")
    .all(distro) as { rating: number; n: number }[];
  for (const item of rows) distribution[item.rating] = item.n;
  return { average: row.average, count: row.count, distribution };
}

export function allSummaries(): Record<string, { average: number; count: number }> {
  const rows = getDb()
    .prepare("SELECT distro, AVG(rating) AS average, COUNT(*) AS count FROM reviews GROUP BY distro")
    .all() as { distro: string; average: number; count: number }[];
  return Object.fromEntries(rows.map((row) => [row.distro, { average: row.average, count: row.count }]));
}

export function upsertReview(
  distro: string,
  userId: number,
  rating: number,
  body: string,
): ReviewRow {
  const now = Date.now();
  getDb()
    .prepare(
      `INSERT INTO reviews (distro, user_id, rating, body, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT (distro, user_id)
       DO UPDATE SET rating = excluded.rating, body = excluded.body, updated_at = excluded.updated_at`,
    )
    .run(distro, userId, rating, body, now, now);
  return getDb()
    .prepare(
      `SELECT r.*, u.name AS author FROM reviews r JOIN users u ON u.id = r.user_id
       WHERE r.distro = ? AND r.user_id = ?`,
    )
    .get(distro, userId) as ReviewRow;
}

export function deleteReview(distro: string, userId: number): boolean {
  const result = getDb()
    .prepare("DELETE FROM reviews WHERE distro = ? AND user_id = ?")
    .run(distro, userId);
  return result.changes > 0;
}

export function reviewsByUser(userId: number): ReviewRow[] {
  return getDb()
    .prepare(
      `SELECT r.*, u.name AS author FROM reviews r JOIN users u ON u.id = r.user_id
       WHERE r.user_id = ? ORDER BY r.updated_at DESC`,
    )
    .all(userId) as ReviewRow[];
}

export function listFavorites(userId: number): string[] {
  return (
    getDb()
      .prepare("SELECT distro FROM favorites WHERE user_id = ? ORDER BY created_at DESC")
      .all(userId) as { distro: string }[]
  ).map((row) => row.distro);
}

export function isFavorite(userId: number, distro: string): boolean {
  const row = getDb()
    .prepare("SELECT 1 FROM favorites WHERE user_id = ? AND distro = ?")
    .get(userId, distro);
  return Boolean(row);
}

export function toggleFavorite(userId: number, distro: string): boolean {
  const db = getDb();
  if (isFavorite(userId, distro)) {
    db.prepare("DELETE FROM favorites WHERE user_id = ? AND distro = ?").run(userId, distro);
    return false;
  }
  db.prepare("INSERT INTO favorites (user_id, distro, created_at) VALUES (?, ?, ?)").run(
    userId,
    distro,
    Date.now(),
  );
  return true;
}
