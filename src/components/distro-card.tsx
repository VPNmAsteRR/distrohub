import Link from "next/link";
import { Users } from "lucide-react";
import type { Distro } from "@/lib/types";
import { PACKAGE_SHORT, RELEASE_LABELS, formatRam } from "@/lib/taxonomy";
import { formatRating } from "@/lib/taxonomy";
import { DistroLogo } from "./distro-logo";
import { DesktopPreview } from "./desktop-preview";
import { FavoriteButton } from "./favorite-button";
import { DownloadDeck } from "./download-deck";
import { RatingStars } from "./rating-stars";

export function DistroCard({
  distro,
  rating,
  showPreview = false,
}: {
  distro: Distro;
  rating?: { average: number; count: number };
  showPreview?: boolean;
}) {
  return (
    <article className="surface-card surface-card-hover group relative flex flex-col overflow-hidden">
      <div className="absolute right-4 top-4 z-10 flex items-center gap-1.5">
        <DownloadDeck distro={distro} variant="secondary" iconOnly />
        <FavoriteButton slug={distro.slug} />
      </div>
      <Link href={`/distros/${distro.slug}`} className="flex flex-1 flex-col p-5">
        {showPreview && (
          <div className="mb-5 overflow-hidden border border-line">
            <DesktopPreview distro={distro} compact />
          </div>
        )}
        <div className="flex items-start gap-3.5">
          <DistroLogo src={distro.logo} name={distro.name} size="md" />
          <div className="min-w-0">
            <h3 className="text-[1rem] font-bold leading-tight tracking-tight">{distro.name}</h3>
            <p className="mt-1 line-clamp-2 text-[0.78rem] leading-snug text-muted">{distro.tagline}</p>
            {rating && rating.count > 0 ? (
              <div className="mt-2 flex items-center gap-1.5">
                <RatingStars value={rating.average} size="sm" />
                <span className="text-[0.72rem] text-muted">
                  {formatRating(rating.average)} · {rating.count}
                </span>
              </div>
            ) : (
              <p className="mt-2 font-mono text-[0.58rem] uppercase tracking-[0.08em] text-muted">
                без отзывов
              </p>
            )}
          </div>
        </div>

        <p className="mt-4 line-clamp-2 text-[0.85rem] leading-relaxed text-muted">
          {distro.summary}
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          <span className="chip">{PACKAGE_SHORT[distro.packageManager]}</span>
          <span className="chip">{RELEASE_LABELS[distro.releaseModel]}</span>
          <span className="chip">{distro.desktops[0]}</span>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-line pt-4">
          <div className="text-[0.72rem] leading-relaxed text-muted">
            <span className="block">
              ОЗУ от <span className="font-semibold text-ink">{formatRam(distro.minRam)}</span>
            </span>
            <span className="block">
              Диск от <span className="font-semibold text-ink">{distro.disk} ГБ</span>
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-[0.75rem] font-semibold text-accent opacity-0 transition-opacity group-hover:opacity-100">
            Подробнее
          </span>
        </div>
      </Link>
    </article>
  );
}

export function DistroMiniCard({ distro }: { distro: Distro }) {
  return (
    <Link
      href={`/distros/${distro.slug}`}
      className="surface-card surface-card-hover flex items-center gap-3 p-3.5"
    >
      <DistroLogo src={distro.logo} name={distro.name} size="sm" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">{distro.name}</span>
        <span className="block truncate text-xs text-muted">{distro.tagline}</span>
      </span>
    </Link>
  );
}

export function AudienceCard({
  title,
  description,
  href,
  icon: Icon,
  count,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  count: number;
}) {
  return (
    <Link href={href} className="surface-card surface-card-hover group p-5">
      <div className="flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accentSoft text-accent">
          <Icon className="h-5 w-5" />
        </span>
        <span className="flex items-center gap-1 text-xs text-muted">
          <Users className="h-3.5 w-3.5" /> {count}
        </span>
      </div>
      <h3 className="mt-4 text-[0.98rem] font-semibold">{title}</h3>
      <p className="mt-1 text-[0.8rem] leading-relaxed text-muted">{description}</p>
    </Link>
  );
}
