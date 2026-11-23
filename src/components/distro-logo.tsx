import { cn } from "@/lib/utils";

const SIZES = {
  sm: "h-9 w-9 p-1.5",
  md: "h-14 w-14 p-2.5",
  lg: "h-20 w-20 p-3.5",
  xl: "h-24 w-24 p-4",
} as const;

export function DistroLogo({
  src,
  name,
  size = "md",
  className,
}: {
  src: string;
  name: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center border border-line bg-white",
        SIZES[size],
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={`Логотип ${name}`} className="h-full w-full object-contain" loading="lazy" />
    </span>
  );
}
