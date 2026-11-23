import Link from "next/link";
import { Logo } from "./logo";

const CATALOG_LINKS = [
  { href: "/distros?p=beginners", label: "Для новичков" },
  { href: "/distros?p=servers", label: "Для серверов" },
  { href: "/distros?p=lightweight", label: "Лёгкие системы" },
  { href: "/distros?p=gaming", label: "Для игр" },
];

const TOOLS_LINKS = [
  { href: "/wizard", label: "Мастер подбора" },
  { href: "/compare", label: "Сравнение" },
  { href: "/guides", label: "Гайды" },
  { href: "/about", label: "О проекте" },
];

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container-page">
        <div className="site-footer-grid">
          <div>
            <Logo />
            <p className="footer-note mt-4">
              Независимый справочник по дистрибутивам Linux. Помогает выбрать систему
              под задачи и железо, без форумного шума и советов десятилетней давности.
            </p>
            <div className="footer-tags">
              <span className="chip">20 систем</span>
              <span className="chip">обновлено 30.10.2026</span>
            </div>
          </div>

          <nav aria-label="Каталог">
            <h3>Каталог</h3>
            <ul>
              {CATALOG_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Инструменты">
            <h3>Инструменты</h3>
            <ul>
              {TOOLS_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3>Проект</h3>
            <ul>
              <li>Учебный проект, 2026</li>
              <li>Next.js, SQLite, React</li>
              <li>Лицензия MIT</li>
              <li>
                <a href="mailto:hello@distrohub.ru">hello@distrohub.ru</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="site-footer-bottom">
          <p>© 2026 DistroHub. Не связан с разработчиками дистрибутивов.</p>
          <p>Собрано вручную · без партнёрских ссылок</p>
        </div>
      </div>
    </footer>
  );
}
