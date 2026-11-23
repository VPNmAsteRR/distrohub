"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Filter, Search, SlidersHorizontal, X } from "lucide-react";
import type { CatalogQuery } from "@/lib/catalog";
import { buildCatalogHref, DESKTOP_LABELS, SORT_LABELS } from "@/lib/catalog";
import {
  PACKAGE_LABELS,
  PACKAGE_SHORT,
  PURPOSE_LABELS,
  PURPOSE_ORDER,
  RELEASE_LABELS,
} from "@/lib/taxonomy";
import type { PackageManager, Purpose, ReleaseModel } from "@/lib/types";
import { cn } from "@/lib/utils";

const RAM_OPTIONS = [2, 4, 8, 16] as const;
const PACKAGES: PackageManager[] = ["deb", "rpm", "pacman", "apk", "other"];
const MODELS: ReleaseModel[] = ["lts", "fixed", "rolling", "immutable"];
const DESKTOPS = Object.keys(DESKTOP_LABELS);

interface Props {
  query: CatalogQuery;
  counts: Record<Purpose, number>;
  total: number;
  children: React.ReactNode;
}

export function CatalogShell({ query, counts, total, children }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState(query.q);
  const [mobileOpen, setMobileOpen] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    setSearch(query.q);
  }, [query.q]);

  useEffect(() => {
    if (search === query.q) return;
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      startTransition(() => {
        router.push(buildCatalogHref(query, { q: search }));
      });
    }, 300);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  function toggleList<T extends string>(values: T[], value: T): T[] {
    return values.includes(value)
      ? values.filter((item) => item !== value)
      : [...values, value];
  }

  function update(patch: Parameters<typeof buildCatalogHref>[1]) {
    startTransition(() => {
      router.push(buildCatalogHref(query, patch));
    });
  }

  const filtersCount =
    query.purposes.length +
    query.packages.length +
    query.models.length +
    query.desktops.length +
    (query.maxRam ? 1 : 0);

  const filters = (
    <div className="space-y-7">
      <div>
        <p className="label">Задача</p>
        <div className="flex flex-wrap gap-1.5">
          {PURPOSE_ORDER.map((purpose) => {
            const active = query.purposes.includes(purpose);
            return (
              <button
                key={purpose}
                type="button"
                className="tag-button"
                data-active={active}
                onClick={() => update({ p: toggleList(query.purposes, purpose) })}
              >
                {PURPOSE_LABELS[purpose]}
                <span className={cn("text-[0.65rem]", active ? "text-white/75" : "text-muted")}>
                  {counts[purpose] ?? 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="label">Пакеты</p>
        <div className="flex flex-wrap gap-1.5">
          {PACKAGES.map((pkg) => {
            const active = query.packages.includes(pkg);
            return (
              <button
                key={pkg}
                type="button"
                className="tag-button"
                data-active={active}
                onClick={() => update({ pkg: toggleList(query.packages, pkg) })}
              >
                {pkg === "other" ? "Другие" : PACKAGE_SHORT[pkg]}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="label">Обновления</p>
        <div className="flex flex-wrap gap-1.5">
          {MODELS.map((model) => {
            const active = query.models.includes(model);
            return (
              <button
                key={model}
                type="button"
                className="tag-button"
                data-active={active}
                onClick={() => update({ rel: toggleList(query.models, model) })}
              >
                {RELEASE_LABELS[model]}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="label">Минимум ОЗУ</p>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            className="tag-button"
            data-active={!query.maxRam}
            onClick={() => update({ ram: "" })}
          >
            Любое
          </button>
          {RAM_OPTIONS.map((ram) => (
            <button
              key={ram}
              type="button"
              className="tag-button"
              data-active={query.maxRam === ram}
              onClick={() => update({ ram: String(ram) })}
            >
              до {ram} ГБ
            </button>
          ))}
        </div>
        <p className="mt-2 text-[0.7rem] leading-relaxed text-muted">
          Покажем системы, которым хватит выбранного объёма.
        </p>
      </div>

      <div>
        <p className="label">Окружение</p>
        <div className="flex flex-wrap gap-1.5">
          {DESKTOPS.map((desktop) => {
            const active = query.desktops.includes(desktop);
            return (
              <button
                key={desktop}
                type="button"
                className="tag-button"
                data-active={active}
                onClick={() => update({ de: toggleList(query.desktops, desktop) })}
              >
                {DESKTOP_LABELS[desktop]}
              </button>
            );
          })}
        </div>
      </div>

      {filtersCount > 0 && (
        <button
          type="button"
          onClick={() => router.push("/distros")}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-ink"
        >
          <X className="h-3.5 w-3.5" /> Сбросить всё
        </button>
      )}
    </div>
  );

  const activeChips: { key: string; label: string; onRemove: () => void }[] = [
    ...query.purposes.map((purpose) => ({
      key: `p-${purpose}`,
      label: PURPOSE_LABELS[purpose],
      onRemove: () => update({ p: toggleList(query.purposes, purpose) }),
    })),
    ...query.packages.map((pkg) => ({
      key: `pkg-${pkg}`,
      label: PACKAGE_LABELS[pkg],
      onRemove: () => update({ pkg: toggleList(query.packages, pkg) }),
    })),
    ...query.models.map((model) => ({
      key: `rel-${model}`,
      label: RELEASE_LABELS[model],
      onRemove: () => update({ rel: toggleList(query.models, model) }),
    })),
    ...query.desktops.map((desktop) => ({
      key: `de-${desktop}`,
      label: DESKTOP_LABELS[desktop] ?? desktop,
      onRemove: () => update({ de: toggleList(query.desktops, desktop) }),
    })),
    ...(query.maxRam
      ? [
          {
            key: "ram",
            label: `до ${query.maxRam} ГБ ОЗУ`,
            onRemove: () => update({ ram: "" }),
          },
        ]
      : []),
  ];

  return (
    <div className="container-page pb-16">
      <div className="catalog-searchbar relative mb-6 flex flex-col gap-3 border border-line bg-surface p-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2.5 px-1">
          <Search className="h-4 w-4 shrink-0 text-muted" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Название, окружение или задача…"
            className="w-full bg-transparent py-1.5 text-sm outline-none placeholder:text-muted"
            aria-label="Поиск по каталогу"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="rounded p-0.5 text-muted hover:text-ink"
              aria-label="Очистить поиск"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 border-t border-line pt-3 sm:border-l sm:border-t-0 sm:pl-3 sm:pt-0">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="btn btn-secondary btn-sm lg:hidden"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Фильтры
            {filtersCount > 0 && (
              <span className="catalog-badge catalog-badge-accent">
                {filtersCount}
              </span>
            )}
          </button>

          <div className="relative">
            <select
              value={query.sort}
              onChange={(event) => update({ sort: event.target.value })}
              className="h-8 appearance-none rounded-lg border border-line bg-surface pl-3 pr-8 text-xs font-medium text-ink outline-none"
              aria-label="Сортировка"
            >
              {(Object.keys(SORT_LABELS) as Array<keyof typeof SORT_LABELS>).map((key) => (
                <option key={key} value={key}>
                  {SORT_LABELS[key]}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[248px_1fr]">
        <aside className="hidden lg:block">
          <div className="catalog-filter-panel sticky top-20 border border-line bg-surface p-5">
            <div className="mb-5 flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <Filter className="h-4 w-4 text-muted" /> Фильтры
              </span>
              {filtersCount > 0 && (
                <span className="catalog-badge">
                  {filtersCount}
                </span>
              )}
            </div>
            {filters}
          </div>
        </aside>

        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted">
              Найдено <span className="font-semibold text-ink">{total}</span> из 20
            </p>
            {activeChips.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {activeChips.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={chip.onRemove}
                    className="catalog-chip"
                  >
                    {chip.label}
                    <X className="h-3 w-3" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={cn("transition-opacity", pending && "pointer-events-none opacity-50")}>
            {children}
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-[90] lg:hidden">
          <div
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="catalog-sheet absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto border-t border-line bg-surface p-5 pb-8">
            <div className="mb-5 flex items-center justify-between">
              <span className="text-base font-semibold">Фильтры</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1.5 text-muted hover:bg-surface2"
                aria-label="Закрыть фильтры"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {filters}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="btn btn-primary mt-7 w-full"
            >
              Показать {total}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
