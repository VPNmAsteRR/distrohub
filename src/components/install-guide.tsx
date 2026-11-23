import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Check, ChevronRight, Clock, Download, HardDrive } from "lucide-react";
import type { Distro } from "@/lib/types";
import type { InstallGuide } from "@/data/install-guides";
import { asset } from "@/lib/assets";

export function InstallGuideView({ distro, guide }: { distro: Distro; guide: InstallGuide }) {
  return (
    <div>
      <header className="install-hero">
        <div className="container-page">
          <nav aria-label="Хлебные крошки" className="crumbs">
            <Link href="/">Главная</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/guides">Гайды</Link>
            <ChevronRight className="h-3 w-3" />
            <span>Установка {distro.name}</span>
          </nav>

          <div className="install-hero-inner mt-7">
            <div>
              <p className="eyebrow">Гайд по установке · {distro.name}</p>
              <h1>{guide.label}</h1>
              <p className="lede mt-3 max-w-[54ch]">
                Пошаговая установка с проверкой образа, записью носителя и первым запуском.
                Шаги проверены на официальном образе, команды можно копировать.
              </p>
              <div className="install-meta mt-5">
                <span className="chip border-accent/40 text-accent">{guide.size}</span>
                <span className="chip">{guide.time}</span>
                <a href={distro.downloadUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                  <Download className="h-3.5 w-3.5" /> Скачать с сайта проекта
                  <ArrowUpRight className="h-3 w-3 opacity-70" />
                </a>
              </div>
            </div>
            <div className="hidden justify-self-end sm:block">
              <span className="grid h-20 w-20 place-items-center rounded-2xl border border-line bg-surface p-4">
                <img src={asset(distro.logo)} alt="" className="h-full w-full object-contain" />
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="container-page install-layout">
        <article className="min-w-0">
          <div className="mb-7 flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-line pb-5 font-mono text-[0.62rem] uppercase tracking-[0.08em] text-muted">
            <span className="inline-flex items-center gap-1.5">
              <HardDrive className="h-3.5 w-3.5 text-accent" /> {guide.iso}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-accent" /> {guide.time}
            </span>
            <span>Загрузка: {guide.bootKey}</span>
          </div>

          <div className="install-steps">
            {guide.steps.map((step) => (
              <div key={step.title} className="install-step">
                <div>
                  <h3>{step.title}</h3>
                  <p className="mt-2">{step.text}</p>
                  {step.code && <pre>{step.code}</pre>}
                </div>
              </div>
            ))}
          </div>

          <div className="install-trap mt-8">
            <strong>Главная ошибка</strong>
            {guide.trap}
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            <Link href={`/distros/${distro.slug}`} className="btn btn-secondary">
              <ArrowLeft className="h-4 w-4" /> Карточка {distro.name}
            </Link>
            <Link href={`/guides/${guide.related}`} className="btn btn-secondary">
              Смежный гайд
            </Link>
            <Link href="/guides" className="btn btn-ghost">
              Все инструкции
            </Link>
          </div>
        </article>

        <aside className="install-aside">
          <div className="install-panel">
            <h3>Перед началом</h3>
            <ul>
              <li>Флешка от 8 ГБ, содержимое будет стёрто</li>
              <li>Резервная копия важных файлов</li>
              <li>Заряд ноутбука выше 50 процентов</li>
              <li>Стабильный интернет для загрузки ISO</li>
            </ul>
          </div>

          <div className="install-panel">
            <h3>После установки</h3>
            <ul>
              {guide.after.map((item) => (
                <li key={item} className="flex gap-2">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="install-panel">
            <h3>Параметры</h3>
            <dl className="mt-3 grid gap-2 text-sm">
              {[
                ["Запись", guide.writer],
                ["Загрузка", guide.bootKey],
                ["Проверка", guide.checksum.split(" ")[0]],
                ["Размер", guide.size],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-3 border-b border-line pb-2 last:border-0 last:pb-0">
                  <dt className="text-muted">{label}</dt>
                  <dd className="text-right font-medium text-ink-soft">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="install-panel">
            <h3>Официальный источник</h3>
            <a
              href={distro.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
            >
              Страница загрузки <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
