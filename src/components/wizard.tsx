"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Code2,
  Copy,
  Flame,
  Gamepad2,
  Home,
  Layers,
  LayoutGrid,
  Monitor,
  Recycle,
  RefreshCw,
  RotateCcw,
  Scale,
  Server,
  Share2,
  ShieldCheck,
  Sparkles,
  Sprout,
  Terminal,
  Wand2,
} from "lucide-react";
import type { Answers, RamBudget } from "@/lib/recommend";
import { answersToQuery, describeAnswers, recommend } from "@/lib/recommend";
import { formatRam, PACKAGE_SHORT, RELEASE_LABELS } from "@/lib/taxonomy";
import type { Distro } from "@/lib/types";
import { DistroLogo } from "./distro-logo";
import { FavoriteButton } from "./favorite-button";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface Question {
  key: keyof Answers;
  title: string;
  hint: string;
  options: Option[];
}

const QUESTIONS: Question[] = [
  {
    key: "experience",
    title: "Какой у вас опыт с Linux?",
    hint: "Без неправильных ответов: от этого зависит сложность системы.",
    options: [
      {
        value: "newbie",
        label: "Только начинаю",
        description: "Раньше не ставил Linux или пробовал совсем немного",
        icon: Sprout,
      },
      {
        value: "some",
        label: "Что-то уже ставил",
        description: "Знаю, что такое терминал, но не каждый день",
        icon: Wand2,
      },
      {
        value: "pro",
        label: "Живу в терминале",
        description: "Собирал ядро, чинил загрузчик, читаю логи без страха",
        icon: Terminal,
      },
    ],
  },
  {
    key: "ram",
    title: "Сколько оперативной памяти?",
    hint: "Покажем системы, которым хватит вашего объёма.",
    options: [
      {
        value: "2",
        label: "2 ГБ или меньше",
        description: "Старый ноутбук или нетбук",
        badge: "2 ГБ",
      },
      { value: "4", label: "4 ГБ", description: "Типичный офисный ПК", badge: "4 ГБ" },
      { value: "8", label: "8 ГБ", description: "Современный домашний компьютер", badge: "8 ГБ" },
      {
        value: "16",
        label: "16 ГБ и больше",
        description: "Игры, виртуалки, тяжёлая разработка",
        badge: "16+",
      },
    ],
  },
  {
    key: "use",
    title: "Для чего в первую очередь?",
    hint: "Можно выбрать только одну задачу: самую важную.",
    options: [
      {
        value: "everyday",
        label: "Работа и учёба",
        description: "Браузер, документы, мессенджеры, видео",
        icon: Home,
      },
      {
        value: "dev",
        label: "Разработка",
        description: "Код, контейнеры, базы данных, терминал",
        icon: Code2,
      },
      {
        value: "server",
        label: "Сервер",
        description: "VPS, домашние сервисы, инфраструктура",
        icon: Server,
      },
      {
        value: "gaming",
        label: "Игры",
        description: "Steam, Proton, драйверы и HDR",
        icon: Gamepad2,
      },
      {
        value: "privacy",
        label: "Приватность",
        description: "Минимум следов и максимум анонимности",
        icon: ShieldCheck,
      },
      {
        value: "revive",
        label: "Оживить старый ПК",
        description: "Компьютер, которому 10+ лет",
        icon: Recycle,
      },
    ],
  },
  {
    key: "updates",
    title: "Как относитесь к обновлениям?",
    hint: "Компромисс между свежестью и стабильностью.",
    options: [
      {
        value: "stable",
        label: "Пореже, но понадёжнее",
        description: "Готов сидеть на версии двухлетней давности",
        icon: ShieldCheck,
      },
      {
        value: "balanced",
        label: "Раз в полгода: нормально",
        description: "Плановые обновления без сюрпризов",
        icon: RefreshCw,
      },
      {
        value: "fresh",
        label: "Хочу самое свежее",
        description: "Готов читать новости и иногда чинить",
        icon: Flame,
      },
    ],
  },
  {
    key: "look",
    title: "Какой интерфейс ближе?",
    hint: "Внешний вид можно поменять, но начинать приятнее с привычного.",
    options: [
      {
        value: "windows",
        label: "Как в Windows",
        description: "Панель задач, меню «Пуск», привычные окна",
        icon: Monitor,
      },
      {
        value: "macos",
        label: "Как в macOS",
        description: "Верхняя панель, док и много воздуха",
        icon: Sparkles,
      },
      {
        value: "minimal",
        label: "Минимализм",
        description: "Ничего лишнего, только нужные окна",
        icon: Layers,
      },
      {
        value: "any",
        label: "Без разницы",
        description: "Главное: чтобы работало",
        icon: LayoutGrid,
      },
    ],
  },
];

const RAM_VALUES: RamBudget[] = [2, 4, 8, 16];

function isComplete(answers: Partial<Answers>): answers is Answers {
  return (
    Boolean(answers.experience) &&
    RAM_VALUES.includes(answers.ram as RamBudget) &&
    Boolean(answers.use) &&
    Boolean(answers.updates) &&
    Boolean(answers.look)
  );
}

function MatchRing({ value }: { value: number; size?: "md" | "lg" }) {
  return (
    <div className="wizard-match" aria-label={`Совпадение ${value}%`}>
      <strong>{value}%</strong>
      <span>совпадение</span>
    </div>
  );
}

function ResultCard({
  distro,
  match,
  reasons,
  rank,
}: {
  distro: Distro;
  match: number;
  reasons: string[];
  rank: number;
}) {
  return (
    <article
      className={cn(
        "surface-card wizard-result",
        rank === 1 && "wizard-result-lead",
      )}
    >
      <div className="relative flex items-start gap-4">
        <DistroLogo src={distro.logo} name={distro.name} size={rank === 1 ? "lg" : "md"} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="wizard-rank">#{rank}</span>
            {rank === 1 && <span className="wizard-best">Лучшее совпадение</span>}
            <FavoriteButton slug={distro.slug} className="-mr-1 ml-auto" />
          </div>
          <h3 className="wizard-result-name">{distro.name}</h3>
          <p className="wizard-result-tagline">{distro.tagline}</p>
        </div>
        <MatchRing value={match} size={rank === 1 ? "lg" : "md"} />
      </div>

      <div className="relative mt-4 flex flex-wrap gap-1.5">
        <span className="chip">{PACKAGE_SHORT[distro.packageManager]}</span>
        <span className="chip">{RELEASE_LABELS[distro.releaseModel]}</span>
        <span className="chip">{formatRam(distro.minRam)} ОЗУ</span>
        <span className="chip">{distro.desktops[0]}</span>
      </div>

      {reasons.length > 0 && (
        <ul className="relative mt-4 space-y-1.5">
          {reasons.map((reason) => (
            <li key={reason} className="flex items-start gap-2 text-[0.8rem] text-muted">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
              {reason}
            </li>
          ))}
        </ul>
      )}

      <div className="relative mt-5 flex flex-wrap gap-2">
        <Link href={`/distros/${distro.slug}`} className="btn btn-primary btn-sm">
          Открыть карточку <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <Link href={`/compare?d=${distro.slug}`} className="btn btn-secondary btn-sm">
          <Scale className="h-3.5 w-3.5" /> Сравнить
        </Link>
      </div>
    </article>
  );
}

export function Wizard({ initial }: { initial: Answers | null }) {
  const [answers, setAnswers] = useState<Partial<Answers>>(initial ?? {});
  const [step, setStep] = useState(0);
  const [showResults, setShowResults] = useState(Boolean(initial));
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);

  const question = QUESTIONS[step];
  const complete = isComplete(answers);
  const results = useMemo(() => (complete ? recommend(answers) : []), [answers, complete]);
  const answeredCount = QUESTIONS.filter((item) => answers[item.key] !== undefined).length;

  useEffect(() => {
    if (showResults && complete) {
      const query = answersToQuery(answers);
      window.history.replaceState(null, "", `/wizard?${query}`);
    }
  }, [showResults, complete, answers]);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  function choose(key: keyof Answers, value: string) {
    const normalized = (key === "ram" ? Number(value) : value) as Answers[keyof Answers];
    const next = { ...answers, [key]: normalized } as Partial<Answers>;
    setAnswers(next);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      if (isComplete(next)) {
        if (step === QUESTIONS.length - 1) {
          setShowResults(true);
        } else {
          setStep(step + 1);
        }
        return;
      }
      const missing = QUESTIONS.findIndex((item) => next[item.key] === undefined);
      setStep(missing >= 0 ? missing : step);
    }, 180);
  }

  function restart() {
    if (timer.current) window.clearTimeout(timer.current);
    setAnswers({});
    setStep(0);
    setShowResults(false);
    setCopied(false);
    window.history.replaceState(null, "", "/wizard");
  }

  function editAnswers() {
    setShowResults(false);
    setStep(0);
  }

  async function share() {
    if (!complete) return;
    const url = `${window.location.origin}/wizard?${answersToQuery(answers)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      window.prompt("Скопируйте ссылку на результат:", url);
    }
  }

  if (showResults && complete) {
    const [first, second, third, ...rest] = results;
    return (
      <div>
        <div className="flex flex-col gap-4 border-b border-line pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              Результат подбора
            </p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Вам подойдут эти системы
            </h2>
            <p className="mt-2 text-sm text-muted">{describeAnswers(answers)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={share} className="btn btn-secondary btn-sm">
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Ссылка скопирована" : "Поделиться"}
            </button>
            <button type="button" onClick={editAnswers} className="btn btn-ghost btn-sm">
              <ArrowLeft className="h-3.5 w-3.5" /> Изменить ответы
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {first && (
            <div className="lg:col-span-2">
              <ResultCard
                distro={first.distro}
                match={first.match}
                reasons={first.reasons}
                rank={1}
              />
            </div>
          )}
          {second && (
            <ResultCard
              distro={second.distro}
              match={second.match}
              reasons={second.reasons}
              rank={2}
            />
          )}
          {third && (
            <ResultCard
              distro={third.distro}
              match={third.match}
              reasons={third.reasons}
              rank={3}
            />
          )}
        </div>

        {rest.length > 0 && (
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              Ещё варианты
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {rest.map((item, index) => (
                <Link
                  key={item.distro.slug}
                  href={`/distros/${item.distro.slug}`}
                  className="surface-card surface-card-hover flex items-center gap-3 p-3.5"
                >
                  <span className="w-5 text-xs font-bold text-muted">#{index + 4}</span>
                  <DistroLogo src={item.distro.logo} name={item.distro.name} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{item.distro.name}</span>
                    <span className="block truncate text-[0.7rem] text-muted">
                      {item.distro.tagline}
                    </span>
                  </span>
                  <span className="text-xs font-semibold text-accent">{item.match}%</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="wizard-restart">
          <p>
            Подбор учитывает задачу, железо, опыт, отношение к обновлениям и стиль интерфейса.
            Это рекомендация, а не приговор: любую систему можно настроить под себя.
          </p>
          <button type="button" onClick={restart} className="btn btn-secondary btn-sm shrink-0">
            <RotateCcw className="h-3.5 w-3.5" /> Пройти заново
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-7 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {QUESTIONS.map((item, index) => {
            const done = answers[item.key] !== undefined;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setStep(index)}
                aria-label={`Вопрос ${index + 1}`}
                aria-current={index === step ? "step" : undefined}
                className={cn(
                  "wizard-step-dot",
                  index === step && "wizard-step-dot-current",
                  done && index !== step && "wizard-step-dot-done",
                )}
              >
                {done && index !== step ? <Check className="h-3.5 w-3.5" /> : index + 1}
              </button>
            );
          })}
        </div>
        <span className="text-xs text-muted">
          Шаг {step + 1} из {QUESTIONS.length}
        </span>
      </div>

      <div className="wizard-progress">
        <div style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }} />
      </div>

      <div key={question.key} className="animate-rise mt-8">
        <h2 className="text-2xl font-extrabold tracking-tight sm:text-[1.8rem]">
          {question.title}
        </h2>
        <p className="mt-1.5 text-sm text-muted">{question.hint}</p>

        <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
          {question.options.map((option) => {
            const selected = String(answers[question.key]) === option.value;
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => choose(question.key, option.value)}
                className={cn(
                  "wizard-option group",
                  selected && "wizard-option-selected",
                )}
                aria-pressed={selected}
              >
                <span
                  className={cn(
                    "wizard-option-icon",
                    selected && "wizard-option-icon-selected",
                  )}
                >
                  {option.badge ? (
                    <span className="font-mono text-[0.68rem]">{option.badge}</span>
                  ) : Icon ? (
                    <Icon className="h-[18px] w-[18px]" />
                  ) : (
                    <Sparkles className="h-[18px] w-[18px]" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[0.9rem] font-semibold">{option.label}</span>
                  <span className="mt-0.5 block text-[0.72rem] leading-relaxed text-muted">
                    {option.description}
                  </span>
                </span>
                <span
                  className={cn(
                    "shrink-0 transition-opacity",
                    selected ? "text-accent" : "text-muted opacity-0 group-hover:opacity-100",
                  )}
                >
                  {selected ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-7 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep((value) => Math.max(0, value - 1))}
          disabled={step === 0}
          className="btn btn-ghost btn-sm"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Назад
        </button>
        <span className="text-[0.7rem] text-muted">
          Отвечено {answeredCount} из {QUESTIONS.length}
        </span>
      </div>

      {complete && !showResults && (
        <div className="mt-6 rounded-xl border border-accent/30 bg-accentSoft p-4">
          <button
            type="button"
            onClick={() => setShowResults(true)}
            className="btn btn-primary btn-sm w-full"
          >
            <Sparkles className="h-3.5 w-3.5" /> Показать рекомендации
          </button>
        </div>
      )}

      <p className="mt-8 flex items-center gap-1.5 text-[0.7rem] text-muted">
        <Share2 className="h-3.5 w-3.5" /> Результат можно сохранить ссылкой, без аккаунта.
      </p>
    </div>
  );
}
