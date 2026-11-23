"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Command,
  Compass,
  CornerDownLeft,
  Scale,
  Search,
  Sparkles,
} from "lucide-react";
import { searchDistros } from "@/lib/catalog";
import { DistroLogo } from "./distro-logo";

const QUICK_LINKS = [
  { href: "/distros", label: "Каталог дистрибутивов", icon: Compass, hint: "20 систем" },
  { href: "/wizard", label: "Мастер подбора", icon: Sparkles, hint: "5 вопросов" },
  { href: "/compare", label: "Сравнение", icon: Scale, hint: "бок о бок" },
  { href: "/guides", label: "Гайды", icon: BookOpen, hint: "6 материалов" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const distros = useMemo(() => searchDistros(query, 6), [query]);
  const showQuickLinks = query.trim().length === 0;
  const total = showQuickLinks ? QUICK_LINKS.length : distros.length;

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === "Escape") setOpen(false);
    }
    function onCustom() {
      setOpen(true);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("dh:command", onCustom);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("dh:command", onCustom);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(0);
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => {
      document.body.style.overflow = "";
      window.clearTimeout(timer);
    };
  }, [open]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((value) => (value + 1) % Math.max(total, 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((value) => (value - 1 + total) % Math.max(total, 1));
    }
    if (event.key === "Enter") {
      event.preventDefault();
      if (showQuickLinks) {
        const link = QUICK_LINKS[active];
        if (link) go(link.href);
      } else {
        const distro = distros[active];
        if (distro) go(`/distros/${distro.slug}`);
      }
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/55 px-4 pt-[12vh] backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) setOpen(false);
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Поиск по сайту"
        className="w-full max-w-xl overflow-hidden border border-ink bg-surface shadow-[8px_8px_0_rgba(18,16,13,0.28)]"
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="h-4 w-4 shrink-0 text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Дистрибутив, окружение, сценарий…"
            className="h-14 w-full bg-transparent text-[0.95rem] outline-none placeholder:text-muted"
            aria-label="Поиск"
          />
          <kbd className="hidden rounded border border-line bg-surface2 px-1.5 py-0.5 font-mono text-[10px] text-muted sm:block">
            esc
          </kbd>
        </div>

        <div className="max-h-[52vh] overflow-y-auto p-2 scrollbar-thin">
          {showQuickLinks ? (
            <>
              <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
                Быстрый переход
              </p>
              {QUICK_LINKS.map((link, index) => (
                <button
                  key={link.href}
                  type="button"
                  onMouseEnter={() => setActive(index)}
                  onClick={() => go(link.href)}
                  className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors ${
                    index === active ? "bg-surface2 text-ink" : "text-muted hover:bg-surface2"
                  }`}
                >
                  <link.icon className="h-4 w-4" />
                  <span className="flex-1 font-medium">{link.label}</span>
                  <span className="text-xs text-muted">{link.hint}</span>
                  <ArrowRight className="h-3.5 w-3.5 opacity-60" />
                </button>
              ))}
              <p className="px-3 pt-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
                Или начните вводить название
              </p>
            </>
          ) : distros.length ? (
            <>
              <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
                Дистрибутивы
              </p>
              {distros.map((distro, index) => (
                <button
                  key={distro.slug}
                  type="button"
                  onMouseEnter={() => setActive(index)}
                  onClick={() => go(`/distros/${distro.slug}`)}
                  className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                    index === active ? "bg-surface2" : "hover:bg-surface2"
                  }`}
                >
                  <DistroLogo src={distro.logo} name={distro.name} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{distro.name}</span>
                    <span className="block truncate text-xs text-muted">{distro.tagline}</span>
                  </span>
                  <span className="hidden shrink-0 text-[11px] text-muted sm:block">
                    {distro.desktops[0]}
                  </span>
                  {index === active && <CornerDownLeft className="h-3.5 w-3.5 text-muted" />}
                </button>
              ))}
            </>
          ) : (
            <div className="px-3 py-10 text-center">
              <p className="text-sm font-medium">Ничего не нашлось</p>
              <p className="mt-1 text-xs text-muted">
                Попробуйте «Mint», «сервер» или «GNOME».
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-line bg-surface2/60 px-4 py-2.5 text-[11px] text-muted">
          <span className="flex items-center gap-1.5">
            <Command className="h-3 w-3" /> K: открыть в любом месте
          </span>
          <span className="flex items-center gap-2">
            <kbd className="rounded border border-line bg-surface px-1.5 py-0.5 font-mono">↑↓</kbd>
            выбор
            <kbd className="rounded border border-line bg-surface px-1.5 py-0.5 font-mono">↵</kbd>
            открыть
          </span>
        </div>
      </div>
    </div>
  );
}
