import Link from "next/link";
import NotFound from "@/app/not-found";
import { ArrowLeft, ArrowRight, ChevronDown, ChevronRight } from "lucide-react";
import { GUIDES, GUIDE_CATEGORIES, GUIDE_MAP } from "@/data/guides";
import type { GuideSection } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { CodeBlock } from "@/components/code-block";
import { GuideToc, ReadingProgress } from "../guide-toc";

const CALLOUT_LABELS = {
  info: "К сведению",
  warning: "Важно",
  tip: "Совет",
} as const;

function Callout({ tone, text }: { tone: keyof typeof CALLOUT_LABELS; text: string }) {
  return (
    <aside className={`guide-callout guide-callout-${tone}`}>
      <span>{CALLOUT_LABELS[tone]}</span>
      <p>{text}</p>
    </aside>
  );
}

function Section({ section, index }: { section: GuideSection; index: number }) {
  return (
    <section id={`section-${index + 1}`} className="guide-section">
      <h2>{section.heading}</h2>

      {section.paragraphs?.map((paragraph, paragraphIndex) => (
        <p key={paragraphIndex}>{paragraph}</p>
      ))}

      {section.list && (
        <ul className="guide-list">
          {section.list.map((item, itemIndex) => (
            <li key={itemIndex}>
              <span aria-hidden="true">+</span>
              {item}
            </li>
          ))}
        </ul>
      )}

      {section.steps && (
        <ol className="guide-steps">
          {section.steps.map((step, stepIndex) => (
            <li key={stepIndex}>
              <span>{String(stepIndex + 1).padStart(2, "0")}</span>
              <p>{step}</p>
            </li>
          ))}
        </ol>
      )}

      {section.code && <CodeBlock code={section.code.content} lang={section.code.lang} />}

      {section.callout && <Callout tone={section.callout.tone} text={section.callout.text} />}
    </section>
  );
}

export default function GuidePage({ params }: { params: { slug: string } }) {
  const guide = GUIDE_MAP.get(params.slug);
  if (!guide) return <NotFound />;

  const index = GUIDES.findIndex((item) => item.slug === guide.slug);
  const previous = index > 0 ? GUIDES[index - 1] : null;
  const next = index < GUIDES.length - 1 ? GUIDES[index + 1] : null;

  const toc = guide.sections.map((section, sectionIndex) => ({
    id: `section-${sectionIndex + 1}`,
    label: section.heading,
  }));

  const related = GUIDES.filter((item) => item.slug !== guide.slug)
    .sort((a, b) => {
      const aSame = a.category === guide.category ? 1 : 0;
      const bSame = b.category === guide.category ? 1 : 0;
      return bSame - aSame;
    })
    .slice(0, 2);

  return (
    <div className="container-page page-shell">
      <ReadingProgress />

      <nav aria-label="Хлебные крошки" className="crumbs">
        <Link href="/">Главная</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/guides">Гайды</Link>
        <ChevronRight className="h-3 w-3" />
        <span>{GUIDE_CATEGORIES[guide.category]}</span>
      </nav>

      <header className="guide-head">
        <div>
          <p className="eyebrow">
            {GUIDE_CATEGORIES[guide.category]} / {guide.readingTime} мин
          </p>
          <h1>{guide.title}</h1>
          <p className="lede">{guide.description}</p>
        </div>
        <dl className="guide-head-meta">
          <div>
            <dt>Автор</dt>
            <dd>Команда DistroHub</dd>
          </div>
          <div>
            <dt>Обновлено</dt>
            <dd>{formatDate(guide.updated)}</dd>
          </div>
          <div>
            <dt>Разделов</dt>
            <dd>{guide.sections.length}</dd>
          </div>
        </dl>
      </header>

      <div className="guide-layout">
        <div>
          <details className="guide-toc-mobile">
            <summary>
              Содержание · {toc.length}
              <ChevronDown className="h-4 w-4" />
            </summary>
            <GuideToc items={toc} />
          </details>

          <article id="guide-article" className="guide-article">
            {guide.sections.map((section, sectionIndex) => (
              <Section key={section.heading} section={section} index={sectionIndex} />
            ))}
          </article>

          <div className="guide-cta">
            <div>
              <p className="eyebrow">Если система ещё не выбрана</p>
              <h2>Пять вопросов вместо десятка вкладок</h2>
              <p>
                Мастер покажет три дистрибутива под ваше железо и объяснит,
                что в каждом может не подойти.
              </p>
            </div>
            <div className="guide-cta-actions">
              <Link href="/wizard" className="btn btn-primary">
                Подобрать систему <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/distros" className="btn btn-secondary">
                Открыть каталог
              </Link>
            </div>
          </div>

          {(previous || next) && (
            <nav className="guide-prevnext" aria-label="Другие гайды">
              {previous ? (
                <Link href={`/guides/${previous.slug}`}>
                  <span>
                    <ArrowLeft className="h-3 w-3" /> Предыдущий
                  </span>
                  <strong>{previous.title}</strong>
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link href={`/guides/${next.slug}`} className="guide-next">
                  <span>
                    Следующий <ArrowRight className="h-3 w-3" />
                  </span>
                  <strong>{next.title}</strong>
                </Link>
              )}
            </nav>
          )}
        </div>

        <aside className="guide-aside">
          <div className="guide-aside-inner">
            <div className="guide-toc">
              <p className="label">Содержание</p>
              <GuideToc items={toc} />
            </div>

            <div className="guide-related">
              <p className="label">Ещё по теме</p>
              {related.map((item) => (
                <Link key={item.slug} href={`/guides/${item.slug}`}>
                  <span>{GUIDE_CATEGORIES[item.category]}</span>
                  <strong>{item.title}</strong>
                </Link>
              ))}
            </div>

            <div className="guide-aside-note">
              <p>Не знаете, что выбрать?</p>
              <span>Пять вопросов, три варианта, без регистрации.</span>
              <Link href="/wizard" className="link-arrow">
                Подобрать <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
