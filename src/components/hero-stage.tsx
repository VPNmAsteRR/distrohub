import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { DISTROS, getDistro } from "@/data/distros";
import type { Distro } from "@/lib/types";
import { DesktopPreview } from "@/components/desktop-preview";
import { asset } from "@/lib/assets";

const CHIPS = ["linux-mint", "fedora-workstation", "arch-linux", "bazzite"];

export function HeroStage({ lead }: { lead: Distro }) {
  const chips = CHIPS.map((slug) => getDistro(slug)).filter(
    (item): item is Distro => Boolean(item),
  );

  return (
    <div className="orbit-stage" data-stage data-tilt aria-hidden="true">
      <div className="stage-halo" />
      <div className="stage-orbit" />
      <div className="stage-orbit stage-orbit-b" />
      <div className="stage-orbit stage-orbit-c" />

      <span className="stage-tag">live desktop</span>

      {chips[0] && (
        <span className="stage-chip stage-chip-a">
          <img src={asset(chips[0].logo)} alt="" />
          Mint · Cinnamon
        </span>
      )}
      {chips[1] && (
        <span className="stage-chip stage-chip-b">
          <img src={asset(chips[1].logo)} alt="" />
          Fedora · GNOME
        </span>
      )}
      {chips[2] && (
        <span className="stage-chip stage-chip-c">
          <img src={asset(chips[2].logo)} alt="" />
          Arch · rolling
        </span>
      )}
      {chips[3] && (
        <span className="stage-chip stage-chip-d">
          <img src={asset(chips[3].logo)} alt="" />
          Bazzite · gaming
        </span>
      )}

      <div className="stage-core">
        <div className="stage-screen">
          <DesktopPreview distro={lead} interactive={false} />
        </div>
        <div className="stage-stand" />
        <div className="stage-base" />
      </div>
    </div>
  );
}

export function HeroCopy({ lead }: { lead: Distro }) {
  return (
    <div className="orbit-copy">
      <p className="orbit-kicker">
        <span className="orbit-dot" />
        DistroHub · 20 систем · выпуск 2026
      </p>
      <h1 className="orbit-title">
        <span>Linux,</span>
        <span className="is-accent">собранный</span>
        <span className="is-qualifier">под вас.</span>
      </h1>
      <p className="lede">
        Каталог из двадцати систем с рабочими столами, которые можно потрогать.
        Пять вопросов вместо вечера на форумах, честные минусы и гайд по установке
        у каждой кнопки скачивания.
      </p>
      <div className="hero-actions">
        <Link href="/wizard" className="btn btn-primary">
          Подобрать систему <ArrowRight className="h-4 w-4" />
        </Link>
        <Link href="/distros" className="link-arrow">
          Открыть каталог <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <dl className="orbit-stats">
        <div>
          <dt data-count="20">20</dt>
          <dd>систем в каталоге</dd>
        </div>
        <div>
          <dt data-count="5">5</dt>
          <dd>вопросов мастера</dd>
        </div>
        <div>
          <dt data-count="3">3</dt>
          <dd>варианта на выходе</dd>
        </div>
      </dl>
    </div>
  );
}

export function SystemsIndex() {
  return (
    <nav className="systems-index" aria-label="Все системы в каталоге">
      <ol>
        {DISTROS.map((distro, index) => (
          <li key={distro.slug}>
            <Link href={`/distros/${distro.slug}`}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {distro.name}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
