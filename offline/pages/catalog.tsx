import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { DISTROS } from "@/data/distros";
import { filterDistros, parseCatalogQuery } from "@/lib/catalog";
import { PURPOSE_ORDER } from "@/lib/taxonomy";
import type { Purpose } from "@/lib/types";
import { CatalogShell } from "@/components/catalog-shell";
import { DistroCard } from "../distro-card";
import { useRatingStats } from "../store";

export default function CatalogPage({ params }: { params: URLSearchParams }) {
  const query = parseCatalogQuery(Object.fromEntries(params.entries()));
  const ratings = useRatingStats();
  const result = filterDistros(query, ratings);

  const counts = PURPOSE_ORDER.reduce(
    (acc, purpose) => {
      acc[purpose] = DISTROS.filter((distro) => distro.purposes.includes(purpose)).length;
      return acc;
    },
    {} as Record<Purpose, number>,
  );

  return (
    <div className="container-page page-shell">
      <nav aria-label="Хлебные крошки" className="crumbs">
        <Link href="/">Главная</Link>
        <ChevronRight className="h-3 w-3" />
        <span>Каталог</span>
      </nav>

      <header className="catalog-head">
        <div>
          <p className="eyebrow">01 / каталог</p>
          <h1>Двадцать систем, один список</h1>
          <p className="lede">
            От дружелюбных новичковых сборок до минималистичных серверных
            образов. Фильтруйте по задаче, пакетам и железу.
          </p>
        </div>
        <dl className="catalog-facts">
          <div>
            <dt>{DISTROS.length}</dt>
            <dd>систем</dd>
          </div>
          <div>
            <dt>{PURPOSE_ORDER.length}</dt>
            <dd>сценариев</dd>
          </div>
          <div>
            <dt>30.10</dt>
            <dd>2026</dd>
          </div>
        </dl>
      </header>

      <CatalogShell query={query} counts={counts} total={result.length}>
        {result.length > 0 ? (
          <div className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {result.map((distro) => (
              <DistroCard key={distro.slug} distro={distro} rating={ratings[distro.slug]} showPreview />
            ))}
          </div>
        ) : (
          <div className="catalog-empty">
            <p className="label">Ничего не подошло</p>
            <h2>Слишком строгие фильтры</h2>
            <p>Уберите одно условие или сбросьте всё. В каталоге есть системы под любой сценарий.</p>
            <Link href="/distros" className="btn btn-secondary btn-sm mt-6">
              Сбросить фильтры
            </Link>
          </div>
        )}
      </CatalogShell>
    </div>
  );
}
