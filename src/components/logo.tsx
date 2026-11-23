import Link from "next/link";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span className={className ? `logo-mark ${className}` : "logo-mark"} aria-hidden="true">
      &gt;_
    </span>
  );
}

export function Logo({ compact = false }: { compact?: boolean; className?: string }) {
  return (
    <Link href="/" className="site-brand" aria-label="DistroHub, на главную">
      <LogoMark />
      {!compact && (
        <span className="site-brand-word">
          distro<em>hub</em>
        </span>
      )}
    </Link>
  );
}
