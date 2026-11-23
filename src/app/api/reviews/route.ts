import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import {
  deleteReview,
  listReviews,
  reviewSummary,
  upsertReview,
  type ReviewRow,
} from "@/lib/db";
import { DISTRO_MAP } from "@/data/distros";
import { reviewSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

function publicReview(row: ReviewRow, userId?: number) {
  return {
    id: row.id,
    author: row.author,
    rating: row.rating,
    body: row.body,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    mine: userId ? row.user_id === userId : false,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const distro = searchParams.get("distro") ?? "";
  if (!DISTRO_MAP.has(distro)) {
    return NextResponse.json({ error: "Неизвестный дистрибутив" }, { status: 404 });
  }

  const user = await getSessionUser();
  const reviews = listReviews(distro).map((row) => publicReview(row, user?.id));
  const summary = reviewSummary(distro);
  return NextResponse.json({
    reviews,
    summary: {
      average: summary.average,
      count: summary.count,
      distribution: summary.distribution,
    },
    mine: reviews.find((review) => review.mine) ?? null,
  });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Нужно войти в аккаунт" }, { status: 401 });
  }
  if (!rateLimit(`review:${user.id}`, 6, 60_000)) {
    return NextResponse.json({ error: "Слишком часто. Подождите минуту." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Проверьте отзыв" },
      { status: 400 },
    );
  }
  if (!DISTRO_MAP.has(parsed.data.distro)) {
    return NextResponse.json({ error: "Неизвестный дистрибутив" }, { status: 404 });
  }

  const row = upsertReview(
    parsed.data.distro,
    user.id,
    parsed.data.rating,
    parsed.data.body.trim(),
  );
  const summary = reviewSummary(parsed.data.distro);
  return NextResponse.json({
    review: publicReview(row, user.id),
    summary: {
      average: summary.average,
      count: summary.count,
      distribution: summary.distribution,
    },
  });
}

export async function DELETE(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Нужно войти в аккаунт" }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const distro = typeof body?.distro === "string" ? body.distro : "";
  if (!DISTRO_MAP.has(distro)) {
    return NextResponse.json({ error: "Неизвестный дистрибутив" }, { status: 404 });
  }
  const removed = deleteReview(distro, user.id);
  const summary = reviewSummary(distro);
  return NextResponse.json({
    removed,
    summary: {
      average: summary.average,
      count: summary.count,
      distribution: summary.distribution,
    },
  });
}
