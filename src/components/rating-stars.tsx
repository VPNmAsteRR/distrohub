import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const SIZES = { sm: "h-3.5 w-3.5", md: "h-4 w-4", lg: "h-5 w-5" } as const;

export function RatingStars({
  value,
  size = "sm",
  className,
}: {
  value: number;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const percent = Math.max(0, Math.min(100, (value / 5) * 100));
  return (
    <span
      className={cn("relative inline-flex", className)}
      aria-label={`Оценка ${value.toFixed(1)} из 5`}
    >
      <span className="flex gap-0.5 text-lineStrong" aria-hidden>
        {Array.from({ length: 5 }).map((_, index) => (
          <Star key={index} className={SIZES[size]} />
        ))}
      </span>
      <span
        className="absolute inset-0 flex gap-0.5 overflow-hidden text-accent"
        style={{ width: `${percent}%` }}
        aria-hidden
      >
        {Array.from({ length: 5 }).map((_, index) => (
          <Star key={index} className={cn(SIZES[size], "shrink-0 fill-accent")} />
        ))}
      </span>
    </span>
  );
}

export function RatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Ваша оценка">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} из 5`}
          onClick={() => onChange(star)}
          className="p-0.5 text-muted transition-colors hover:text-accent"
        >
          <Star className={cn("h-6 w-6", star <= value && "fill-accent text-accent")} />
        </button>
      ))}
      <span className="ml-2 text-sm text-muted">
        {value ? `${value} / 5` : "Поставьте оценку"}
      </span>
    </div>
  );
}
