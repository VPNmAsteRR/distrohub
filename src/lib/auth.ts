import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getUserById, type UserRow } from "./db";
import type { PublicUser } from "./types";

const COOKIE_NAME = "dh_session";
const MAX_AGE = 60 * 60 * 24 * 30;

function secret(): Uint8Array {
  const value =
    process.env.AUTH_SECRET ||
    "distrohub-development-secret-change-me-in-production-please";
  return new TextEncoder().encode(value);
}

export function publicUser(row: UserRow): PublicUser {
  return { id: row.id, name: row.name, email: row.email, createdAt: row.created_at };
}

export async function createSession(userId: number): Promise<void> {
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(userId))
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getSessionUser(): Promise<PublicUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    const userId = Number(payload.sub);
    if (!Number.isInteger(userId)) return null;
    const row = getUserById(userId);
    return row ? publicUser(row) : null;
  } catch {
    return null;
  }
}
