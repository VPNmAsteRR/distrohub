"use client";

import { useState } from "react";
import { Battery, ChevronDown, Volume2, Wifi } from "lucide-react";
import type { Distro } from "@/lib/types";
import { accentIcon, appIcon, getSkin, type DesktopSkin, type PreviewApp } from "@/data/skins";
import { asset } from "@/lib/assets";
import { cn } from "@/lib/utils";
import { LivePreview } from "./live-preview";

const APP_TITLES: Record<PreviewApp, string> = {
  terminal: "Терминал",
  files: "Файлы",
  settings: "Параметры",
  store: "Центр приложений",
  browser: "Firefox",
  about: "О системе",
};

function Clock({ short = false }: { short?: boolean }) {
  return <span className="pv-clock">{short ? "21:40" : "21:40 · пт"}</span>;
}

function Tray({ compact = false }: { compact?: boolean }) {
  return (
    <span className="pv-tray">
      <Wifi className="h-2.5 w-2.5" />
      {!compact && <Volume2 className="h-2.5 w-2.5" />}
      <Battery className="h-3 w-3" />
      {!compact && <ChevronDown className="h-2.5 w-2.5" />}
    </span>
  );
}

function Panel({ skin, logo, compact = false }: { skin: DesktopSkin; logo: string; compact?: boolean }) {
  if (skin.panel.position === "none") return null;
  const top = skin.panel.position === "top";
  const isGnome = ["ubuntu", "gnome", "cosmic"].includes(skin.shell);
  const isPlasma = skin.shell === "plasma";

  if (isGnome) {
    return (
      <div className={cn("pv-panel", top ? "pv-panel-top" : "pv-panel-bottom", "pv-panel-gnome")}>
        <span className="pv-panel-side">
          <span className="pv-activities">
            {skin.shell === "ubuntu" ? "Ubuntu" : skin.shell === "cosmic" ? "COSMIC" : "Деятельность"}
          </span>
          {!compact && <span className="pv-workspaces"><i /><i /><i /></span>}
        </span>
        {skin.panel.clock === "center" && <Clock short={compact} />}
        <span className="pv-panel-side pv-panel-right">
          {skin.slug === "tails" && <span className="pv-tor">Tor</span>}
          {!compact && <span className="pv-input-method">ru</span>}
          <Tray compact={compact} />
        </span>
      </div>
    );
  }

  return (
    <div className={cn("pv-panel", top ? "pv-panel-top" : "pv-panel-bottom", `pv-panel-${skin.shell}`)}>
      <span className="pv-launcher">
        <img src={asset(logo)} alt="" />
        <span>{skin.launcher}</span>
      </span>
      {!compact && (
        <span className="pv-tasks">
          {["Файлы", "Терминал"].map((title) => (
            <span key={title} className="pv-task">{title}</span>
          ))}
        </span>
      )}
      <span className="pv-panel-fill" />
      {isPlasma && !compact && <span className="pv-pager"><i /><i /></span>}
      {skin.panel.clock === "right" && <Clock short={compact} />}
      <Tray compact={compact} />
      {!compact && <span className="pv-show-desktop" />}
    </div>
  );
}

function Dock({ skin, compact = false }: { skin: DesktopSkin; compact?: boolean }) {
  if (!skin.dock) return null;
  return (
    <div
      className={cn(
        "pv-dock",
        skin.dock.position === "left" ? "pv-dock-left" : "pv-dock-bottom",
        compact && "pv-dock-compact",
      )}
    >
      {skin.dock.apps.map((app) => (
        <span key={app} className="pv-dock-item" title={APP_TITLES[app]}>
          <img src={asset(appIcon(skin, app))} alt="" />
          {!compact && <i className={app === "browser" || app === "terminal" ? "pv-running" : ""} />}
        </span>
      ))}
    </div>
  );
}

function MiniWindow({ distro, skin }: { distro: Distro; skin: DesktopSkin }) {
  const title = APP_TITLES[distro.preview.window] ?? "Файлы";
  const icon = appIcon(skin, distro.preview.window);
  const body = distro.preview.window;

  return (
    <div className={cn("pv-window", `pv-window-${skin.controls}`)}>
      <div className="pv-titlebar">
        {skin.controls !== "gnome" && <img src={asset(icon)} alt="" className="pv-titlebar-icon" />}
        <span className="pv-titlebar-title">{title}</span>
        <span className="pv-controls">
          {skin.controls === "mac" ? (
            <>
              <i className="pv-dot pv-dot-red" />
              <i className="pv-dot pv-dot-yellow" />
              <i className="pv-dot pv-dot-green" />
            </>
          ) : skin.controls === "gnome" ? (
            <i className="pv-btn pv-btn-close" />
          ) : (
            <>
              <i className="pv-btn pv-btn-min" />
              <i className="pv-btn pv-btn-max" />
              <i className="pv-btn pv-btn-close" />
            </>
          )}
        </span>
      </div>
      <div className="pv-window-body">
        {body === "terminal" && (
          <div className="pv-term">
            <p><span className="pv-term-user">{skin.terminal.user}@{skin.terminal.host}</span><span className="pv-term-path">:{skin.terminal.cwd}</span><span className="pv-term-sym">$</span> neofetch</p>
            <p className="pv-term-logo"><img src={asset(distro.logo)} alt="" /></p>
            <p><span className="pv-term-key">OS</span> {distro.name} {distro.version}</p>
            <p><span className="pv-term-key">DE</span> {skin.label}</p>
            <p><span className="pv-term-key">Shell</span> bash 5.2.37</p>
            <p><span className="pv-term-user">{skin.terminal.user}@{skin.terminal.host}</span><span className="pv-term-path">:{skin.terminal.cwd}</span><span className="pv-term-sym">$</span> <i className="pv-caret" /></p>
          </div>
        )}
        {body === "files" && (
          <div className="pv-files">
            <aside>
              <span className="pv-side-active">Недавние</span>
              <span>Домашняя папка</span>
              <span>Документы</span>
              <span>Загрузки</span>
            </aside>
            <div className="pv-files-main">
              <div className="pv-files-toolbar"><span>Домашняя папка</span><span className="pv-files-count">6 объектов</span></div>
              <div className="pv-files-grid">
                {["Документы", "Загрузки", "Проекты", "Фото", "Музыка", "Видео"].map((name) => (
                  <span key={name} className="pv-file">
                    <img src={asset("/icons/papirus/folder.svg")} alt="" />
                    <span>{name}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
        {body === "settings" && (
          <div className="pv-settings">
            <aside>
              <span className="pv-side-active">Оформление</span>
              <span>Сеть</span>
              <span>Экран</span>
              <span>Питание</span>
            </aside>
            <div className="pv-settings-main">
              <h4>Оформление</h4>
              <p>Обои, акцент и расположение панелей.</p>
              <div className="pv-settings-row"><span>Тёмная тема</span><i className="pv-switch pv-switch-on" /></div>
              <div className="pv-settings-row"><span>Акцентный цвет</span><i className="pv-swatch" style={{ background: distro.accent }} /></div>
              <div className="pv-settings-row"><span>Масштаб</span><span className="pv-value">100%</span></div>
            </div>
          </div>
        )}
        {body === "store" && (
          <div className="pv-store">
            <div className="pv-store-head"><span>Центр приложений</span><span className="pv-store-search">Поиск</span></div>
            <div className="pv-store-grid">
              {[
                ["firefox", "Firefox"],
                ["code", "Code"],
                ["steam", "Steam"],
                ["vlc", "VLC"],
                ["gimp", "GIMP"],
                ["writer", "LibreOffice"],
              ].map(([icon, name]) => (
                <span key={name} className="pv-store-app">
                  <img src={asset(`/icons/apps/${icon}.svg`)} alt="" />
                  <span>{name}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TtyPreview({ distro, skin }: { distro: Distro; skin: DesktopSkin }) {
  return (
    <div className="pv-tty-screen">
      <p className="pv-tty-dim">{distro.name} {distro.version} · tty1</p>
      <p className="pv-tty-dim">Linux {skin.slug === "alpine-linux" ? "6.12.0-alpine" : "6.14.0"} (tty1)</p>
      <p>&nbsp;</p>
      <p className="pv-tty-host">{skin.terminal.host} login: <span>{skin.terminal.user}</span></p>
      <p>Password: <span className="pv-tty-hidden">••••••••</span></p>
      <p className="pv-tty-dim">Last login: Fri Nov 20 21:38:12 on tty1</p>
      <p>&nbsp;</p>
      <p><span className="pv-tty-user">{skin.terminal.user}@{skin.terminal.host}</span>:~$ uname -a</p>
      <p>Linux {skin.terminal.host} 6.14.0 #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux</p>
      <p><span className="pv-tty-user">{skin.terminal.user}@{skin.terminal.host}</span>:~$ <i className="pv-caret" /></p>
    </div>
  );
}

export function DesktopPreview({
  distro,
  className,
  compact = false,
  interactive = true,
}: {
  distro: Distro;
  className?: string;
  compact?: boolean;
  interactive?: boolean;
}) {
  const skin = getSkin(distro.slug);
  const [live, setLive] = useState(false);
  const tty = skin.shell === "tty";
  const canOpen = interactive;
  const iconSide = skin.dock?.position === "left" ? "right" : "left";

  return (
    <>
      <div
        className={cn("pv", `pv-${skin.shell}`, className)}
        data-compact={compact ? "true" : undefined}
        data-tone={skin.wallpaperTone}
        data-interactive={canOpen && !compact ? "true" : undefined}
        onClick={
          canOpen && !compact
            ? (event) => {
                event.preventDefault();
                event.stopPropagation();
                setLive(true);
              }
            : undefined
        }
        role={canOpen ? "button" : "img"}
        tabIndex={canOpen && !compact ? 0 : undefined}
        onKeyDown={
          canOpen && !compact
            ? (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setLive(true);
                }
              }
            : undefined
        }
        aria-label={`Рабочий стол ${distro.name}: ${skin.label}`}
        style={
          {
            "--pv-accent": distro.accent,
            "--pv-panel": skin.panel.background,
            "--pv-panel-fg": skin.panel.foreground,
            "--pv-font": skin.font,
          } as React.CSSProperties
        }
      >
        {skin.wallpaper ? (
          <img className="pv-wall" src={asset(skin.wallpaper)} alt="" draggable={false} />
        ) : (
          <div className="pv-wall pv-wall-tty" />
        )}
        <div className="pv-shade" />

        {!tty && (
          <>
            <div className={cn("pv-icons", `pv-icons-${iconSide}`)}>
              {skin.desktopIcons.slice(0, compact ? 2 : 3).map((item) => {
                const icon =
                  item.icon ??
                  (item.app === "trash"
                    ? accentIcon(skin, "trash")
                    : item.app === "computer"
                      ? "/icons/apps/computer.svg"
                      : appIcon(skin, item.app as PreviewApp));
                return (
                  <span key={item.label} className="pv-desktop-icon">
                    <img src={asset(icon)} alt="" />
                    <span>{item.label}</span>
                  </span>
                );
              })}
            </div>

            <MiniWindow distro={distro} skin={skin} />
            <Dock skin={skin} compact={compact} />
            <Panel skin={skin} logo={distro.logo} compact={compact} />
          </>
        )}

        {tty && <TtyPreview distro={distro} skin={skin} />}

        {canOpen && (
          <button
            type="button"
            className="pv-open"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setLive(true);
            }}
            aria-label={`Открыть рабочий стол ${distro.name}`}
          >
            {compact ? "Открыть" : "Открыть рабочий стол"}
          </button>
        )}
      </div>
      {live && <LivePreview distro={distro} onClose={() => setLive(false)} />}
    </>
  );
}
