import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createSession, getSessionUser, publicUser } from "@/lib/auth";
import { createUser, getUserByEmail } from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { registerSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const ip = clientIp(request);
  if (!rateLimit(`register:${ip}`, 5, 60_000)) {
    return NextResponse.json(
      { error: "Слишком много попыток. Подождите минуту." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Проверьте поля формы" },
      { status: 400 },
    );
  }

  const email = parsed.data.email.trim().toLowerCase();
  if (getUserByEmail(email)) {
    return NextResponse.json(
      { error: "Аккаунт с таким email уже существует" },
      { status: 409 },
    );
  }

  const hash = await bcrypt.hash(parsed.data.password, 10);
  const user = createUser(email, parsed.data.name.trim(), hash);
  await createSession(user.id);

  const current = await getSessionUser();
  return NextResponse.json({ user: current ?? publicUser(user) }, { status: 201 });
}
