"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Heart } from "lucide-react";
import { useSession } from "./session-provider";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  slug,
  label = false,
  className,
}: {
  slug: string;
  label?: boolean;
  className?: string;
}) {
  const { user, isFavorite, toggleFavorite, loading } = useSession();
  const [pending, setPending] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const active = isFavorite(slug);

  async function onClick(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (loading || pending) return;
    setPending(true);
    await toggleFavorite(slug);
    setPending(false);
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-pressed={active}
      aria-label={active ? "Убрать из избранного" : "Добавить в избранное"}
      title={user ? (active ? "Убрать из избранного" : "Добавить в избранное") : "Войдите, чтобы сохранять избранное"}
      className={cn(
        label
          ? "btn btn-secondary btn-sm"
          : "inline-flex h-8 w-8 items-center justify-center border border-line bg-surface transition-colors",
        active ? "text-accent" : "text-muted hover:text-accent",
        className,
      )}
    >
      <Heart className={cn("h-4 w-4", active && "fill-accent")} />
      {label && <span>{active ? "В избранном" : "В избранное"}</span>}
    </button>
  );
}
