import { useState } from "react";
import {
  CheckCircle2,
  MessageSquare,
  PenLine,
  Star,
  Trash2,
  X,
} from "lucide-react";
import type { Distro } from "@/lib/types";
import { formatDate, initials, plural } from "@/lib/utils";
import { formatRating } from "@/lib/taxonomy";
import { RatingInput, RatingStars } from "@/components/rating-stars";
import {
  addReview,
  removeReview,
  setProfileName,
  summarize,
  useProfileName,
  useReviews,
} from "./store";

export function ReviewsOffline({ distro }: { distro: Distro }) {
  const reviews = useReviews(distro.slug);
  const summary = summarize(reviews);
  const profileName = useProfileName();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [name, setName] = useState(profileName);
  const [error, setError] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (rating < 1) {
      setError("Поставьте оценку от 1 до 5.");
      return;
    }
    if (body.trim().length < 20) {
      setError("Расскажите чуть подробнее: хотя бы 20 символов.");
      return;
    }
    addReview(distro.slug, rating, body, name || "Гость");
    setProfileName(name);
    setRating(0);
    setBody("");
    setError("");
    setOpen(false);
  }

  return (
    <section id="reviews" className="scroll-mt-24">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Отзывы</h2>
          <p className="mt-1 text-xs text-muted">
            Опыт пользователей. Новые отзывы сохраняются в этом браузере.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="btn btn-secondary btn-sm"
        >
          {open ? <X className="h-3.5 w-3.5" /> : <PenLine className="h-3.5 w-3.5" />}
          {open ? "Свернуть" : "Написать отзыв"}
        </button>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-[190px_1fr]">
        <div className="surface-card flex flex-col items-center justify-center p-5 text-center">
          <p className="text-4xl font-extrabold tracking-tight">
            {summary.count ? formatRating(summary.average) : "нет"}
          </p>
          <RatingStars value={summary.average} size="md" className="mt-2" />
          <p className="mt-2 text-xs text-muted">
            {summary.count
              ? `${summary.count} ${plural(summary.count, ["отзыв", "отзыва", "отзывов"])}`
              : "Пока нет отзывов"}
          </p>
        </div>

        <div className="surface-card flex flex-col justify-center p-5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = summary.distribution[star as 1 | 2 | 3 | 4 | 5];
            const percent = summary.count ? (count / summary.count) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2.5 py-0.5">
                <span className="flex w-8 items-center gap-0.5 text-[0.7rem] text-muted">
                  {star} <Star className="h-2.5 w-2.5 fill-accent text-accent" />
                </span>
                <span className="h-1 flex-1 overflow-hidden bg-surface2">
                  <span
                    className="block h-full bg-accent"
                    style={{ width: `${percent}%` }}
                  />
                </span>
                <span className="w-5 text-right font-mono text-[0.65rem] text-muted">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {open && (
        <form onSubmit={submit} className="surface-card mt-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Ваш отзыв о {distro.name}</p>
              <p className="mt-0.5 text-xs text-muted">
                Без регистрации: имя можно изменить.
              </p>
            </div>
            <label className="flex items-center gap-2 text-xs text-muted">
              Имя
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Гость"
                maxLength={40}
                className="field h-9 w-36 py-1.5 text-xs"
              />
            </label>
          </div>

          <div className="mt-4">
            <RatingInput value={rating} onChange={setRating} />
          </div>

          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={4}
            maxLength={1200}
            placeholder="Что понравилось, что нет, на каком железе работает…"
            className="field mt-3 resize-y"
          />

          {error && <p className="mt-2 text-xs text-danger">{error}</p>}

          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-[0.68rem] text-muted">{body.length} / 1200</span>
            <button type="submit" className="btn btn-primary btn-sm">
              <CheckCircle2 className="h-3.5 w-3.5" /> Опубликовать
            </button>
          </div>
        </form>
      )}

      <div className="mt-5 space-y-3">
        {reviews.length === 0 && (
          <div className="surface-card flex flex-col items-center px-6 py-12 text-center">
            <MessageSquare className="h-7 w-7 text-muted" />
            <p className="mt-3 text-sm font-semibold">Отзывов пока нет</p>
            <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted">
              Будьте первым: расскажите, как система работает на вашем железе.
            </p>
          </div>
        )}

        {reviews.map((review) => (
          <article key={review.id} className="surface-card p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-line bg-surface2 font-mono text-[0.62rem] uppercase">
                {initials(review.author)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-sm font-semibold">{review.author}</span>
                  {review.mine && (
                    <span className="border border-accent/40 px-1.5 py-0.5 font-mono text-[0.55rem] uppercase tracking-wide text-accent">
                      Ваш отзыв
                    </span>
                  )}
                  <span className="text-[0.68rem] text-muted">{formatDate(review.createdAt)}</span>
                  <span className="ml-auto flex items-center gap-1.5">
                    <RatingStars value={review.rating} size="sm" />
                    <span className="text-[0.7rem] font-semibold text-muted">{review.rating}/5</span>
                  </span>
                </div>
                <p className="mt-2 text-[0.86rem] leading-relaxed text-muted">{review.body}</p>
                {review.mine && (
                  <button
                    type="button"
                    onClick={() => removeReview(review.id)}
                    className="mt-2 inline-flex items-center gap-1 text-[0.7rem] font-medium text-muted transition-colors hover:text-danger"
                  >
                    <Trash2 className="h-3 w-3" /> Удалить
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
