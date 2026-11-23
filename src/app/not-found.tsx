import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const LINKS = [
  { href: "/distros?p=beginners", label: "Дистрибутивы для новичков" },
  { href: "/guides/zapis-iso-na-fleshku", label: "Запись ISO на флешку" },
  { href: "/compare?d=ubuntu,linux-mint", label: "Ubuntu против Mint" },
  { href: "/guides/dual-boot-windows-linux", label: "Linux рядом с Windows" },
];

export default function NotFound() {
  return (
    <div className="container-page not-found-page">
      <div className="not-found-mark">404</div>
      <div className="not-found-copy">
        <p className="eyebrow">Страница не найдена</p>
        <h1>Здесь ничего нет</h1>
        <p className="lede">
          Ссылка устарела или в адресе опечатка. Каталог и гайды на месте,
          начните с них.
        </p>
        <div className="not-found-actions">
          <Link href="/" className="btn btn-primary">
            На главную <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/distros" className="btn btn-secondary">
            В каталог
          </Link>
        </div>
      </div>

      <div className="not-found-links">
        <p className="label">Часто открывают</p>
        {LINKS.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.label}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        ))}
      </div>
    </div>
  );
}
