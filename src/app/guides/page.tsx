import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { GUIDES, GUIDE_CATEGORIES } from "@/data/guides";
import type { Guide } from "@/lib/types";

export const metadata: Metadata = {
  title: "Гайды по Linux",
  description:
    "Пошаговые руководства: записать ISO на флешку, поставить Linux рядом с Windows, настроить систему и разобраться с железом.",
};

const ORDER: Guide["category"][] = ["install", "basics", "desktop", "hardware"];

const CODE = `$ sha256sum ubuntu-26.04-desktop-amd64.iso
$ lsblk -o NAME,SIZE,MODEL,TRAN
$ sudo dd if=ubuntu-26.04-desktop-amd64.iso \\
    of=/dev/sdX bs=4M status=progress oflag=sync
$ sync`;

export default function GuidesPage() {
  const featured = GUIDES[0];
  const rest = GUIDES.slice(1);

  return (
    <div className="container-page page-shell">
      <nav aria-label="Хлебные крошки" className="crumbs">
        <Link href="/">Главная</Link>
        <ChevronRight className="h-3 w-3" />
        <span>Гайды</span>
      </nav>

      <header className="guides-hero">
        <div>
          <p className="eyebrow">05 / библиотека</p>
          <h1>Гайды для первого запуска</h1>
          <p className="lede">
            Короткие инструкции без «погугли»: проверить образ, записать флешку,
            поставить систему рядом с Windows и не потерять данные.
          </p>
        </div>
        <dl className="guides-facts">
          <div>
            <dt>{GUIDES.length}</dt>
            <dd>инструкций</dd>
          </div>
          <div>
            <dt>{ORDER.length}</dt>
            <dd>раздела</dd>
          </div>
          <div>
            <dt>0</dt>
            <dd>воды</dd>
          </div>
        </dl>
      </header>

      <section className="guides-lead">
        <Link href={`/guides/${featured.slug}`} className="guides-lead-main">
          <span className="eyebrow">{GUIDE_CATEGORIES[featured.category]} / с чего начать</span>
          <h2>{featured.title}</h2>
          <p>{featured.description}</p>
          <span className="guides-meta">
            {featured.readingTime} мин чтения · обновлено {featured.updated}
          </span>
          <span className="link-arrow">
            Открыть инструкцию
          </span>
        </Link>
        <div className="guides-code">
          <div className="guides-code-head">
            <span>проверка и запись образа</span>
            <span>bash</span>
          </div>
          <pre>{CODE}</pre>
          <p>
            Перед записью проверьте, что <code>/dev/sdX</code> это именно флешка,
            а не системный диск. Ошибка в одной букве стирает данные.
          </p>
        </div>
      </section>

      <section className="guides-catalog">
        <aside className="guides-aside">
          <p className="label">Разделы</p>
          {ORDER.map((category) => (
            <div key={category} className="guides-aside-row">
              <span>{GUIDE_CATEGORIES[category]}</span>
              <span>{GUIDES.filter((guide) => guide.category === category).length}</span>
            </div>
          ))}
          <p className="guides-aside-note">
            Все команды проверены на Ubuntu 26.04 и Fedora 44. Для других систем
            названия пакетов могут отличаться.
          </p>
        </aside>

        <div className="guides-list">
          {rest.map((guide, index) => (
            <Link key={guide.slug} href={`/guides/${guide.slug}`} className="guides-row">
              <span className="guides-row-index">{String(index + 2).padStart(2, "0")}</span>
              <div>
                <span className="guides-row-cat">{GUIDE_CATEGORIES[guide.category]}</span>
                <h3>{guide.title}</h3>
                <p>{guide.description}</p>
              </div>
              <span className="guides-row-meta">{guide.readingTime} мин</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
