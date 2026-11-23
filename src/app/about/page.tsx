import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { DISTROS } from "@/data/distros";
import { GUIDES } from "@/data/guides";

export const metadata: Metadata = {
  title: "О проекте",
  description:
    "DistroHub: независимый справочник по дистрибутивам Linux. Зачем он нужен, как проверяются данные и кто над ним работает.",
};

const TEAM = [
  {
    name: "Серяпин Егор",
    role: "Идея и содержание",
    text: "Требования, структура каталога, тексты карточек и сценарий защиты.",
  },
  {
    name: "Юрий Ушаков",
    role: "Разработка",
    text: "Next.js, API, база данных и логика подбора.",
  },
  {
    name: "Сатымов Самир",
    role: "Дизайн",
    text: "Визуальная система, тёмная тема и макеты интерфейсов.",
  },
  {
    name: "Андреев Никита",
    role: "Тестирование",
    text: "Сценарии, адаптивность, доступность и проверка релиза.",
  },
];

const PRINCIPLES = [
  {
    title: "Без религии",
    text: "Нет правильных и неправильных дистрибутивов. Есть задачи, железо и компромиссы, которые мы показываем в карточке.",
  },
  {
    title: "Железо раньше скриншотов",
    text: "Минимум и рекомендуемый объём ОЗУ, место на диске и архитектуры важнее красивой обложки.",
  },
  {
    title: "Данные со ссылкой",
    text: "Версии и сроки поддержки сверяются с официальными сайтами и endoflife.date. Устаревшие данные обновляются.",
  },
];

const CHECKS = [
  "Версия и дата релиза на официальной странице загрузки",
  "Срок поддержки в release notes или endoflife.date",
  "Требования к железу из документации проекта",
  "Ссылка на ISO ведёт только на официальный сайт",
  "Превью помечено как интерфейс, а не фотография системы",
];

export default function AboutPage() {
  return (
    <div className="container-page page-shell">
      <nav aria-label="Хлебные крошки" className="crumbs">
        <Link href="/">Главная</Link>
        <ChevronRight className="h-3 w-3" />
        <span>О проекте</span>
      </nav>

      <header className="about-hero">
        <div>
          <p className="eyebrow">О проекте</p>
          <h1>Справочник, собранный вручную</h1>
          <p className="lede">
            DistroHub помогает выбрать дистрибутив Linux по задаче и железу.
            Двадцать систем, честные требования и путь от выбора до загрузочной флешки
            без рекламных обзоров.
          </p>
        </div>
        <div className="about-actions">
          <Link href="/distros" className="btn btn-primary">
            Открыть каталог
          </Link>
          <Link href="/wizard" className="link-arrow">
            Подобрать систему
          </Link>
        </div>
      </header>

      <dl className="about-facts">
        <div>
          <dt>{DISTROS.length}</dt>
          <dd>дистрибутивов</dd>
        </div>
        <div>
          <dt>{GUIDES.length}</dt>
          <dd>гайдов</dd>
        </div>
        <div>
          <dt>11</dt>
          <dd>критериев выбора</dd>
        </div>
        <div>
          <dt>0</dt>
          <dd>баннеров и рекламы</dd>
        </div>
      </dl>

      <section className="about-section">
        <div className="about-section-head">
          <p className="section-index">01 / зачем</p>
          <h2>Почему обычные подборки не работают</h2>
        </div>
        <div className="about-columns">
          <p>
            Список «топ-10 дистрибутивов» почти всегда собран из чужих обзоров. В нём
            смешаны серверные системы, игровые сборки и проекты, которые не обновлялись
            два года. Новичок выбирает по скриншоту, ставит систему и обнаруживает, что
            для его Wi-Fi нет драйвера.
          </p>
          <p>
            Мы начали с другого конца: описали задачи и железо, а затем проверили, какая
            система действительно подходит. Каждая карточка содержит ограничения, а
            мастер подбора объясняет, почему вариант оказался в списке.
          </p>
        </div>
      </section>

      <section className="about-section">
        <div className="about-section-head">
          <p className="section-index">02 / принципы</p>
          <h2>Три правила каталога</h2>
        </div>
        <div className="about-principles">
          {PRINCIPLES.map((item, index) => (
            <article key={item.title} className="about-principle">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-section about-checks">
        <div>
          <p className="section-index">03 / проверка</p>
          <h2>Что сверяем перед публикацией</h2>
          <p className="about-note">
            Каталог учебный, но данные в нём настоящие. Если ссылка или версия устарели,
            это ошибка, а не «пример».
          </p>
        </div>
        <ul>
          {CHECKS.map((item) => (
            <li key={item}>
              <span aria-hidden="true">+</span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="about-section">
        <div className="about-section-head">
          <p className="section-index">04 / команда</p>
          <h2>Кто делал проект</h2>
        </div>
        <div className="about-team">
          {TEAM.map((person) => (
            <article key={person.name} className="about-person">
              <div>
                <h3>{person.name}</h3>
                <p className="about-role">{person.role}</p>
              </div>
              <p>{person.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-contact">
        <div>
          <p className="eyebrow">Связь</p>
          <h2>Нашли ошибку или устаревшую ссылку?</h2>
          <p>
            Напишите на <a href="mailto:hello@distrohub.ru">hello@distrohub.ru</a>.
            Укажите дистрибутив и что именно проверить.
          </p>
        </div>
        <Link href="/guides" className="btn btn-secondary">
          Сначала к гайдам
        </Link>
      </section>
    </div>
  );
}
