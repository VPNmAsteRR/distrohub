import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { listFavorites, toggleFavorite } from "@/lib/db";
import { DISTRO_MAP } from "@/data/distros";
import { favoriteSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ favorites: [] });
  return NextResponse.json({ favorites: listFavorites(user.id) });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Нужно войти в аккаунт" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = favoriteSchema.safeParse(body);
  if (!parsed.success || !DISTRO_MAP.has(parsed.data.distro)) {
    return NextResponse.json({ error: "Неизвестный дистрибутив" }, { status: 400 });
  }

  const active = toggleFavorite(user.id, parsed.data.distro);
  return NextResponse.json({ active });
}
