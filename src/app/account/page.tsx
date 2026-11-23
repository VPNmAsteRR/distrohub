import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { allSummaries, listFavorites, reviewsByUser } from "@/lib/db";
import { getDistro } from "@/data/distros";
import { DistroCard } from "@/components/distro-card";
import { DistroLogo } from "@/components/distro-logo";
import { RatingStars } from "@/components/rating-stars";
import { LogoutButton } from "@/components/logout-button";
import { formatRating } from "@/lib/taxonomy";
import { formatDate, formatShortDate, initials } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Профиль",
  description: "Избранные дистрибутивы и ваши отзывы.",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/account");

  const favorites = listFavorites(user.id)
    .map((slug) => getDistro(slug))
    .filter((distro): distro is NonNullable<typeof distro> => Boolean(distro));
  const reviews = reviewsByUser(user.id);
  const ratings = allSummaries();
  const average =
    reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;

  return (
    <div className="container-page page-shell account-page">
      <header className="account-head">
        <div className="account-identity">
          <span className="account-initials">{initials(user.name)}</span>
          <div>
            <p className="eyebrow">Профиль</p>
            <h1>{user.name}</h1>
            <p className="account-email">{user.email}</p>
            <p className="account-since">В DistroHub с {formatShortDate(user.createdAt)}</p>
          </div>
        </div>
        <LogoutButton />
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
          <dd>{reviews.length ? formatRating(average) : "нет"}</dd>
        </div>
      </dl>

      <nav className="account-tabs" aria-label="Разделы профиля">
        <a href="#favorites">Избранное · {favorites.length}</a>
        <a href="#reviews">Мои отзывы · {reviews.length}</a>
        <Link href="/wizard">
          Подобрать ещё
        </Link>
      </nav>

      <section id="favorites" className="account-section">
        <div className="account-section-head">
          <div>
            <p className="section-index">01 / избранное</p>
            <h2>Системы, к которым вы вернётесь</h2>
          </div>
          <Link href="/distros" className="link-arrow">
            Добавить ещё
          </Link>
        </div>

        {favorites.length > 0 ? (
          <div className="account-grid">
            {favorites.map((distro) => (
              <DistroCard key={distro.slug} distro={distro} rating={ratings[distro.slug]} showPreview />
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
          Оценку можно изменить или удалить на странице дистрибутива, в блоке отзывов.
        </p>

        {reviews.length > 0 ? (
          <div className="account-reviews">
            {reviews.map((review) => {
              const distro = getDistro(review.distro);
              if (!distro) return null;
              return (
                <article key={review.id} className="account-review">
                  <div className="account-review-head">
                    <Link href={`/distros/${distro.slug}#reviews`}>
                      <DistroLogo src={distro.logo} name={distro.name} size="sm" />
                      <span>
                        <strong>{distro.name}</strong>
                        <span>{formatDate(review.updated_at)}</span>
                      </span>
                    </Link>
                    <RatingStars value={review.rating} />
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
