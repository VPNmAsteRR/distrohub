import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { isFavorite, toggleFavorite, useFavorites } from "./store";

export function FavoriteButton({
  slug,
  label = false,
  className,
}: {
  slug: string;
  label?: boolean;
  className?: string;
}) {
  useFavorites();
  const active = isFavorite(slug);

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleFavorite(slug);
      }}
      aria-pressed={active}
      aria-label={active ? "Убрать из избранного" : "Добавить в избранное"}
      title={
        active
          ? "Убрать из избранного"
          : "Добавить в избранное: сохранится в этом браузере"
      }
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
