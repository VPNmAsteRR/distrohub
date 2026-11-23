import Link from "next/link";
import { LogoMark } from "./logo";

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
  mode,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  mode: "login" | "register";
}) {
  return (
    <div className="container-page auth-page">
      <div className="auth-shell">
        <aside className="auth-aside">
          <Link href="/" className="site-brand" aria-label="DistroHub">
            <LogoMark />
            <span className="site-brand-word">
              distro<em>hub</em>
            </span>
          </Link>

          <div className="auth-aside-copy">
            <p className="eyebrow" style={{ color: "var(--accent)" }}>
              {mode === "login" ? "С возвращением" : "Аккаунт DistroHub"}
            </p>
            <h2>
              {mode === "login"
                ? "Избранные системы уже на месте"
                : "Сохраните то, что действительно подошло"}
            </h2>
            <p>
              Аккаунт нужен только для избранного и отзывов. Без рассылок,
              рекламы и «персональных рекомендаций».
            </p>
          </div>

          <ul className="auth-list">
            <li>Избранные дистрибутивы в одном списке</li>
            <li>Личная оценка и отзыв для каждой системы</li>
            <li>Быстрый доступ к сравнениям и гайдам</li>
          </ul>

          <p className="auth-aside-foot">20 систем · {mode === "login" ? "вход" : "регистрация"}</p>
        </aside>

        <div className="auth-main">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="auth-subtitle">{subtitle}</p>

          <div className="auth-form">{children}</div>

          {footer && <div className="auth-footer">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
