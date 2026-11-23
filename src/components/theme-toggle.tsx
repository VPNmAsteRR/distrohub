"use client";

import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  function toggle() {
    const root = document.documentElement;
    const next = !root.classList.contains("dark");
    root.classList.toggle("dark", next);
    try {
      localStorage.setItem("dh-theme", next ? "dark" : "light");
    } catch {
      /* приватный режим: просто игнорируем */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`icon-button ${className}`}
      aria-label="Переключить тему"
      title="Светлая / тёмная тема"
    >
      <Sun className="hidden h-[18px] w-[18px] dark:block" />
      <Moon className="h-[18px] w-[18px] dark:hidden" />
    </button>
  );
}
