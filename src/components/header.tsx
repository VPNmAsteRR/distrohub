"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Heart, LogOut, Menu, Search, UserRound, X } from "lucide-react";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { useSession } from "./session-provider";
import { initials } from "@/lib/utils";

const NAV = [
  { href: "/distros", label: "Каталог" },
  { href: "/wizard", label: "Подбор" },
  { href: "/compare", label: "Сравнение" },
  { href: "/guides", label: "Гайды" },
  { href: "/about", label: "О проекте" },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  function openSearch() {
    window.dispatchEvent(new Event("dh:command"));
  }

  async function onLogout() {
    await logout();
    setMenuOpen(false);
    setMobileOpen(false);
    router.push("/");
  }

  return (
    <header className="site-header">
      <div className="container-page site-header-inner">
        <Logo />

        <nav className="site-nav" aria-label="Основная навигация">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href} data-active={active}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="site-actions">
          <button type="button" onClick={openSearch} className="search-trigger" aria-label="Открыть поиск">
            <Search className="h-3.5 w-3.5" />
            <span>Поиск</span>
            <kbd>⌘K</kbd>
          </button>

          <button type="button" onClick={openSearch} className="icon-button lg:hidden" aria-label="Поиск">
            <Search className="h-4 w-4" />
          </button>

          <ThemeToggle className="icon-button" />

          {loading ? (
            <span className="skeleton ml-1 hidden h-8 w-24 sm:block" aria-hidden />
          ) : user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((value) => !value)}
                className="account-button"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <span className="account-avatar">{initials(user.name)}</span>
                <span className="hidden max-w-24 truncate sm:block">{user.name}</span>
                <ChevronDown className="hidden h-3.5 w-3.5 text-muted sm:block" />
              </button>
              {menuOpen && (
                <div role="menu" className="account-menu">
                  <div className="border-b border-line px-2.5 pb-2 pt-1.5">
                    <p className="truncate text-sm font-semibold">{user.name}</p>
                    <p className="truncate font-mono text-[0.62rem] text-muted">{user.email}</p>
                  </div>
                  <div className="pt-1">
                    <Link href="/account" role="menuitem">
                      <UserRound className="h-4 w-4" /> Профиль
                    </Link>
                    <Link href="/account#favorites" role="menuitem">
                      <Heart className="h-4 w-4" /> Избранное
                    </Link>
                    <button type="button" onClick={onLogout} role="menuitem">
                      <LogOut className="h-4 w-4" /> Выйти
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="btn btn-secondary btn-sm btn-login">
              Войти
            </Link>
          )}

          <button
            type="button"
            className="icon-button menu-toggle"
            onClick={() => setMobileOpen((value) => !value)}
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
            {NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link key={item.href} href={item.href} data-active={active}>
                  {item.label}
                </Link>
              );
            })}
            {user ? (
              <>
                <Link href="/account">Профиль</Link>
                <button type="button" onClick={onLogout}>Выйти</button>
              </>
            ) : (
              <Link href="/login">Войти или зарегистрироваться</Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
