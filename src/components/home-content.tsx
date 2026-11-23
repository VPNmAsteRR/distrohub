import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Gamepad2,
  Recycle,
  Server,
  Sprout,
} from "lucide-react";
import { DISTROS, getDistro } from "@/data/distros";
import { GUIDES } from "@/data/guides";
import { DesktopPreview } from "@/components/desktop-preview";
import { HeroCopy, HeroStage, SystemsIndex } from "@/components/hero-stage";
import { asset } from "@/lib/assets";
import { formatRating, PACKAGE_SHORT, RELEASE_LABELS } from "@/lib/taxonomy";
import { plural } from "@/lib/utils";

const AUDIENCES = [
  {
    href: "/distros?p=beginners",
    title: "Первый Linux",
    description: "Понятная установка, знакомый интерфейс и минимум терминала.",
    purpose: "beginners" as const,
    icon: Sprout,
  },
  {
    href: "/distros?p=servers",
    title: "Сервер",
    description: "Долгая поддержка, предсказуемые обновления и работа без графики.",
    purpose: "servers" as const,
    icon: Server,
  },
  {
    href: "/distros?p=old-pc",
    title: "Старое железо",
    description: "Лёгкие окружения, которые не требуют новых комплектующих.",
    purpose: "old-pc" as const,
    icon: Recycle,
  },
  {
    href: "/distros?p=gaming",
    title: "Игры",
    description: "Proton, свежие драйверы и готовые игровые сборки.",
    purpose: "gaming" as const,
    icon: Gamepad2,
  },
];

const FEATURED = ["ubuntu", "linux-mint", "fedora-workstation", "arch-linux", "pop-os", "bazzite"];

const STEPS = [
  ["01", "Опыт"],
  ["02", "Железо"],
  ["03", "Задачи"],
  ["04", "Обновления"],
  ["05", "Интерфейс"],
  ["06", "Три варианта"],
];

export function HomeContent({
  ratings = {},
}: {
  ratings?: Record<string, { average: number; count: number }>;
}) {
  const featured = FEATURED.map((slug) => getDistro(slug)).filter(
    (distro): distro is NonNullable<typeof distro> => Boolean(distro),
  );
  const lead = getDistro("ubuntu") ?? DISTROS[0];
  const showcase = featured.filter((item) => item.slug !== lead.slug);
  const ubuntu = lead;
  const mint = getDistro("linux-mint") ?? DISTROS[1];
  const leadRating = ratings[lead.slug];
  const guides = GUIDES.slice(0, 3);

  return (
    <div className="home orbit-home">
      <section className="container-page orbit-hero">
        <div className="orbit-hero-grid">
          <HeroCopy lead={lead} />
          <HeroStage lead={lead} />
        </div>
      </section>

      <SystemsIndex />

      <section className="container-page orbit-section">
        <div className="section-head" data-reveal>
          <div>
            <p className="section-index">01 · задача</p>
            <h2>С чего начать</h2>
          </div>
          <p>
            Не нужно читать всё подряд. Выберите ситуацию, которая ближе к вашей,
            и каталог отфильтруется сам.
          </p>
        </div>

        <div className="aud-list">
          {AUDIENCES.map((item, index) => {
            const Icon = item.icon;
            const count = DISTROS.filter((distro) => distro.purposes.includes(item.purpose)).length;
            return (
              <Link key={item.href} href={item.href} className="aud-row" data-reveal>
                <span className="aud-row-num">0{index + 1}</span>
                <span className="aud-row-icon">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <span className="aud-row-count">
                  {count} {plural(count, ["система", "системы", "систем"])}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="container-page orbit-section">
        <div className="section-head" data-reveal>
          <div>
            <p className="section-index">02 · выбор редакции</p>
            <h2>Шесть систем, с которых стоит начать</h2>
          </div>
          <p>
            Не рейтинг популярности, а короткий список для разных характеров:
            от «поставил и забыл» до «собираю сам».
          </p>
        </div>

        <div className="showcase-grid">
          <Link
            href={`/distros/${lead.slug}`}
            className="showcase-card is-wide tiltable"
            data-tilt
            data-reveal
            style={{ "--reveal-delay": "0ms" } as React.CSSProperties}
          >
            <div className="showcase-media">
              <DesktopPreview distro={lead} compact />
            </div>
            <div className="showcase-body">
              <div className="showcase-head">
                <img src={asset(lead.logo)} alt="" />
                <h3>{lead.name}</h3>
                <span>
                  {leadRating?.count ? `${formatRating(leadRating.average)} / 5` : "выбор новичка"}
                </span>
              </div>
              <p>
                {lead.tagline}. {lead.summary}
              </p>
              <div className="showcase-foot">
                <span className="chip">{PACKAGE_SHORT[lead.packageManager]}</span>
                <span className="chip">{RELEASE_LABELS[lead.releaseModel]}</span>
                <span className="chip">{lead.desktops[0]}</span>
                <span className="showcase-open">открыть</span>
              </div>
            </div>
          </Link>

          {showcase.slice(0, 4).map((distro, index) => (
            <Link
              key={distro.slug}
              href={`/distros/${distro.slug}`}
              className="showcase-card tiltable"
              data-tilt
              data-reveal
              style={{ "--reveal-delay": `${80 + index * 60}ms` } as React.CSSProperties}
            >
              <div className="showcase-media">
                <DesktopPreview distro={distro} compact />
              </div>
              <div className="showcase-body">
                <div className="showcase-head">
                  <img src={asset(distro.logo)} alt="" />
                  <h3>{distro.name}</h3>
                  <span>
                    {ratings[distro.slug]?.count
                      ? `${formatRating(ratings[distro.slug].average)} / 5`
                      : PACKAGE_SHORT[distro.packageManager]}
                  </span>
                </div>
                <p>
                  {distro.tagline}. {distro.bestFor}
                </p>
                <div className="showcase-foot">
                  <span className="chip">{distro.desktops[0]}</span>
                  <span className="chip">{RELEASE_LABELS[distro.releaseModel]}</span>
                  <span className="showcase-open">открыть</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <Link href="/distros" className="link-arrow">
            Все двадцать систем
          </Link>
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-muted">
            данные сверены · ноябрь 2026
          </span>
        </div>
      </section>

      <section className="container-page orbit-section">
        <div className="section-head" data-reveal>
          <div>
            <p className="section-index">03 · сравнение</p>
            <h2>Разница видна в таблице</h2>
          </div>
          <p>
            Одинаковые пакеты не означают одинаковую систему. Сравните требования,
            обновления и окружение до скачивания ISO.
          </p>
        </div>

        <div className="compare-band" data-reveal>
          <div className="compare-copy">
            <span className="eyebrow">Ubuntu против Mint</span>
            <h2 className="mt-2">Две системы, похожие только на первый взгляд</h2>
            <p className="mt-3 text-[0.92rem] leading-relaxed text-muted">
              Обе работают с DEB и выходят из LTS-ветки, но по-разному относятся к Snap,
              ядру и оформлению. В сравнении это видно за десять секунд.
            </p>
            <Link href="/compare?d=ubuntu,linux-mint" className="btn btn-secondary mt-6">
              Открыть сравнение
            </Link>
          </div>

          <div className="compare-table">
            <div className="compare-head">
              <span>Ubuntu</span>
              <span className="vs">VS</span>
              <span>Linux Mint</span>
            </div>
            {[
              ["ОЗУ минимум", "4 ГБ", "2 ГБ"],
              ["Пакеты", "DEB", "DEB"],
              ["Обновления", "LTS", "LTS"],
              ["Окружение", "GNOME", "Cinnamon"],
              ["Snap", "есть", "нет"],
            ].map(([label, left, right]) => (
              <div key={label} className="compare-line">
                <span>{left}</span>
                <span className="compare-key">{label}</span>
                <span>{right}</span>
              </div>
            ))}
            <p className="mt-3 font-mono text-[0.58rem] uppercase tracking-[0.08em] text-muted">
              {ubuntu.version} / {mint.version}
            </p>
          </div>
        </div>
      </section>

      <section className="container-page orbit-section">
        <div className="section-head" data-reveal>
          <div>
            <p className="section-index">04 · мастер подбора</p>
            <h2>Пять вопросов, три варианта</h2>
          </div>
          <p>
            Мастер не ставит диагноз и не продаёт железо. Он объясняет, почему каждая
            система попала в короткий список, и что в ней может не подойти.
          </p>
        </div>

        <div className="wizard-band" data-reveal>
          <div className="wizard-copy">
            <span className="eyebrow">Без регистрации</span>
            <h2 className="mt-2">Сначала условия, потом название</h2>
            <p className="mt-3 text-[0.92rem] leading-relaxed text-muted">
              Опыт, объём памяти, задачи, отношение к обновлениям и желаемый интерфейс.
              На выходе три системы с оценкой совпадения и честным списком ограничений.
            </p>
            <Link href="/wizard" className="btn btn-primary mt-6">
              Пройти мастер <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="wizard-steps">
            {STEPS.map(([number, label], index) => (
              <div
                key={number}
                className={`wizard-step ${index === STEPS.length - 1 ? "result" : ""}`}
              >
                <span>{number}</span>
                <p>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page orbit-section">
        <div className="section-head" data-reveal>
          <div>
            <p className="section-index">05 · библиотека</p>
            <h2>Инструкции без воды</h2>
          </div>
          <p>
            Проверенные шаги для установки, первой настройки и переезда с Windows.
            С командами, которые можно скопировать.
          </p>
        </div>

        <div className="guide-grid">
          {guides.map((guide, index) => (
            <Link
              key={guide.slug}
              href={`/guides/${guide.slug}`}
              className="guide-item"
              data-reveal
              style={{ "--reveal-delay": `${index * 80}ms` } as React.CSSProperties}
            >
              <span className="guide-num">
                0{index + 1} / {guide.category}
              </span>
              <h3>{guide.title}</h3>
              <p>{guide.description}</p>
              <span className="guide-meta">
                {guide.readingTime} мин · обновлено {guide.updated}
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
          <Link href="/guides" className="link-arrow">
            Все гайды <BookOpen className="h-3.5 w-3.5" />
          </Link>
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-muted">
            {GUIDES.length} инструкций · можно копировать команды
          </span>
        </div>
      </section>

      <section className="container-page orbit-section">
        <div className="orbit-cta" data-reveal>
          <div className="orbit-cta-copy">
            <p className="eyebrow">Следующий шаг</p>
            <h2 className="mt-3">Найдите систему, которая не мешает работать</h2>
            <p>
              Двадцать дистрибутивов, живые рабочие столы и установочный гайд
              к каждой кнопке скачивания. Начните с мастера или сразу откройте каталог.
            </p>
            <div className="orbit-cta-actions">
              <Link href="/wizard" className="btn btn-primary">
                Подобрать за минуту <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/compare" className="btn btn-secondary">
                Сравнить две системы
              </Link>
            </div>
          </div>
          <dl className="orbit-cta-spec">
            <div>
              <dt>Каталог</dt>
              <dd>20 систем · 10 сценариев · фильтры по пакетам, окружению и ОЗУ</dd>
            </div>
            <div>
              <dt>Мастер</dt>
              <dd>5 вопросов · 3 варианта · оценка совпадения и список ограничений</dd>
            </div>
            <div>
              <dt>Установка</dt>
              <dd>20 гайдов · образ, хеш, запись носителя, первый запуск</dd>
            </div>
            <div>
              <dt>Офлайн</dt>
              <dd>один файл DistroHub.html · 4,1 МБ · без сервера и интернета</dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
  );
}
