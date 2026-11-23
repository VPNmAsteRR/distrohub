import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { getDistro } from "@/data/distros";
import { formatDate, plural } from "@/lib/utils";
import { RatingStars } from "@/components/rating-stars";
import { DistroCard } from "../distro-card";
import { DistroLogo } from "@/components/distro-logo";
import {
  removeReview,
  resetLocalData,
  setProfileName,
  useFavorites,
  useLocalReviews,
  useProfileName,
  useRatingStats,
} from "../store";

export default function ProfilePage() {
  const favorites = useFavorites();
  const reviews = useLocalReviews();
  const profileName = useProfileName();
  const ratings = useRatingStats();
  const [name, setName] = useState(profileName);
  const [saved, setSaved] = useState(false);

  const favoriteDistros = favorites
    .map((slug) => getDistro(slug))
    .filter((distro): distro is NonNullable<typeof distro> => Boolean(distro));

  const sortedReviews = [...reviews].sort((a, b) => b.createdAt - a.createdAt);

  function saveName(event: React.FormEvent) {
    event.preventDefault();
    setProfileName(name);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  return (
    <div className="container-page page-shell account-page">
      <nav aria-label="Хлебные крошки" className="crumbs">
        <Link href="/">Главная</Link>
        <ChevronRight className="h-3 w-3" />
        <span>Профиль</span>
      </nav>

      <header className="account-head">
        <div className="account-identity">
          <span className="account-initials">
            {(profileName || "Гость").slice(0, 1).toUpperCase()}
          </span>
          <div>
            <p className="eyebrow">Локальный профиль</p>
            <h1>{profileName || "Гость"}</h1>
            <p className="account-email">Без аккаунта и без сервера</p>
            <p className="account-since">Избранное и отзывы хранятся в этом браузере</p>
          </div>
        </div>
      </header>

      <dl className="account-stats">
        <div>
          <dt>Избранное</dt>
          <dd>{favorites.length}</dd>
        </div>
        <div>
          <dt>Отзывы</dt>
          <dd>{reviews.length}</dd>
        </div>
        <div>
          <dt>Средняя оценка</dt>
          <dd>{reviews.length ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : "нет"}</dd>
        </div>
      </dl>

      <nav className="account-tabs" aria-label="Разделы профиля">
        <a href="#favorites">Избранное · {favorites.length}</a>
        <a href="#reviews">Мои отзывы · {reviews.length}</a>
        <Link href="/wizard">
          Подобрать ещё <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </nav>

      <div className="account-tools">
        <form onSubmit={saveName}>
          <label className="label" htmlFor="profile-name">
            Как вас подписывать в отзывах
          </label>
          <div className="flex gap-2">
            <input
              id="profile-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={40}
              placeholder="Например, Алексей"
              className="field"
            />
            <button type="submit" className="btn btn-primary btn-sm shrink-0">
              {saved ? "Сохранено" : "Сохранить"}
            </button>
          </div>
          <p className="account-note">
            Имя подставляется в форму отзыва. Если оставить пустым, будет «Гость».
          </p>
        </form>

        <div>
          <p className="label">Автономная версия</p>
          <p className="account-note">
            Один HTML-файл: каталог, мастер, сравнение и гайды работают без сервера.
            Отзывы и избранное живут в localStorage браузера.
          </p>
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Удалить избранное, отзывы и имя из этого браузера?")) {
                resetLocalData();
                setName("");
              }
            }}
            className="btn btn-secondary btn-sm mt-3"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Сбросить локальные данные
          </button>
        </div>
      </div>

      <section id="favorites" className="account-section">
        <div className="account-section-head">
          <div>
            <p className="section-index">01 / избранное</p>
            <h2>Системы, к которым вы вернётесь</h2>
          </div>
          <Link href="/distros" className="link-arrow">
            В каталог <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {favoriteDistros.length > 0 ? (
          <div className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {favoriteDistros.map((distro) => (
              <DistroCard
                key={distro.slug}
                distro={distro}
                rating={ratings[distro.slug]}
                showPreview
              />
            ))}
          </div>
        ) : (
          <div className="account-empty">
            <p>Пока пусто. Нажмите на сердечко в карточке дистрибутива.</p>
            <Link href="/distros" className="btn btn-secondary btn-sm">
              Перейти в каталог
            </Link>
          </div>
        )}
      </section>

      <section id="reviews" className="account-section">
        <div className="account-section-head">
          <div>
            <p className="section-index">02 / отзывы</p>
            <h2>Ваши оценки</h2>
          </div>
        </div>
        <p className="account-note">
          Только отзывы, написанные в этом браузере. Удалить можно здесь или на странице системы.
        </p>

        {sortedReviews.length > 0 ? (
          <div className="account-reviews">
            {sortedReviews.map((review) => {
              const distro = getDistro(review.distro);
              if (!distro) return null;
              return (
                <article key={review.id} className="account-review">
                  <div className="account-review-head">
                    <Link href={`/distros/${distro.slug}`}>
                      <DistroLogo src={distro.logo} name={distro.name} size="sm" />
                      <span>
                        <strong>{distro.name}</strong>
                        <span>{formatDate(review.createdAt)}</span>
                      </span>
                    </Link>
                    <span className="flex items-center gap-3">
                      <RatingStars value={review.rating} size="sm" />
                      <button
                        type="button"
                        onClick={() => removeReview(review.id)}
                        className="inline-flex items-center gap-1 font-mono text-[0.6rem] uppercase tracking-wide text-muted hover:text-danger"
                      >
                        <Trash2 className="h-3 w-3" /> Удалить
                      </button>
                    </span>
                  </div>
                  <p>{review.body}</p>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="account-empty">
            <p>Отзывов пока нет. Начните с карточки системы, которую уже пробовали.</p>
            <Link href="/distros" className="btn btn-secondary btn-sm">
              Выбрать дистрибутив
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
