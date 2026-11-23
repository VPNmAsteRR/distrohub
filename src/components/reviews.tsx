"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { MessageSquare, Pencil, Star, Trash2 } from "lucide-react";
import type { Distro, PublicReview } from "@/lib/types";
import { useSession } from "./session-provider";
import { RatingInput, RatingStars } from "./rating-stars";
import { formatDate, initials, plural } from "@/lib/utils";
import { formatRating } from "@/lib/taxonomy";

interface Summary {
  average: number;
  count: number;
  distribution: Record<number, number>;
}

export function ReviewsSection({
  distro,
  initialReviews,
  initialSummary,
  initialMine,
}: {
  distro: Distro;
  initialReviews: PublicReview[];
  initialSummary: Summary;
  initialMine: PublicReview | null;
}) {
  const { user } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [reviews, setReviews] = useState(initialReviews);
  const [summary, setSummary] = useState(initialSummary);
  const [mine, setMine] = useState(initialMine);
  const [editing, setEditing] = useState(false);
  const [rating, setRating] = useState(initialMine?.rating ?? 0);
  const [body, setBody] = useState(initialMine?.body ?? "");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const showForm = Boolean(user) && (!mine || editing);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!rating) {
      setError("Поставьте оценку от 1 до 5");
      return;
    }
    if (body.trim().length < 15) {
      setError("Расскажите чуть подробнее: минимум 15 символов");
      return;
    }
    setPending(true);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ distro: distro.slug, rating, body: body.trim() }),
      });
      const data = await response.json();
      if (response.status === 401) {
        router.push(`/login?next=${encodeURIComponent(pathname)}`);
        return;
      }
      if (!response.ok) {
        setError(data.error ?? "Не удалось сохранить отзыв");
        return;
      }
      const review = data.review as PublicReview;
      setReviews((current) => {
        const rest = current.filter((item) => !item.mine && item.id !== review.id);
        return [review, ...rest];
      });
      setMine(review);
      setSummary(data.summary as Summary);
      setEditing(false);
      setNotice("Отзыв сохранён. Спасибо!");
      router.refresh();
    } catch {
      setError("Сеть недоступна. Попробуйте ещё раз.");
    } finally {
      setPending(false);
    }
  }

  async function remove() {
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/reviews", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ distro: distro.slug }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Не удалось удалить отзыв");
        return;
      }
      setReviews((current) => current.filter((item) => !item.mine));
      setMine(null);
      setSummary(data.summary as Summary);
      setRating(0);
      setBody("");
      setConfirmDelete(false);
      setNotice("Отзыв удалён");
      router.refresh();
    } catch {
      setError("Сеть недоступна. Попробуйте ещё раз.");
    } finally {
      setPending(false);
    }
  }

  function startEdit() {
    if (!mine) return;
    setRating(mine.rating);
    setBody(mine.body);
    setEditing(true);
    setNotice("");
  }

  const totalVotes = Object.values(summary.distribution).reduce((sum, n) => sum + n, 0);

  return (
    <section id="reviews" className="scroll-mt-24">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Отзывы и оценки</h2>
          <p className="mt-1 text-sm text-muted">
            {summary.count > 0
              ? `${summary.count} ${plural(summary.count, ["отзыв", "отзыва", "отзывов"])} от пользователей`
              : "Пока никто не оставил отзыв: будете первым"}
          </p>
        </div>
        {mine && !editing && (
          <div className="flex items-center gap-2">
            <button type="button" onClick={startEdit} className="btn btn-secondary btn-sm">
              <Pencil className="h-3.5 w-3.5" /> Изменить
            </button>
            {confirmDelete ? (
              <span className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={remove}
                  disabled={pending}
                  className="btn btn-sm bg-danger text-white"
                >
                  Удалить
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="btn btn-ghost btn-sm"
                >
                  Отмена
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="btn btn-ghost btn-sm text-muted"
              >
                <Trash2 className="h-3.5 w-3.5" /> Удалить
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mt-5 grid gap-5 border border-line bg-surface p-6 sm:grid-cols-[190px_1fr] sm:p-7">
        <div className="flex flex-col items-center justify-center gap-2 border-line sm:border-r">
          <p className="text-4xl font-extrabold tracking-tight">
            {summary.count ? formatRating(summary.average) : "нет"}
          </p>
          <RatingStars value={summary.average} size="md" />
          <p className="text-xs text-muted">
            {summary.count
              ? `${summary.count} ${plural(summary.count, ["оценка", "оценки", "оценок"])}`
              : "нет оценок"}
          </p>
        </div>
        <div className="space-y-1.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = summary.distribution[star] ?? 0;
            const width = totalVotes ? (count / totalVotes) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-3 text-xs">
                <span className="flex w-7 items-center gap-0.5 text-muted">
                  {star}
                  <Star className="h-3 w-3 fill-accent text-accent" />
                </span>
                <span className="h-1 flex-1 overflow-hidden bg-surface2">
                  <span
                    className="block h-full bg-accent transition-[width] duration-500"
                    style={{ width: `${width}%` }}
                  />
                </span>
                <span className="w-6 text-right tabular-nums text-muted">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {notice && (
        <p className="mt-4 border border-line border-l-2 border-l-accent bg-surface px-3 py-2 font-mono text-[0.68rem] uppercase tracking-wide text-muted">
          {notice}
        </p>
      )}

      {!user && (
        <div className="mt-5 flex flex-col items-start justify-between gap-3 border border-line bg-surface2/50 px-5 py-4 sm:flex-row sm:items-center">
          <p className="text-sm text-muted">
            Войдите, чтобы поставить оценку и рассказать о своём опыте.
          </p>
          <Link
            href={`/login?next=${encodeURIComponent("/distros/" + distro.slug)}`}
            className="btn btn-secondary btn-sm shrink-0"
          >
            Войти
          </Link>
        </div>
      )}

      {showForm && (
        <form
          onSubmit={submit}
          className="mt-5 border border-line bg-surface p-5 sm:p-6"
        >
          <h3 className="text-sm font-semibold">
            {editing ? "Редактировать отзыв" : "Ваш отзыв о " + distro.name}
          </h3>
          <div className="mt-3">
            <RatingInput value={rating} onChange={setRating} />
          </div>
          <label className="label mt-4" htmlFor="review-body">
            Впечатления
          </label>
          <textarea
            id="review-body"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={4}
            maxLength={1500}
            placeholder="Что понравилось, что нет, на каком железе запускали…"
            className="field resize-y"
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <span className="text-[0.7rem] text-muted">{body.length} / 1500</span>
            <div className="flex gap-2">
              {editing && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setEditing(false);
                    setRating(mine?.rating ?? 0);
                    setBody(mine?.body ?? "");
                    setError("");
                  }}
                >
                  Отмена
                </button>
              )}
              <button type="submit" disabled={pending} className="btn btn-primary btn-sm">
                {pending ? "Сохраняем…" : editing ? "Сохранить" : "Опубликовать"}
              </button>
            </div>
          </div>
          {error && <p className="mt-3 text-xs text-danger">{error}</p>}
          <p className="mt-3 text-[0.7rem] leading-relaxed text-muted">
            Отзывы модерируются вручную. Спам, оскорбления и реклама удаляются.
          </p>
        </form>
      )}

      <div className="mt-6 space-y-3">
        {reviews.length === 0 && (
          <div className="border border-dashed border-line px-6 py-12 text-center">
            <MessageSquare className="mx-auto h-6 w-6 text-muted" />
            <p className="mt-3 text-sm font-medium">Отзывов пока нет</p>
            <p className="mt-1 text-xs text-muted">
              Расскажите, как система ведёт себя на вашем железе.
            </p>
          </div>
        )}

        {reviews.map((review) => (
          <article key={review.id} className="border border-line bg-surface p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-line bg-surface2 font-mono text-[0.62rem] uppercase">
                {initials(review.author)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">{review.author}</span>
                  {review.mine && (
                    <span className="border border-accent/40 px-1.5 py-0.5 font-mono text-[0.55rem] uppercase tracking-wide text-accent">
                      ваш
                    </span>
                  )}
                  <span className="text-[0.7rem] text-muted">{formatDate(review.createdAt)}</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <RatingStars value={review.rating} size="sm" />
                  <span className="text-[0.7rem] text-muted">{review.rating} / 5</span>
                </div>
                <p className="mt-2.5 whitespace-pre-line text-sm leading-relaxed text-muted">
                  {review.body}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
