"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, BookOpen, Download, X } from "lucide-react";
import type { Distro } from "@/lib/types";
import { getInstallGuide } from "@/data/install-guides";
import { asset } from "@/lib/assets";
import { cn } from "@/lib/utils";

/**
 * Download trigger plus slide-out install deck. Works in the Next app and in
 * the single-file offline build (no router or server calls).
 */
export function DownloadDeck({
  distro,
  variant = "primary",
  small = false,
  full = false,
  iconOnly = false,
  label = "Скачать ISO",
}: {
  distro: Distro;
  variant?: "primary" | "secondary";
  small?: boolean;
  full?: boolean;
  iconOnly?: boolean;
  label?: string;
}) {
  const guide = getInstallGuide(distro.slug);
  const [open, setOpen] = useState(false);
  const [rendered, setRendered] = useState(false);
  const [mounted, setMounted] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const steps = guide?.steps.slice(0, 4) ?? [];

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setRendered(true);
          setOpen(true);
        }}
        className={cn(
          "btn dl-trigger",
          variant === "primary" ? "btn-primary" : "btn-secondary",
          small && "btn-sm",
          full && "w-full",
          iconOnly && "dl-icon-btn",
        )}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={iconOnly ? `Скачать ${distro.name} и открыть гайд` : undefined}
        title={iconOnly ? "Скачать и открыть гайд" : undefined}
      >
        <Download className={small || iconOnly ? "h-3.5 w-3.5" : "h-4 w-4"} />
        {!iconOnly && label}
      </button>

      {rendered && mounted &&
        createPortal(
        <>
      <div
        className={cn("dl-backdrop", open && "is-open")}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={cn("dl-panel", open && "is-open")}
        role="dialog"
        aria-modal="true"
        aria-label={`Как установить ${distro.name}`}
        aria-hidden={!open}
      >
        <div className="dl-head">
          <div className="dl-head-top">
            <span className="dl-logo">
              <img src={asset(distro.logo)} alt="" />
            </span>
            <div className="min-w-0">
              <h2>{distro.name}</h2>
              <p>{distro.version} · гайд по установке</p>
            </div>
            <button
              ref={closeRef}
              type="button"
              className="dl-close"
              onClick={() => setOpen(false)}
              aria-label="Закрыть гайд"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <dl className="dl-meta">
            <div>
              <dt>Образ</dt>
              <dd>{guide?.iso ?? `${distro.slug}.iso`}</dd>
            </div>
            <div>
              <dt>Размер</dt>
              <dd>{guide?.size ?? distro.isoSize}</dd>
            </div>
            <div>
              <dt>Время</dt>
              <dd>{guide?.time.split(",")[0] ?? "около 20 минут"}</dd>
            </div>
          </dl>
        </div>

        <div className="dl-body">
          <div>
            <p className="dl-section-label">Порядок действий</p>
            <div className="dl-steps">
              {steps.map((step) => (
                <div key={step.title} className="dl-step">
                  <div>
                    <h4>{step.title}</h4>
                    <p>{step.text}</p>
                    {step.code && <code>{step.code}</code>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {guide && (
            <div className="dl-note">
              <strong>Важно.</strong> {guide.trap}
            </div>
          )}

          <div className="grid gap-1.5 border-t border-line pt-3 font-mono text-[0.6rem] uppercase tracking-[0.08em] text-muted">
            <span>Загрузка: {guide?.bootKey ?? "F12 при старте"}</span>
            <span>Запись: {guide?.writer ?? "Ventoy или Rufus"}</span>
            <span>Проверка: {guide?.checksum ?? "sha256sum"}</span>
          </div>
        </div>

        <div className="dl-foot">
          <Link href={`/install/${distro.slug}`} className="btn btn-primary" onClick={() => setOpen(false)}>
            <BookOpen className="h-4 w-4" /> Открыть полный гайд
          </Link>
          <div className="dl-foot-links">
            <a href={distro.downloadUrl} target="_blank" rel="noopener noreferrer">
              Сайт проекта <ArrowUpRight className="h-3 w-3" />
            </a>
            <Link href={`/distros/${distro.slug}`} onClick={() => setOpen(false)}>
              Карточка системы
            </Link>
          </div>
          <p className="dl-hint">Esc закрывает панель</p>
        </div>
      </aside>
        </>,
          document.body,
        )}
    </>
  );
}
