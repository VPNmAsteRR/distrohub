import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  Command,
  Heart,
  Menu,
  Search,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { DISTROS } from "@/data/distros";
import { GUIDES } from "@/data/guides";
import { searchDistros } from "@/lib/catalog";
import { initials } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { MotionLayer } from "@/components/motion";
import { Footer } from "@/components/footer";
import AboutPage from "@/app/about/page";
import GuidesIndexPage from "@/app/guides/page";
import NotFound from "@/app/not-found";
import { LOGOS } from "./logos.generated";
import { parseHash, toHashHref, type OfflineRoute } from "./routes";
import { useHash } from "./navigation";
import { useFavorites, useProfileName } from "./store";
import HomePage from "./pages/home";
import CatalogPage from "./pages/catalog";
import DistroPage from "./pages/distro";
import ComparePage from "./pages/compare";
import WizardPage from "./pages/wizard-page";
import GuidePage from "./pages/guide";
import ProfilePage from "./pages/profile";
import InstallPage from "./pages/install";

// All reused components read the same data objects. Replace the public logo
// paths with embedded data URIs once, before the first render.
for (const distro of DISTROS) {
  distro.logo = LOGOS[distro.slug] ?? distro.logo;
}

const NAV = [
  { href: "/distros", label: "Каталог", match: "catalog" },
  { href: "/wizard", label: "Подбор", match: "wizard" },
  { href: "/compare", label: "Сравнение", match: "compare" },
  { href: "/guides", label: "Гайды", match: "guides" },
  { href: "/about", label: "О проекте", match: "about" },
];

function SearchDialog({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const distros = useMemo(() => {
    const pool = query.trim() ? searchDistros(query, 7) : DISTROS.slice(0, 5);
    return pool.slice(0, 7);
  }, [query]);

  const guides = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GUIDES.filter((guide) => {
      if (!q) return true;
      return (
        guide.title.toLowerCase().includes(q) ||
        guide.description.toLowerCase().includes(q) ||
        guide.category.toLowerCase().includes(q)
      );
    }).slice(0, 4);
  }, [query]);

  return (
    <div className="palette-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-label="Поиск по сайту" className="palette">
        <div className="palette-head">
          <Search className="h-4 w-4 shrink-0 text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Дистрибутив, задача, гайд"
            aria-label="Поиск"
          />
          <button type="button" onClick={onClose} className="site-key border-0 bg-transparent">
            Esc
          </button>
        </div>

        <div className="palette-body">
          {distros.length > 0 && (
            <div>
              <p className="palette-label">Дистрибутивы</p>
              {distros.map((distro) => (
                <a
                  key={distro.slug}
                  href={toHashHref(`/distros/${distro.slug}`)}
                  onClick={onClose}
                  className="palette-item"
                >
                  <span className="palette-logo">
                    <img src={distro.logo} alt="" className="h-full w-full object-contain" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{distro.name}</span>
                    <span className="block truncate text-xs text-muted">{distro.tagline}</span>
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted" />
                </a>
              ))}
            </div>
          )}

          {guides.length > 0 && (
            <div>
              <p className="palette-label">Гайды</p>
              {guides.map((guide) => (
                <a
                  key={guide.slug}
                  href={toHashHref(`/guides/${guide.slug}`)}
                  onClick={onClose}
                  className="palette-item"
                >
                  <span className="palette-logo text-accent">
                    <BookOpen className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{guide.title}</span>
                    <span className="block truncate text-xs text-muted">{guide.description}</span>
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted" />
                </a>
              ))}
            </div>
          )}

          {distros.length === 0 && guides.length === 0 && (
            <div className="px-4 py-12 text-center">
              <p className="text-sm font-semibold">Ничего не найдено</p>
              <p className="mt-1 text-xs text-muted">Попробуйте «новичкам», «игры» или «Arch».</p>
            </div>
          )}
        </div>

        <div className="palette-foot">
          <span className="flex items-center gap-1.5">
            <Command className="h-3 w-3" /> K: открыть поиск
          </span>
          <span>Работает офлайн</span>
        </div>
      </div>
    </div>
  );
}

function Header({ onSearch }: { onSearch: () => void }) {
  const hash = useHash();
  const route = parseHash(hash);
  const favorites = useFavorites();
  const profileName = useProfileName();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [hash]);

  const active = (match: string) => {
    if (match === "guides") return route.segment === "guides" || route.segment === "guide";
    return route.segment === match;
  };

  return (
    <header className="site-header">
      <div className="container-page site-header-inner">
        <Logo />

        <nav className="site-nav" aria-label="Основная навигация">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} data-active={active(item.match)}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="site-actions">
          <button type="button" onClick={onSearch} className="search-trigger" aria-label="Открыть поиск">
            <Search className="h-3.5 w-3.5" />
            <span>Поиск</span>
            <kbd>Ctrl K</kbd>
          </button>

          <button type="button" onClick={onSearch} className="icon-button lg:hidden" aria-label="Поиск">
            <Search className="h-4 w-4" />
          </button>

          <ThemeToggle className="icon-button" />

          <Link href="/account" className="account-button" aria-label={`Избранное и профиль, ${favorites.length}`}>
            <span className="account-avatar">
              {profileName ? initials(profileName) : <UserRound className="h-3.5 w-3.5" />}
            </span>
            <span className="hidden max-w-24 truncate sm:block">
              {profileName ? profileName.split(/\s+/)[0] : "Профиль"}
            </span>
            <span className="font-mono text-[0.62rem] text-muted">
              {favorites.length}
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            className="icon-button menu-toggle"
            aria-label={mobileOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="site-mobile menu-toggle-block">
          <nav className="container-page" aria-label="Мобильная навигация">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} data-active={active(item.match)}>
                {item.label}
              </Link>
            ))}
            <Link href="/account">Избранное и профиль</Link>
          </nav>
        </div>
      )}
    </header>
  );
}

function OfflineNote() {
  return (
    <div className="offline-note">
      <div className="container-page offline-note-inner">
        <p><span className="offline-dot" /> Автономная версия: один HTML-файл, без сервера и интернета</p>
        <p>Избранное и отзывы хранятся в этом браузере</p>
      </div>
    </div>
  );
}

function renderPage(route: OfflineRoute) {
  switch (route.segment) {
    case "home":
      return <HomePage />;
    case "catalog":
      return <CatalogPage params={route.params} />;
    case "distro":
      return route.slug ? <DistroPage params={{ slug: route.slug }} /> : <NotFound />;
    case "compare":
      return <ComparePage params={route.params} />;
    case "wizard":
      return <WizardPage key={route.params.toString()} params={route.params} />;
    case "guides":
      return <GuidesIndexPage />;
    case "guide":
      return route.slug ? <GuidePage params={{ slug: route.slug }} /> : <NotFound />;
    case "about":
      return <AboutPage />;
    case "profile":
      return <ProfilePage />;
    case "install":
      return route.slug ? <InstallPage params={{ slug: route.slug }} /> : <NotFound />;
    default:
      return <NotFound />;
  }
}

function App() {
  const hash = useHash();
  const route = parseHash(hash);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    setSearchOpen(false);
  }, [hash]);

  useEffect(() => {
    if (window.location.hash === "" || window.location.hash === "#") {
      window.history.replaceState(null, "", "#/");
    }
  }, []);

  const pathKey = `${route.segment}/${route.slug ?? ""}`;
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathKey]);

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        onClick={(event) => {
          event.preventDefault();
          const main = document.getElementById("main");
          main?.focus();
          main?.scrollIntoView();
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:border focus:border-ink focus:bg-surface focus:px-4 focus:py-2 focus:text-sm"
      >
        К содержимому
      </a>
      <Header onSearch={() => setSearchOpen(true)} />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        {renderPage(route)}
      </main>
      <OfflineNote />
      <Footer />
      <MotionLayer />
      {searchOpen && <SearchDialog onClose={() => setSearchOpen(false)} />}
    </div>
  );
}

const container = document.getElementById("root");
if (container) {
  createRoot(container).render(<App />);
}
