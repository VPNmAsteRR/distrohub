"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Plus, Search, X } from "lucide-react";
import { DistroLogo } from "./distro-logo";
import { cn } from "@/lib/utils";

export interface CompareOption {
  slug: string;
  name: string;
  logo: string;
  tagline: string;
}

const MAX = 3;

export function ComparePicker({
  selected,
  options,
}: {
  selected: CompareOption[];
  options: CompareOption[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const available = useMemo(() => {
    const q = query.trim().toLowerCase();
    return options
      .filter((option) => !selected.some((item) => item.slug === option.slug))
      .filter(
        (option) =>
          !q ||
          option.name.toLowerCase().includes(q) ||
          option.tagline.toLowerCase().includes(q),
      );
  }, [options, query, selected]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => inputRef.current?.focus(), 50);
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function navigate(slugs: string[]) {
    startTransition(() => {
      router.push(slugs.length ? `/compare?d=${slugs.join(",")}` : "/compare");
    });
  }

  function add(slug: string) {
    navigate([...selected.map((item) => item.slug), slug]);
    setOpen(false);
  }

  function remove(slug: string) {
    navigate(selected.filter((item) => item.slug !== slug).map((item) => item.slug));
  }

  return (
    <div>
      <div className="flex flex-wrap items-stretch gap-2.5">
        {selected.map((item) => (
          <div
            key={item.slug}
            className="flex min-w-0 flex-1 items-center gap-3 border border-line bg-surface p-3 sm:max-w-[260px]"
          >
            <DistroLogo src={item.logo} name={item.name} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{item.name}</p>
              <p className="truncate text-[0.68rem] text-muted">{item.tagline}</p>
            </div>
            <button
              type="button"
              onClick={() => remove(item.slug)}
              className="shrink-0 rounded p-1 text-muted hover:bg-surface2 hover:text-ink"
              aria-label={`Убрать ${item.name}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {selected.length < MAX && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            disabled={pending}
            className={cn(
              "flex min-h-[64px] items-center justify-center gap-2 border border-dashed border-lineStrong px-4 text-xs font-semibold text-muted transition-colors hover:border-accent/50 hover:text-accent",
              selected.length === 0 && "flex-1",
            )}
          >
            <Plus className="h-4 w-4" />
            {selected.length === 0 ? "Выбрать дистрибутив" : "Добавить ещё"}
          </button>
        )}
      </div>

      {selected.length > 0 && (
        <div className="mt-2.5 flex items-center gap-3 text-[0.7rem] text-muted">
          <span>
            Выбрано {selected.length} из {MAX}
          </span>
          <button
            type="button"
            onClick={() => navigate([])}
            className="font-medium hover:text-ink"
          >
            Очистить
          </button>
        </div>
      )}

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center bg-black/55 px-4 pt-[12vh] backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Выбор дистрибутива для сравнения"
            className="w-full max-w-lg overflow-hidden border border-ink bg-surface shadow-[8px_8px_0_rgba(18,16,13,0.28)]"
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search className="h-4 w-4 shrink-0 text-muted" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Найти дистрибутив…"
                className="h-13 w-full bg-transparent py-4 text-sm outline-none focus:outline-none focus-visible:outline-none placeholder:text-muted"
                aria-label="Поиск дистрибутива"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded p-1 text-muted hover:text-ink"
                aria-label="Закрыть"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[55vh] overflow-y-auto p-2 scrollbar-thin">
              {available.length > 0 ? (
                available.map((option) => (
                  <button
                    key={option.slug}
                    type="button"
                    onClick={() => add(option.slug)}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-surface2"
                  >
                    <DistroLogo src={option.logo} name={option.name} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">{option.name}</span>
                      <span className="block truncate text-[0.7rem] text-muted">
                        {option.tagline}
                      </span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted" />
                  </button>
                ))
              ) : (
                <p className="px-4 py-10 text-center text-sm text-muted">
                  {query ? "Ничего не нашлось" : "Все дистрибутивы уже выбраны"}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-line bg-surface2/50 px-4 py-2.5 text-[0.7rem] text-muted">
              <span>Можно сравнить до {MAX} систем</span>
              {selected.length > 0 && (
                <span className="inline-flex items-center gap-1">
                  <Check className="h-3 w-3 text-emerald-500" /> выбрано {selected.length}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
