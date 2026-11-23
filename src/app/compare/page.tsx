import type { Metadata } from "next";
import Link from "next/link";
import {
  ChevronRight,
  Download,
  Minus,
  Scale,
  Sparkles,
} from "lucide-react";
import { DISTROS, getDistro } from "@/data/distros";
import { allSummaries } from "@/lib/db";
import {
  PACKAGE_LABELS,
  PURPOSE_LABELS,
  RELEASE_LABELS,
  formatRam,
  formatRating,
} from "@/lib/taxonomy";
import type { Distro } from "@/lib/types";
import { ComparePicker, type CompareOption } from "@/components/compare-picker";
import { DistroLogo } from "@/components/distro-logo";
import { RatingStars } from "@/components/rating-stars";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Сравнение дистрибутивов",
  description:
    "Сравните дистрибутивы Linux бок о бок: пакеты, окружения, требования к железу, обновления и отзывы.",
};

const OPTIONS: CompareOption[] = DISTROS.map((distro) => ({
  slug: distro.slug,
  name: distro.name,
  logo: distro.logo,
  tagline: distro.tagline,
}));

const POPULAR_PAIRS = [
  { slugs: "ubuntu,linux-mint", label: "Ubuntu vs Linux Mint" },
  { slugs: "fedora-workstation,arch-linux", label: "Fedora vs Arch" },
  { slugs: "debian,ubuntu", label: "Debian vs Ubuntu" },
  { slugs: "almalinux,rocky-linux", label: "Alma vs Rocky" },
  { slugs: "lubuntu,antix", label: "Lubuntu vs antiX" },
];

interface Row {
  label: string;
  raw: (distro: Distro) => string;
  render: (distro: Distro) => React.ReactNode;
}

interface Group {
  title: string;
  rows: Row[];
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ d?: string }>;
}) {
  const params = await searchParams;
  const slugs = (params.d ?? "")
    .split(",")
    .map((slug) => slug.trim())
    .filter(Boolean);
  const selected = [...new Set(slugs)]
    .map((slug) => getDistro(slug))
    .filter((distro): distro is Distro => Boolean(distro))
    .slice(0, 3);
  const ratings = allSummaries();

  const groups: Group[] = [
    {
      title: "Основное",
      rows: [
        {
          label: "Версия",
          raw: (d) => d.version,
          render: (d) => <span className="font-mono text-[0.8rem]">{d.version}</span>,
        },
        {
          label: "Основа",
          raw: (d) => d.basedOn,
          render: (d) => d.basedOn,
        },
        {
          label: "Пакеты",
          raw: (d) => d.packageManager,
          render: (d) => PACKAGE_LABELS[d.packageManager],
        },
        {
          label: "Обновления",
          raw: (d) => d.releaseModel,
          render: (d) => RELEASE_LABELS[d.releaseModel],
        },
        {
          label: "Окружения",
          raw: (d) => d.desktops.join(", "),
          render: (d) => d.desktops.join(", "),
        },
        {
          label: "С какого года",
          raw: (d) => String(d.since),
          render: (d) => `${d.since}`,
        },
      ],
    },
    {
      title: "Железо",
      rows: [
        {
          label: "Минимум ОЗУ",
          raw: (d) => String(d.minRam),
          render: (d) => (
            <span className="font-semibold">{formatRam(d.minRam)}</span>
          ),
        },
        {
          label: "Рекомендуется ОЗУ",
          raw: (d) => String(d.recRam),
          render: (d) => formatRam(d.recRam),
        },
        {
          label: "Диск",
          raw: (d) => String(d.disk),
          render: (d) => `${d.disk} ГБ`,
        },
        {
          label: "Архитектуры",
          raw: (d) => d.architectures.join(", "),
          render: (d) => <span className="text-[0.8rem]">{d.architectures.join(", ")}</span>,
        },
        {
          label: "Размер ISO",
          raw: (d) => d.isoSize,
          render: (d) => d.isoSize,
        },
      ],
    },
    {
      title: "Сценарии",
      rows: [
        {
          label: "Для чего",
          raw: (d) => [...d.purposes].sort().join(","),
          render: (d) => (
            <span className="flex flex-wrap gap-1">
              {d.purposes.map((purpose) => (
                <span key={purpose} className="chip px-1.5 py-0.5 text-[0.65rem]">
                  {PURPOSE_LABELS[purpose]}
                </span>
              ))}
            </span>
          ),
        },
        {
          label: "Кому подойдёт",
          raw: (d) => d.bestFor,
          render: (d) => <span className="text-[0.8rem]">{d.bestFor}</span>,
        },
        {
          label: "Кому не стоит",
          raw: (d) => d.notFor,
          render: (d) => <span className="text-[0.8rem]">{d.notFor}</span>,
        },
      ],
    },
    {
      title: "Отзывы",
      rows: [
        {
          label: "Средняя оценка",
          raw: (d) => (ratings[d.slug]?.average ?? 0).toFixed(2),
          render: (d) => {
            const stat = ratings[d.slug];
            if (!stat?.count) return <span className="text-muted">нет оценок</span>;
            return (
              <span className="flex items-center gap-2">
                <RatingStars value={stat.average} size="sm" />
                <span className="font-semibold">{formatRating(stat.average)}</span>
                <span className="text-[0.7rem] text-muted">({stat.count})</span>
              </span>
            );
          },
        },
        {
          label: "Плюсы",
          raw: (d) => d.pros.join("|"),
          render: (d) => (
            <ul className="space-y-1.5">
              {d.pros.map((item) => (
                <li key={item} className="flex gap-1.5 text-[0.78rem]">
                  <span className="mt-0.5 w-3 shrink-0 font-mono text-[0.7rem] text-success">+</span>
                  {item}
                </li>
              ))}
            </ul>
          ),
        },
        {
          label: "Минусы",
          raw: (d) => d.cons.join("|"),
          render: (d) => (
            <ul className="space-y-1.5">
              {d.cons.map((item) => (
                <li key={item} className="flex gap-1.5 text-[0.78rem]">
                  <span className="mt-0.5 w-3 shrink-0 font-mono text-[0.7rem] text-danger">−</span>
                  {item}
                </li>
              ))}
            </ul>
          ),
        },
      ],
    },
  ];

  return (
    <div className="container-page page-shell">
      <nav aria-label="Хлебные крошки" className="crumbs">
        <Link href="/">Главная</Link>
        <ChevronRight className="h-3 w-3" />
        <span>Сравнение</span>
      </nav>

      <header className="compare-head">
        <div>
          <p className="eyebrow">03 / сравнение</p>
          <h1>Две системы, одна таблица</h1>
          <p className="lede">
            Все ключевые различия рядом. Выберите до трёх систем,
            похожие строки приглушим, расхождения выделим.
          </p>
        </div>
        <dl className="compare-facts">
          <div>
            <dt>до 3</dt>
            <dd>систем</dd>
          </div>
          <div>
            <dt>17</dt>
            <dd>параметров</dd>
          </div>
          <div>
            <dt>30.10</dt>
            <dd>2026</dd>
          </div>
        </dl>
      </header>

      <div className="compare-picker-frame">
        <ComparePicker selected={selected} options={OPTIONS} />
      </div>

      {selected.length >= 2 ? (
        <div className="mt-8">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 bg-accent" /> различия выделены тёмным
            </span>
            <span>Прокрутите таблицу вбок на узком экране</span>
          </div>

          <div className="compare-table-wrap overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="sticky left-0 z-20 w-[168px] min-w-[168px] border-r border-line bg-surface px-4 py-4 text-left align-bottom text-[0.7rem] font-semibold uppercase tracking-wider text-muted">
                    Параметр
                  </th>
                  {selected.map((distro) => (
                    <th key={distro.slug} className="min-w-[190px] px-4 py-4 text-left align-bottom">
                      <div className="flex items-center gap-2.5">
                        <DistroLogo src={distro.logo} name={distro.name} size="sm" />
                        <div className="min-w-0">
                          <Link
                            href={`/distros/${distro.slug}`}
                            className="block truncate font-bold hover:text-accent"
                          >
                            {distro.name}
                          </Link>
                          <span className="block truncate text-[0.68rem] font-normal text-muted">
                            {distro.tagline}
                          </span>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              {groups.map((group) => (
                <tbody key={group.title}>
                  <tr className="border-y border-line bg-surface2/60">
                    <th
                      colSpan={selected.length + 1}
                      className="sticky left-0 px-4 py-2 text-left text-[0.65rem] font-bold uppercase tracking-[0.14em] text-muted"
                    >
                      {group.title}
                    </th>
                  </tr>
                  {group.rows.map((row) => {
                    const raws = selected.map((distro) => row.raw(distro));
                    const same = new Set(raws).size === 1;
                    return (
                      <tr key={row.label} className="border-b border-line last:border-0">
                        <th className="sticky left-0 z-10 border-r border-line bg-surface px-4 py-3 text-left align-top text-[0.78rem] font-medium text-muted">
                          {row.label}
                        </th>
                        {selected.map((distro, index) => (
                          <td
                            key={distro.slug}
                            className={`px-4 py-3 align-top ${
                              same ? "text-muted" : "text-ink"
                            }`}
                          >
                            <span className={same ? "" : "font-medium"}>{row.render(distro)}</span>
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              ))}

              <tfoot>
                <tr>
                  <th className="sticky left-0 z-10 border-r border-t border-line bg-surface px-4 py-4 text-left text-[0.7rem] uppercase tracking-wider text-muted">
                    Скачать
                  </th>
                  {selected.map((distro) => (
                    <td key={distro.slug} className="border-t border-line px-4 py-4 align-top">
                      <a
                        href={distro.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary btn-sm"
                      >
                        <Download className="h-3.5 w-3.5" /> ISO
                      </a>
                      <p className="mt-1.5 text-[0.66rem] text-muted">{distro.isoSize}</p>
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ) : (
        <div className="mt-8">
          <div className="compare-empty">
            <span className="compare-empty-mark">
              {selected.length === 0 ? (
                <Scale className="h-6 w-6" />
              ) : (
                <Sparkles className="h-6 w-6" />
              )}
            </span>
            <h2>
              {selected.length === 0
                ? "Выберите два дистрибутива"
                : "Добавьте второй дистрибутив"}
            </h2>
            <p>
              {selected.length === 0
                ? "Нажмите «Выбрать дистрибутив» выше: таблица появится сразу после второго выбора."
                : `«${selected[0].name}» уже выбран. Осталось добавить систему для сравнения.`}
            </p>

            <div className="compare-pairs">
              <p className="label">
                Популярные сравнения
              </p>
              <div className="compare-pairs-list">
                {POPULAR_PAIRS.map((pair) => (
                  <Link
                    key={pair.slugs}
                    href={`/compare?d=${pair.slugs}`}
                    className="compare-pair"
                  >
                    {pair.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="compare-notes">
            {[
              {
                title: "Без маркетинга",
                text: "Только факты: пакеты, железо, модель обновлений и опыт пользователей.",
              },
              {
                title: "Различия видны",
                text: "Похожие характеристики приглушаются, отличия выделяются.",
              },
              {
                title: "До трёх систем",
                text: "Можно сравнить две или три системы одновременно.",
              },
            ].map((item) => (
              <div key={item.title} className="compare-note">
                <p className="flex items-center gap-1.5 text-[0.8rem] font-semibold">
                  <Minus className="h-3.5 w-3.5 text-accent" /> {item.title}
                </p>
                <p className="mt-1.5 text-[0.72rem] leading-relaxed text-muted">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="compare-cta">
        <p className="text-sm text-muted">
          Не знаете, что выбрать? Мастер подбора сузит список до трёх вариантов.
        </p>
        <Link href="/wizard" className="btn btn-secondary btn-sm">
          <Sparkles className="h-3.5 w-3.5" /> Подобрать
        </Link>
      </div>
    </div>
  );
}
