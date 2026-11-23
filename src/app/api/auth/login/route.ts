import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/auth";
import { getUserByEmail } from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const ip = clientIp(request);
  if (!rateLimit(`login:${ip}`, 10, 60_000)) {
    return NextResponse.json(
      { error: "Слишком много попыток входа. Подождите минуту." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Проверьте поля формы" },
      { status: 400 },
    );
  }

  const user = getUserByEmail(parsed.data.email.trim().toLowerCase());
  const valid = user ? await bcrypt.compare(parsed.data.password, user.password_hash) : false;
  if (!user || !valid) {
    return NextResponse.json({ error: "Неверный email или пароль" }, { status: 401 });
  }

  await createSession(user.id);
  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, createdAt: user.created_at },
  });
}
