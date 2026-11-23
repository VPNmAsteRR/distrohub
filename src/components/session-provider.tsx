"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { PublicUser } from "@/lib/types";

interface SessionContextValue {
  user: PublicUser | null;
  loading: boolean;
  favorites: string[];
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  isFavorite: (slug: string) => boolean;
  toggleFavorite: (slug: string) => Promise<boolean>;
}

const SessionContext = createContext<SessionContextValue>({
  user: null,
  loading: true,
  favorites: [],
  refresh: async () => {},
  logout: async () => {},
  isFavorite: () => false,
  toggleFavorite: async () => false,
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadFavorites = useCallback(async () => {
    try {
      const response = await fetch("/api/favorites", { cache: "no-store" });
      if (!response.ok) {
        setFavorites([]);
        return;
      }
      const data = (await response.json()) as { favorites: string[] };
      setFavorites(data.favorites);
    } catch {
      setFavorites([]);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      if (!response.ok) {
        setUser(null);
        setFavorites([]);
        return;
      }
      const data = (await response.json()) as { user: PublicUser | null };
      setUser(data.user);
      if (data.user) await loadFavorites();
      else setFavorites([]);
    } catch {
      setUser(null);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, [loadFavorites]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setFavorites([]);
    router.refresh();
  }, [router]);

  const toggleFavorite = useCallback(
    async (slug: string) => {
      if (!user) {
        router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
        return false;
      }
      const active = favorites.includes(slug);
      setFavorites((current) =>
        active ? current.filter((item) => item !== slug) : [...current, slug],
      );
      try {
        const response = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ distro: slug }),
        });
        if (!response.ok) throw new Error("failed");
        const data = (await response.json()) as { active: boolean };
        setFavorites((current) => {
          const without = current.filter((item) => item !== slug);
          return data.active ? [...without, slug] : without;
        });
        return data.active;
      } catch {
        setFavorites((current) =>
          active ? [...current, slug] : current.filter((item) => item !== slug),
        );
        return active;
      }
    },
    [favorites, router, user],
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      user,
      loading,
      favorites,
      refresh,
      logout,
      isFavorite: (slug: string) => favorites.includes(slug),
      toggleFavorite,
    }),
    [user, loading, favorites, refresh, logout, toggleFavorite],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  return useContext(SessionContext);
}
