import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  Download,
  Globe,
  HardDrive,
  MemoryStick,
  Scale,
  ShieldCheck,
  X,
} from "lucide-react";
import { DISTROS, getDistro } from "@/data/distros";
import { getSessionUser } from "@/lib/auth";
import { listReviews, reviewSummary } from "@/lib/db";
import {
  formatRam,
  PACKAGE_LABELS,
  PURPOSE_LABELS,
  RELEASE_DESCRIPTIONS,
  RELEASE_LABELS,
  formatRating,
} from "@/lib/taxonomy";
import type { PublicReview } from "@/lib/types";
import { DesktopPreview } from "@/components/desktop-preview";
import { DistroLogo } from "@/components/distro-logo";
import { FavoriteButton } from "@/components/favorite-button";
import { RatingStars } from "@/components/rating-stars";
import { ReviewsSection } from "@/components/reviews";
import { DistroMiniCard } from "@/components/distro-card";
import { DownloadDeck } from "@/components/download-deck";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const distro = getDistro(slug);
  if (!distro) return { title: "Дистрибутив не найден" };
  return {
    title: `${distro.name}: ${distro.tagline}`,
    description: distro.summary,
    openGraph: {
      title: `${distro.name}: ${distro.tagline}`,
      description: distro.summary,
      type: "article",
    },
  };
}

export default async function DistroPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const distro = getDistro(slug);
  if (!distro) notFound();

  const user = await getSessionUser();
  const rows = listReviews(distro.slug);
  const reviews: PublicReview[] = rows.map((row) => ({
    id: row.id,
    author: row.author,
    rating: row.rating,
    body: row.body,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    mine: user ? row.user_id === user.id : false,
  }));
  const summary = reviewSummary(distro.slug);
  const mine = reviews.find((review) => review.mine) ?? null;

  const related = DISTROS.filter((item) => item.slug !== distro.slug)
    .map((item) => ({
      distro: item,
      score: item.purposes.filter((purpose) => distro.purposes.includes(purpose)).length,
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || b.distro.popularity - a.distro.popularity)
    .slice(0, 3)
    .map((item) => item.distro);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: distro.name,
    applicationCategory: "OperatingSystem",
    operatingSystem: "Linux",
    description: distro.summary,
    url: `${siteUrl}/distros/${distro.slug}`,
    offers: { "@type": "Offer", price: "0", priceCurrency: "RUB" },
    ...(summary.count > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: summary.average.toFixed(1),
            reviewCount: summary.count,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Главная", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Каталог", item: `${siteUrl}/distros` },
      {
        "@type": "ListItem",
        position: 3,
        name: distro.name,
        item: `${siteUrl}/distros/${distro.slug}`,
      },
    ],
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />

      <div className="border-b border-line bg-surface/40">
        <div className="container-page py-8">
          <nav aria-label="Хлебные крошки" className="crumbs">
            <Link href="/">Главная</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/distros">Каталог</Link>
            <ChevronRight className="h-3 w-3" />
            <span>{distro.name}</span>
          </nav>

          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
            <DistroLogo src={distro.logo} name={distro.name} size="xl" className="shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-extrabold tracking-tight sm:text-[2.6rem]">
                  {distro.name}
                </h1>
                <span className="chip border-accent/30 bg-accentSoft text-accent">
                  {distro.version}
                </span>
              </div>
              <p className="mt-1.5 text-[1.02rem] text-muted">{distro.tagline}</p>

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted">
                <a href="#reviews" className="flex items-center gap-1.5 hover:text-ink">
                  <RatingStars value={summary.average} size="sm" />
                  {summary.count ? (
                    <>
                      <span className="font-semibold text-ink">{formatRating(summary.average)}</span>
                      <span>{summary.count} отзывов</span>
                    </>
                  ) : (
                    <span>отзывов пока нет</span>
                  )}
                </a>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> {RELEASE_LABELS[distro.releaseModel]}
                </span>
                <span>{PACKAGE_LABELS[distro.packageManager]}</span>
                <span>{distro.basedOn}</span>
                <span>с {distro.since} года</span>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <DownloadDeck distro={distro} />
                <a
                  href={distro.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                >
                  <Globe className="h-4 w-4" /> Официальный сайт
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-60" />
                </a>
                <Link href={`/compare?d=${distro.slug}`} className="btn btn-secondary">
                  <Scale className="h-4 w-4" /> Сравнить
                </Link>
                <FavoriteButton slug={distro.slug} label />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-page py-10">
        <div className="distro-preview-frame" data-tilt>
          <DesktopPreview distro={distro} />
        </div>
        <p className="mt-2 text-right text-[0.7rem] text-muted">
          Превью интерфейса · {distro.desktops.join(" / ")}
        </p>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
          <div className="min-w-0 space-y-10">
            <section>
              <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Обзор</h2>
              <div className="mt-4 space-y-4 text-[0.95rem] leading-relaxed text-muted">
                {distro.description.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {distro.purposes.map((purpose) => (
                  <Link
                    key={purpose}
                    href={`/distros?p=${purpose}`}
                    className="chip transition-colors hover:border-accent/40 hover:text-accent"
                  >
                    {PURPOSE_LABELS[purpose]}
                  </Link>
                ))}
              </div>
            </section>

            <section className="distro-fit">
              <div>
                <h3><span aria-hidden="true">+</span> Кому подойдёт</h3>
                <p>{distro.bestFor}</p>
              </div>
              <div>
                <h3><span aria-hidden="true">−</span> Кому не стоит</h3>
                <p>{distro.notFor}</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Плюсы и минусы</h2>
              <div className="distro-pros">
                <div>
                  <h3>Сильные стороны</h3>
                  <ul className="mt-3 space-y-2.5 text-sm">
                    {distro.pros.map((item) => (
                      <li key={item} className="flex gap-2.5">
                        <span className="distro-mark">+</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3>Ограничения</h3>
                  <ul className="mt-3 space-y-2.5 text-sm">
                    {distro.cons.map((item) => (
                      <li key={item} className="flex gap-2.5">
                        <span className="distro-mark">−</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <ReviewsSection
              distro={distro}
              initialReviews={reviews}
              initialSummary={summary}
              initialMine={mine}
            />
          </div>

          <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            <div className="surface-card p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Скачать
              </p>
              <div className="mt-3 flex items-center justify-between gap-2">
                <div>
                  <p className="text-lg font-bold">{distro.name}</p>
                  <p className="text-xs text-muted">
                    {distro.version} · {distro.isoSize}
                  </p>
                </div>
                <DistroLogo src={distro.logo} name={distro.name} size="sm" />
              </div>
              <div className="mt-4">
                <DownloadDeck distro={distro} small full label="Скачать и открыть гайд" />
              </div>
              <p className="mt-2.5 text-center text-[0.68rem] leading-relaxed text-muted">
                Гайд по установке откроется прямо здесь
              </p>
            </div>

            <div className="surface-card p-5">
              <p className="label">Характеристики</p>
              <dl className="mt-3 text-sm">
                {[
                  ["Версия", distro.version],
                  ["Основа", distro.basedOn],
                  ["Пакеты", PACKAGE_LABELS[distro.packageManager]],
                  ["Обновления", RELEASE_LABELS[distro.releaseModel]],
                  ["Окружения", distro.desktops.join(", ")],
                  ["Архитектуры", distro.architectures.join(", ")],
                  ["ISO", distro.isoSize],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-start justify-between gap-4 border-b border-line py-2.5 last:border-0"
                  >
                    <dt className="text-muted">{label}</dt>
                    <dd className="text-right font-medium">{value}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-4 grid grid-cols-2 gap-px border border-line bg-line">
                <div className="bg-surface p-3">
                  <MemoryStick className="h-4 w-4 text-accent" />
                  <p className="mt-2 font-mono text-[0.58rem] uppercase tracking-wide text-muted">ОЗУ мин.</p>
                  <p className="text-sm font-semibold">{formatRam(distro.minRam)}</p>
                </div>
                <div className="bg-surface p-3">
                  <MemoryStick className="h-4 w-4 text-accent" />
                  <p className="mt-2 font-mono text-[0.58rem] uppercase tracking-wide text-muted">
                    ОЗУ рекоменд.
                  </p>
                  <p className="text-sm font-semibold">{formatRam(distro.recRam)}</p>
                </div>
                <div className="bg-surface p-3">
                  <HardDrive className="h-4 w-4 text-accent" />
                  <p className="mt-2 font-mono text-[0.58rem] uppercase tracking-wide text-muted">Диск</p>
                  <p className="text-sm font-semibold">{distro.disk} ГБ</p>
                </div>
                <div className="bg-surface p-3">
                  <ShieldCheck className="h-4 w-4 text-accent" />
                  <p className="mt-2 font-mono text-[0.58rem] uppercase tracking-wide text-muted">Поддержка</p>
                  <p className="text-sm font-semibold">{RELEASE_LABELS[distro.releaseModel]}</p>
                </div>
              </div>

              <p className="mt-3 text-[0.7rem] leading-relaxed text-muted">
                {RELEASE_DESCRIPTIONS[distro.releaseModel]}
              </p>
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Похожие системы</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {related.map((item) => (
                <DistroMiniCard key={item.slug} distro={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
