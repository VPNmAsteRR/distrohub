import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { parseAnswers } from "@/lib/recommend";
import { Wizard } from "../wizard";

const STEPS = [
  ["01", "Опыт", "Новичок или уже ставили Linux"],
  ["02", "Железо", "Сколько ОЗУ и насколько старый ПК"],
  ["03", "Задача", "Работа, разработка, сервер, игры"],
  ["04", "Обновления", "Стабильность или свежие пакеты"],
  ["05", "Интерфейс", "Привычный вид рабочего стола"],
];

export default function WizardPage({ params }: { params: URLSearchParams }) {
  const initial = parseAnswers(Object.fromEntries(params.entries()));

  return (
    <div className="container-page page-shell">
      <nav aria-label="Хлебные крошки" className="crumbs">
        <Link href="/">Главная</Link>
        <ChevronRight className="h-3 w-3" />
        <span>Подбор</span>
      </nav>

      <header className="wizard-head">
        <div>
          <p className="eyebrow">Мастер подбора / без регистрации</p>
          <h1>Пять вопросов. Три системы. Одна подходит.</h1>
          <p className="lede">
            Не нужно читать двадцать обзоров. Опишите задачу, железо и опыт.
            Мастер покажет короткий список и объяснит, что в каждом варианте
            может не подойти.
          </p>
        </div>
        <dl className="wizard-head-meta">
          <div>
            <dt>Время</dt>
            <dd>около минуты</dd>
          </div>
          <div>
            <dt>Регистрация</dt>
            <dd>не нужна</dd>
          </div>
          <div>
            <dt>Ответы</dt>
            <dd>не сохраняются</dd>
          </div>
        </dl>
      </header>

      <div className="wizard-layout">
        <div className="wizard-panel">
          <Wizard initial={initial} />
        </div>

        <aside className="wizard-aside">
          <div className="wizard-aside-block">
            <p className="label">Что спросим</p>
            {STEPS.map(([number, title, description]) => (
              <div key={number} className="wizard-aside-row">
                <span>{number}</span>
                <div>
                  <strong>{title}</strong>
                  <p>{description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="wizard-aside-note">
            <p className="label">Конфиденциальность</p>
            <p>
              Подбор считается в браузере. Ответы не отправляются на сервер,
              рассылок нет. Результат можно сохранить ссылкой.
            </p>
          </div>

          <div className="wizard-aside-links">
            <Link href="/guides/kak-vybrat-de">
              Как выбрать рабочее окружение <span>→</span>
            </Link>
            <Link href="/distros?p=beginners">
              Дистрибутивы для новичков <span>→</span>
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
