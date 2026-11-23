"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  AppWindow,
  ArrowLeft,
  ArrowRight,
  Battery,
  Bluetooth,
  Check,
  ChevronDown,
  ChevronRight,
  Download,
  File,
  FileText,
  Folder,
  Globe,
  HardDrive,
  Info,
  LayoutGrid,
  Maximize2,
  Minimize2,
  Monitor,
  Moon,
  Package,
  Palette,
  Play,
  Power,
  RefreshCw,
  Search,
  Settings,
  Shield,
  ShoppingBag,
  SkipForward,
  SlidersHorizontal,
  Sun,
  Terminal as TerminalIcon,
  Volume2,
  Wifi,
  X,
  Zap,
} from "lucide-react";
import type { Distro, PackageManager } from "@/lib/types";
import { formatRam } from "@/lib/taxonomy";
import {
  accentIcon,
  appIcon,
  getSkin,
  type DesktopSkin,
  type PreviewApp,
  type PreviewShell,
} from "@/data/skins";
import { asset } from "@/lib/assets";

type AppId = "terminal" | "files" | "settings" | "store" | "browser" | "about";

interface DeProfile {
  kind: PreviewShell;
  label: string;
  panel: "top" | "bottom" | "none";
  controls: "mac" | "win" | "gnome";
  dock: boolean;
  launcher: string;
  prompt: "$" | "%";
  canStartX: boolean;
  skin: DesktopSkin;
}

interface WindowState {
  id: number;
  app: AppId;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
}

interface TermEntry {
  id: number;
  node: ReactNode;
}

const APP_META: Record<AppId, { title: string; w: number; h: number }> = {
  terminal: { title: "Терминал", w: 680, h: 440 },
  files: { title: "Файлы", w: 720, h: 470 },
  settings: { title: "Параметры", w: 660, h: 500 },
  store: { title: "Центр приложений", w: 700, h: 500 },
  browser: { title: "Firefox", w: 760, h: 520 },
  about: { title: "О системе", w: 620, h: 470 },
};

const DESKTOP_APPS: AppId[] = ["files", "terminal", "browser", "store", "settings", "about"];

function appIconFor(distro: Distro, app: AppId): string {
  if (app === "about") return distro.logo;
  return appIcon(getSkin(distro.slug), app);
}

function hostname(distro: Distro) {
  return distro.slug.replace(/[^a-z0-9]/g, "").slice(0, 18) || "linux";
}

function getProfile(distro: Distro): DeProfile {
  const skin = getSkin(distro.slug);
  return {
    kind: skin.shell,
    label: skin.label,
    panel: skin.panel.position,
    controls: skin.controls,
    dock: Boolean(skin.dock),
    launcher: skin.launcher,
    prompt: "$",
    canStartX: skin.shell === "tty" && distro.slug === "arch-linux",
    skin,
  };
}

function wallpaperStyle(distro: Distro, _wallpaper?: string): CSSProperties {
  const skin = getSkin(distro.slug);
  return {
    "--dp-from": distro.preview.from,
    "--dp-to": distro.preview.to,
    "--lp-accent": distro.accent,
    "--lp-accent-soft": `${distro.accent}2f`,
    "--lp-font": skin.font,
    "--lp-term-font": skin.terminalFont,
    "--lp-term-bg": skin.terminal.background,
    "--lp-term-fg": skin.terminal.foreground,
    "--lp-term-cursor": skin.terminal.cursor,
    "--lp-term-selection": skin.terminal.selection,
    "--lp-term-dim": skin.terminal.dim,
    "--lp-term-green": skin.terminal.green,
    "--lp-term-blue": skin.terminal.blue,
    "--lp-term-yellow": skin.terminal.yellow,
    "--lp-term-red": skin.terminal.red,
    "--lp-panel-bg": skin.panel.background,
    "--lp-panel-fg": skin.panel.foreground,
    "--lp-panel-border": skin.panel.border,
    "--lp-panel-height": `${skin.panel.height}px`,
    "--lp-window-bg": skin.window.background,
    "--lp-window-fg": skin.window.foreground,
    "--lp-window-muted": skin.window.muted,
    "--lp-window-titlebar": skin.window.titlebar,
    "--lp-window-border": skin.window.border,
    "--lp-window-radius": `${skin.window.radius}px`,
    "--lp-titlebar-height": `${skin.window.titlebarHeight}px`,
    "--lp-dock-size": skin.dock ? `${skin.dock.itemSize}px` : "42px",
  } as CSSProperties;
}

function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function packageTool(distro: Distro) {
  const slug = distro.slug;
  if (distro.packageManager === "deb") {
    return {
      name: "APT",
      update: "sudo apt update",
      upgrade: "sudo apt upgrade -y",
      install: "sudo apt install",
      remove: "sudo apt remove",
      search: "apt search",
      binary: "apt",
    };
  }
  if (distro.packageManager === "pacman") {
    return {
      name: "pacman",
      update: "sudo pacman -Syu",
      upgrade: "sudo pacman -Syu",
      install: "sudo pacman -S",
      remove: "sudo pacman -Rns",
      search: "pacman -Ss",
      binary: "pacman",
    };
  }
  if (distro.packageManager === "apk") {
    return {
      name: "apk",
      update: "sudo apk update",
      upgrade: "sudo apk upgrade",
      install: "sudo apk add",
      remove: "sudo apk del",
      search: "apk search",
      binary: "apk",
    };
  }
  if (distro.packageManager === "rpm") {
    if (slug.includes("opensuse") || distro.basedOn.toLowerCase().includes("suse")) {
      return {
        name: "ZYpp",
        update: "sudo zypper refresh",
        upgrade: "sudo zypper update",
        install: "sudo zypper install",
        remove: "sudo zypper remove",
        search: "zypper search",
        binary: "zypper",
      };
    }
    return {
      name: "DNF",
      update: "sudo dnf check-update",
      upgrade: "sudo dnf upgrade -y",
      install: "sudo dnf install",
      remove: "sudo dnf remove",
      search: "dnf search",
      binary: "dnf",
    };
  }
  return {
    name: "пакетный менеджер",
    update: "sudo apt update",
    upgrade: "sudo apt upgrade -y",
    install: "sudo apt install",
    remove: "sudo apt remove",
    search: "apt search",
    binary: "apt",
  };
}

function packageOutput(tool: ReturnType<typeof packageTool>, action: string, pkg?: string) {
  const name = pkg || "пакет";
  if (tool.binary === "pacman") {
    if (action === "update" || action === "upgrade") {
      return [
        ":: Синхронизация баз данных пакетов...",
        " core                  174,8 KiB   1,02 MiB/s 00:00 [######################] 100%",
        " extra                   8,1 MiB   4,21 MiB/s 00:02 [######################] 100%",
        ":: Начало полного обновления системы...",
        "разрешение зависимостей...",
        "проверка конфликтов между пакетами...",
        ":: Запуск хуков...",
        "система обновлена.",
      ];
    }
    if (action === "install") {
      return [
        `разрешение зависимостей...`,
        `поиск конфликтов между пакетами...`,
        `Пакеты (1) ${name}-1.0-1`,
        `Общий размер загрузки: 2,41 MiB`,
        `:: Установка ${name}...`,
        `${name} установлен.`,
      ];
    }
    return [`${name} удалён.`, ":: Запуск хуков..."];
  }

  if (tool.binary === "dnf" || tool.binary === "zypper") {
    if (action === "update") {
      return [
        "Последняя проверка срока действия метаданных: 0:12:04 назад.",
        "Зависимости разрешены.",
        "Доступных обновлений нет.",
      ];
    }
    if (action === "upgrade") {
      return [
        "Зависимости разрешены.",
        "Обновление системы...",
        "Установлено: 0, обновлено: 0, удалено: 0.",
      ];
    }
    if (action === "install") {
      return [
        "Зависимости разрешены.",
        `Установлено: ${name}-1.0-1.x86_64`,
        "Выполнено!",
      ];
    }
    return [`Удалено: ${name}`, "Выполнено!"];
  }

  if (tool.binary === "apk") {
    if (action === "update") {
      return [
        "fetch https://dl-cdn.alpinelinux.org/alpine/v3.24/main/x86_64/APKINDEX.tar.gz",
        "fetch https://dl-cdn.alpinelinux.org/alpine/v3.24/community/x86_64/APKINDEX.tar.gz",
        "v3.24.3-142-g7d2e8f0f8d4 [https://dl-cdn.alpinelinux.org/alpine/v3.24/main]",
        "OK: 12 distinct packages available",
      ];
    }
    if (action === "upgrade") {
      return ["OK: 42 MiB in 24 packages", "OK: 42 MiB in 24 packages"];
    }
    if (action === "install") {
      return [
        `(1/1) Installing ${name} (1.0-r0)`,
        "Executing busybox-1.36.1-r29.trigger",
        "OK: 43 MiB in 25 packages",
      ];
    }
    return [`(1/1) Purging ${name} (1.0-r0)`, "OK: 42 MiB in 24 packages"];
  }

  if (action === "update") {
    return [
      "Чтение списков пакетов… Готово",
      "Построение дерева зависимостей… Готово",
      "Чтение информации о состоянии… Готово",
      "Все пакеты обновлены.",
    ];
  }
  if (action === "upgrade") {
    return [
      "Чтение списков пакетов… Готово",
      "Построение дерева зависимостей… Готово",
      "Расчёт обновлений… Готово",
      "Обновлено 0 пакетов, установлено 0 новых, удалено 0.",
    ];
  }
  if (action === "install") {
    return [
      "Чтение списков пакетов… Готово",
      "Построение дерева зависимостей… Готово",
      `Будут установлены следующие новые пакеты:`,
      `  ${name}`,
      "Обновлено 0, установлено 1 новых пакетов, удалено 0.",
      `Настраивается ${name} (1.0) ...`,
      "Обрабатываются триггеры для man-db (2.12.0-4) ...",
    ];
  }
  return [`Удаляется ${name} ...`, "Готово."];
}

function Neofetch({ distro, profile }: { distro: Distro; profile: DeProfile }) {
  const shell = profile.skin.shell;
  const packages =
    distro.packageManager === "pacman"
      ? "1384 (pacman), 21 (flatpak)"
      : distro.packageManager === "rpm"
        ? "2140 (rpm), 8 (flatpak)"
        : distro.packageManager === "apk"
          ? "186 (apk)"
          : "1842 (dpkg), 12 (flatpak)";
  const wm =
    shell === "plasma"
      ? "KWin 6.3"
      : shell === "xfce"
        ? "Xfwm4 4.20"
        : shell === "lxqt"
          ? "Openbox 3.6"
          : shell === "icewm"
            ? "IceWM 3.6"
            : shell === "jwm"
              ? "JWM 2.4"
              : shell === "cosmic"
                ? "cosmic-comp"
                : "Mutter 47";
  const terminal =
    shell === "plasma"
      ? "Konsole 24.12"
      : shell === "xfce"
        ? "xfce4-terminal 1.1"
        : shell === "lxqt"
          ? "QTerminal 2.1"
          : shell === "cosmic"
            ? "cosmic-term"
            : "gnome-terminal 3.54";
  const info = [
    ["OS", `${distro.name} ${distro.version}`],
    ["Host", "DistroHub Live Session"],
    ["Kernel", "6.12.4-generic"],
    ["Uptime", "12 mins"],
    ["Packages", packages],
    ["Shell", "bash 5.2.21"],
    ["Resolution", "1920x1080"],
    ["DE", profile.label],
    ["WM", wm],
    ["Terminal", terminal],
    ["CPU", "AMD Ryzen 5 5600 (12) @ 4.4GHz"],
    ["GPU", "AMD Radeon RX 6600"],
    ["Memory", `4,1 GiB / 15,5 GiB`],
  ];

  return (
    <div className="lp-neofetch">
      <img src={distro.logo} alt="" className="lp-neofetch-logo" />
      <div className="lp-neofetch-info">
        <p>
          <span className="lp-term-user">user@{hostname(distro)}</span>
        </p>
        <p className="lp-neofetch-rule">-----------------------</p>
        {info.map(([key, value]) => (
          <p key={key}>
            <span className="lp-term-accent">{key}</span>: {value}
          </p>
        ))}
        <div className="lp-neofetch-colors">
          {[
            profile.skin.terminal.background,
            profile.skin.terminal.red,
            profile.skin.terminal.green,
            profile.skin.terminal.yellow,
            profile.skin.terminal.blue,
            profile.skin.terminal.cursor,
          ].map((color) => (
            <span key={color} style={{ background: color }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TerminalApp({
  distro,
  profile,
  onExit,
  onNotify,
  onStartX,
  tty = false,
}: {
  distro: Distro;
  profile: DeProfile;
  onExit: () => void;
  onNotify: (text: string) => void;
  onStartX?: () => void;
  tty?: boolean;
}) {
  const tool = useMemo(() => packageTool(distro), [distro]);
  const host = hostname(distro);
  const [entries, setEntries] = useState<TermEntry[]>([
    {
      id: 1,
      node: (
        <div className="lp-term-motd">
          <p>
            Добро пожаловать в <strong>{distro.name} {distro.version}</strong>
          </p>
          <p className="lp-term-dim">
            Последний вход: {new Date().toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" })} на tty1
          </p>
          <p className="lp-term-dim">Введите help, чтобы увидеть список команд.</p>
        </div>
      ),
    },
  ]);
  const [input, setInput] = useState("");
  const [cwd, setCwd] = useState("/home/user");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const idRef = useRef(2);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [entries]);

  useEffect(() => {
    if (!tty) return;
    inputRef.current?.focus();
  }, [tty]);

  function push(...nodes: ReactNode[]) {
    setEntries((prev) => [
      ...prev,
      ...nodes.map((node) => ({ id: idRef.current++, node })),
    ]);
  }

  function pushText(text: string, className = "") {
    push(
      <p className={className}>
        {text}
      </p>,
    );
  }

  function run(raw: string) {
    const command = raw.trim();
    const base = [...entries, { id: idRef.current++, node: <PromptLine cwd={cwd} host={host} prompt={profile.prompt} command={raw} /> }];
    if (!command) {
      setEntries(base);
      return;
    }
    setHistory((prev) => [...prev, command]);
    setHistoryIndex(-1);

    const parts = command.split(/\s+/);
    let cmd = parts[0];
    let args = parts.slice(1);

    if (cmd === "sudo") {
      cmd = args[0] ?? "";
      args = args.slice(1);
      if (!cmd) {
        setEntries([...base, { id: idRef.current++, node: <p>usage: sudo &lt;команда&gt;</p> }]);
        return;
      }
    }

    const direct = new Set([
      "apt", "apt-get", "dnf", "zypper", "pacman", "apk", "flatpak", "snap",
      "update", "upgrade", "install", "remove", "search", "refresh",
    ]);

    if (direct.has(cmd) || cmd === "apt-get") {
      const action =
        cmd === "update" || cmd === "refresh"
          ? "update"
          : cmd === "upgrade"
            ? "upgrade"
            : cmd === "install"
              ? "install"
              : cmd === "remove"
                ? "remove"
                : cmd === "search"
                  ? "search"
                  : args[0] === "update" || args[0] === "check-update" || args[0] === "refresh"
                    ? "update"
                    : args[0] === "upgrade" || args[0] === "full-upgrade"
                      ? "upgrade"
                      : args[0] === "install" || args[0] === "-S" || args[0] === "add"
                        ? "install"
                        : args[0] === "remove" || args[0] === "del" || args[0] === "-Rns"
                          ? "remove"
                          : args[0] === "search" || args[0] === "-Ss"
                            ? "search"
                            : "update";

      let pkg = "";
      if (action === "install" || action === "remove") {
        pkg =
          args.find(
            (arg) =>
              !arg.startsWith("-") &&
              !["install", "remove", "del", "add", "update", "upgrade", "search"].includes(arg),
          ) ?? "htop";
      }
      if (action === "search") {
        pkg =
          args.find(
            (arg) =>
              !arg.startsWith("-") &&
              !["install", "remove", "del", "add", "update", "upgrade", "search"].includes(arg),
          ) ?? "firefox";
      }

      if (action === "search") {
        const lines = [
          `${pkg}/stable 128.0-1 amd64`,
          `  ${pkg}: популярное приложение для Linux`,
          `${pkg}-common/stable 128.0-1 all`,
        ];
        setEntries([...base, ...lines.map((line) => ({ id: idRef.current++, node: <p key={line}>{line}</p> }))]);
        return;
      }

      const output = packageOutput(tool, action, pkg);
      const nodes = output.map((line, index) => ({
        id: idRef.current++,
        node: <p key={`${line}-${index}`} className={line.startsWith("::") ? "lp-term-accent" : ""}>{line}</p>,
      }));
      setEntries([...base, ...nodes]);
      if (action === "install") onNotify(`${pkg} установлен через ${tool.name}`);
      if (action === "upgrade") onNotify("Система обновлена");
      return;
    }

    switch (cmd) {
      case "help":
        setEntries([
          ...base,
          {
            id: idRef.current++,
            node: (
              <div className="lp-term-help">
                <p>Доступные команды:</p>
                <p><span>ls, cd, pwd, cat, echo, clear, exit</span>: работа с файлами и оболочкой</p>
                <p><span>uname -a, neofetch, fastfetch, date, uptime</span>: сведения о системе</p>
                <p><span>df -h, free -h, ip a, ping</span>: диск, память и сеть</p>
                <p><span>{tool.update}, {tool.install} &lt;пакет&gt;</span>: пакеты ({tool.name})</p>
                <p><span>download &lt;файл&gt;</span>: скачать файл из демо</p>
                {onStartX && <p><span>startx</span>: запустить графическую сессию</p>}
                <p><span>sudo reboot, sudo poweroff</span>: перезагрузка и выключение</p>
              </div>
            ),
          },
        ]);
        return;
      case "clear":
        setEntries([]);
        setInput("");
        return;
      case "exit":
      case "logout":
        if (tty) {
          setEntries([
            ...base,
            { id: idRef.current++, node: <p>Завершение сеанса...</p> },
          ]);
          window.setTimeout(onExit, 700);
        } else {
          onExit();
        }
        setInput("");
        return;
      case "pwd":
        setEntries([...base, { id: idRef.current++, node: <p>{cwd}</p> }]);
        return;
      case "whoami":
        setEntries([...base, { id: idRef.current++, node: <p>user</p> }]);
        return;
      case "hostname":
        setEntries([...base, { id: idRef.current++, node: <p>{host}</p> }]);
        return;
      case "id":
        setEntries([...base, { id: idRef.current++, node: <p>uid=1000(user) gid=1000(user) groups=1000(user),27(sudo),100(users)</p> }]);
        return;
      case "date":
        setEntries([...base, { id: idRef.current++, node: <p>{new Date().toLocaleString("ru-RU", { dateStyle: "full", timeStyle: "medium" })}</p> }]);
        return;
      case "uptime":
        setEntries([...base, { id: idRef.current++, node: <p> {new Date().toLocaleTimeString("ru-RU")} up 12 min, 1 user, load average: 0,14, 0,21, 0,18</p> }]);
        return;
      case "ls": {
        const items = ["Документы", "Загрузки", "Изображения", "Видео", ".bashrc", "notes.txt", "plan.md", "report.pdf"];
        setEntries([
          ...base,
          { id: idRef.current++, node: <p className="lp-term-accent">{items.join("  ")}</p> },
        ]);
        return;
      }
      case "cd": {
        const target = args[0];
        if (!target || target === "~") setCwd("/home/user");
        else if (target === "..") setCwd(cwd === "/home" ? "/" : cwd.replace(/\/[^/]+$/, "") || "/");
        else if (target.startsWith("/")) setCwd(target.replace(/\/$/, "") || "/");
        else setCwd(`${cwd.replace(/\/$/, "")}/${target}`);
        setInput("");
        return;
      }
      case "cat": {
        if (args[0] === "/etc/os-release") {
          const lines = [
            `NAME="${distro.name}"`,
            `VERSION="${distro.version}"`,
            `ID=${distro.slug}`,
            `ID_LIKE=${distro.basedOn.toLowerCase()}`,
            `PRETTY_NAME="${distro.name} ${distro.version}"`,
            `HOME_URL="${distro.website}"`,
          ];
          setEntries([...base, ...lines.map((line) => ({ id: idRef.current++, node: <p key={line}>{line}</p> }))]);
          return;
        }
        const contents: Record<string, string[]> = {
          "notes.txt": [
            "Заметки о " + distro.name + ".",
            "",
            "- Установка прошла без проблем.",
            "- Драйверы встали из репозитория.",
            "- Система обновляется штатно.",
          ],
          "plan.md": [
            "# План",
            "",
            "1. Проверить Wi-Fi.",
            "2. Настроить резервные копии.",
            "3. Установить нужные приложения.",
          ],
          ".bashrc": [
            `export PS1='\\u@\\h:\\w${profile.prompt} '`,
            "alias ll='ls -la'",
            `alias update='${tool.update}'`,
            `alias install='${tool.install}'`,
          ],
        };
        setEntries([
          ...base,
          ...(contents[args[0] ?? ""] ?? [`cat: ${args[0] ?? ""}: Нет такого файла или каталога`]).map((line) => ({
            id: idRef.current++,
            node: <p key={line}>{line}</p>,
          })),
        ]);
        return;
      }
      case "echo":
        setEntries([...base, { id: idRef.current++, node: <p>{args.join(" ")}</p> }]);
        return;
      case "uname":
        setEntries([
          ...base,
          { id: idRef.current++, node: <p>Linux {host} 6.12.4-generic #1 SMP PREEMPT_DYNAMIC {new Date().toUTCString()} x86_64 GNU/Linux</p> },
        ]);
        return;
      case "neofetch":
      case "fastfetch":
        setEntries([...base, { id: idRef.current++, node: <Neofetch distro={distro} profile={profile} /> }]);
        return;
      case "df":
        setEntries([
          ...base,
          { id: idRef.current++, node: <pre className="lp-term-pre">{"Filesystem      Size  Used Avail Use% Mounted on\n/dev/nvme0n1p2  120G   38G   76G  34% /\n/dev/nvme0n1p1  512M  6,1M  506M   2% /boot/efi\ntmpfs           7,8G  2,1M  7,8G   1% /run"}</pre> },
        ]);
        return;
      case "free":
        setEntries([
          ...base,
          { id: idRef.current++, node: <pre className="lp-term-pre">{`               total        used        free      shared  buff/cache   available
Mem:            ${distro.recRam * 1024}        ${Math.round(distro.recRam * 380)}        ${Math.round(distro.recRam * 420)}         128        ${Math.round(distro.recRam * 224)}        ${Math.round(distro.recRam * 620)}
Swap:          2048           0        2048`}</pre> },
        ]);
        return;
      case "ip":
        setEntries([
          ...base,
          { id: idRef.current++, node: <pre className="lp-term-pre">{`1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: wlp2s0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 192.168.1.42/24 brd 192.168.1.255 scope global dynamic wlp2s0`}</pre> },
        ]);
        return;
      case "ping":
        setEntries([
          ...base,
          { id: idRef.current++, node: <pre className="lp-term-pre">{`PING 1.1.1.1 (1.1.1.1) 56(84) bytes of data.
64 bytes from 1.1.1.1: icmp_seq=1 ttl=57 time=12.4 ms
64 bytes from 1.1.1.1: icmp_seq=2 ttl=57 time=11.9 ms
64 bytes from 1.1.1.1: icmp_seq=3 ttl=57 time=12.1 ms

--- 1.1.1.1 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2003ms`}</pre> },
        ]);
        return;
      case "systemctl":
        setEntries([
          ...base,
          { id: idRef.current++, node: <p>● {args[1] ?? "systemd"}.service - {args[1] ?? "System"}</p> },
          { id: idRef.current++, node: <p className="lp-term-dim">     Loaded: loaded (/usr/lib/systemd/system/{args[1] ?? "systemd"}.service; enabled; preset: enabled)</p> },
          { id: idRef.current++, node: <p className="lp-term-dim">     Active: active (running) since {new Date().toLocaleString("ru-RU")}; 12min ago</p> },
        ]);
        return;
      case "download": {
        const file = args[0] ?? "notes.txt";
        const contents: Record<string, string> = {
          "notes.txt": `Заметки о ${distro.name}\n\nДемо-файл из DistroHub.\n${distro.website}\n`,
          "plan.md": `# План\n\n1. Проверить Wi-Fi.\n2. Настроить бэкапы.\n3. Установить приложения.\n`,
          "README": `${distro.name} ${distro.version}\n${distro.tagline}\n\n${distro.summary}\n`,
          "iso.sha256": `${"a".repeat(64)}  ${distro.slug}-${distro.version.replace(/\s+/g, "-")}-amd64.iso\n`,
        };
        downloadText(file, contents[file] ?? contents.README);
        setEntries([...base, { id: idRef.current++, node: <p>Скачано: {file}</p> }]);
        onNotify(`Файл ${file} скачан`);
        return;
      }
      case "startx":
        if (onStartX) {
          setEntries([...base, { id: idRef.current++, node: <p>Запуск Xorg... Запуск сессии Xfce.</p> }]);
          window.setTimeout(onStartX, 800);
        } else {
          setEntries([...base, { id: idRef.current++, node: <p>startx: команда не найдена. Графическая оболочка не установлена.</p> }]);
        }
        return;
      case "reboot":
      case "poweroff":
        setEntries([...base, { id: idRef.current++, node: <p>Система {cmd === "reboot" ? "перезагружается" : "выключается"}...</p> }]);
        onNotify(cmd === "reboot" ? "Перезагрузка (демо)" : "Выключение (демо)");
        window.setTimeout(onExit, 900);
        return;
      case "history":
        setEntries([
          ...base,
          ...history.map((line, index) => ({ id: idRef.current++, node: <p key={`${line}-${index}`}>{String(index + 1).padStart(4, " ")}  {line}</p> })),
        ]);
        return;
      case "man":
        setEntries([...base, { id: idRef.current++, node: <p>Справка по команде «{args[0] ?? "man"}» доступна в демо-режиме только через help.</p> }]);
        return;
      case "htop":
      case "top":
        setEntries([
          ...base,
          { id: idRef.current++, node: <pre className="lp-term-pre">{`  PID USER      PR  NI    VIRT    RES  %CPU  %MEM     TIME+ COMMAND
 1842 user      20   0  612345  98234   2,4   1,2   0:04.21 gnome-shell
 2310 user      20   0  428112  64120   1,1   0,8   0:01.87 Xorg
 2451 user      20   0  184320  32112   0,7   0,4   0:00.92 terminal`}</pre> },
        ]);
        return;
      case "nano":
      case "vim":
      case "vi":
        setEntries([...base, { id: idRef.current++, node: <p>{cmd}: интерактивный редактор недоступен в демо-режиме.</p> }]);
        return;
      case "sudo":
        setEntries([...base, { id: idRef.current++, node: <p>usage: sudo &lt;команда&gt;</p> }]);
        return;
      default:
        setEntries([...base, { id: idRef.current++, node: <p>{cmd}: команда не найдена. Введите help.</p> }]);
        return;
    }
  }

  function autocomplete() {
    const commands = [
      "help", "clear", "ls", "cd", "pwd", "cat", "echo", "uname", "neofetch", "fastfetch",
      "date", "uptime", "df", "free", "ip", "ping", "download", "install", "remove", "search",
      "update", "upgrade", "systemctl", "history", "exit",
    ];
    if (!input.trim()) {
      setInput(commands[0]);
      return;
    }
    const match = commands.find((command) => command.startsWith(input.trim()));
    if (match) setInput(match);
  }

  return (
    <div className={`lp-term ${tty ? "lp-term-tty" : ""}`}>
      {!tty && (
        <div className="lp-term-tabs">
          <span className="lp-term-tab lp-term-tab-active">user@{host}: ~</span>
          <span className="lp-term-tab">+</span>
          <span className="lp-term-tab-spacer" />
        </div>
      )}
      <div className="lp-term-scroll">
        {entries.map((entry) => (
          <div key={entry.id} className="lp-term-entry">{entry.node}</div>
        ))}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            run(input);
            setInput("");
          }}
          className="lp-term-prompt"
        >
          <PromptLine cwd={cwd} host={host} prompt={profile.prompt} />
          <input
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "ArrowUp") {
                event.preventDefault();
                if (!history.length) return;
                const next = historyIndex < 0 ? history.length - 1 : Math.max(0, historyIndex - 1);
                setHistoryIndex(next);
                setInput(history[next]);
              } else if (event.key === "ArrowDown") {
                event.preventDefault();
                if (historyIndex < 0) return;
                const next = historyIndex + 1;
                if (next >= history.length) {
                  setHistoryIndex(-1);
                  setInput("");
                } else {
                  setHistoryIndex(next);
                  setInput(history[next]);
                }
              } else if (event.key === "Tab") {
                event.preventDefault();
                autocomplete();
              } else if (event.key === "l" && event.ctrlKey) {
                event.preventDefault();
                setEntries([]);
              } else if (event.key === "c" && event.ctrlKey) {
                event.preventDefault();
                push(<p>^C</p>);
                setInput("");
              }
            }}
            className="lp-term-input"
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            aria-label="Командная строка"
          />
        </form>
        <div ref={endRef} />
      </div>
    </div>
  );
}

function PromptLine({
  cwd,
  host,
  prompt,
  command,
}: {
  cwd: string;
  host: string;
  prompt: "$" | "%";
  command?: string;
}) {
  const shortCwd = cwd === "/home/user" ? "~" : cwd;
  return (
    <p className="lp-term-prompt-line">
      <span className="lp-term-user">user@{host}</span>
      <span className="lp-term-path">:{shortCwd}</span>
      <span className="lp-term-sym">{prompt}</span>
      {command !== undefined ? <span> {command}</span> : null}
    </p>
  );
}

function FilesApp({ distro, onNotify }: { distro: Distro; onNotify: (text: string) => void }) {
  const files = useMemo(
    () => [
      { name: "Документы", folder: true, size: "4 элемента" },
      { name: "Загрузки", folder: true, size: "2 элемента" },
      { name: "Изображения", folder: true, size: "18 элементов" },
      { name: "Видео", folder: true, size: "3 элемента" },
      { name: "notes.txt", folder: false, size: "1,2 КБ", content: `Заметки о ${distro.name}.\n\nСистема установлена и настроена.\nДрайверы работают, обновления приходят штатно.` },
      { name: "plan.md", folder: false, size: "840 Б", content: "# План\n\n1. Проверить Wi-Fi.\n2. Настроить резервные копии.\n3. Установить приложения из магазина." },
      { name: "report.pdf", folder: false, size: "248 КБ", content: "PDF-документ. В демо-режиме доступен только предпросмотр названия." },
      { name: `${distro.slug}-${distro.version.replace(/\s+/g, "-")}-amd64.iso`, folder: false, size: distro.isoSize, content: `Образ ${distro.name} ${distro.version}.\nСкачивание ISO в демо-режиме заменено на файл контрольной суммы.` },
      { name: "README", folder: false, size: "2,1 КБ", content: `${distro.name} ${distro.version}\n${distro.tagline}\n\n${distro.website}` },
    ],
    [distro],
  );
  const [selected, setSelected] = useState(files[0]);
  const [folder, setFolder] = useState("Домой");

  function open(file: (typeof files)[number]) {
    setSelected(file);
  }

  function download(file: (typeof files)[number]) {
    if (file.folder) return;
    if (file.name.endsWith(".iso")) {
      downloadText(
        `${file.name}.sha256`,
        `${"b".repeat(64)}  ${file.name}\n`,
      );
      onNotify("Скачан файл контрольной суммы ISO");
    } else {
      downloadText(file.name, file.content ?? file.name);
      onNotify(`Скачан ${file.name}`);
    }
  }

  return (
    <div className="lp-files">
      <aside className="lp-files-sidebar">
        <p className="lp-side-title">Места</p>
        {["Домой", "Документы", "Загрузки", "Изображения", "Корзина"].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFolder(item)}
            className={`lp-side-item ${folder === item ? "lp-side-active" : ""}`}
          >
            {item === "Корзина" ? <TrashIcon /> : <Folder className="h-4 w-4" />}
            {item}
          </button>
        ))}
        <p className="lp-side-title lp-side-title-second">Устройства</p>
        <button type="button" className="lp-side-item">
          <HardDrive className="h-4 w-4" /> 120 GB SSD
        </button>
      </aside>
      <div className="lp-files-main">
        <div className="lp-files-toolbar">
          <div className="lp-files-address">
            <Folder className="h-4 w-4" />
            <span>/home/user/{folder === "Домой" ? "" : folder}</span>
          </div>
          <button type="button" className="lp-icon-btn" onClick={() => selected && download(selected)}>
            <Download className="h-4 w-4" />
          </button>
        </div>
        <div className="lp-files-body">
          <div className="lp-files-list">
            <div className="lp-files-head">
              <span>Имя</span>
              <span>Размер</span>
            </div>
            {files.map((file) => (
              <button
                key={file.name}
                type="button"
                onClick={() => open(file)}
                onDoubleClick={() => download(file)}
                className={`lp-file-row ${selected.name === file.name ? "lp-file-row-active" : ""}`}
              >
                <span className="lp-file-name">
                  {file.folder ? <Folder className="h-4 w-4 text-sky-400" /> : <FileText className="h-4 w-4 text-slate-400" />}
                  {file.name}
                </span>
                <span className="lp-file-size">{file.size}</span>
              </button>
            ))}
          </div>
          <div className="lp-files-preview">
            <div className="lp-preview-icon">
              {selected.folder ? <Folder className="h-10 w-10" /> : <File className="h-10 w-10" />}
            </div>
            <h4>{selected.name}</h4>
            <p>{selected.folder ? "Папка" : selected.size}</p>
            {!selected.folder && (
              <>
                <pre>{selected.content}</pre>
                <button type="button" className="lp-btn lp-btn-primary" onClick={() => download(selected)}>
                  <Download className="h-3.5 w-3.5" /> Скачать
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TrashIcon() {
  return <span className="lp-trash-icon" aria-hidden="true" />;
}

function SettingsApp({
  distro,
  theme,
  setTheme,
  onNotify,
}: {
  distro: Distro;
  theme: "dark" | "light";
  setTheme: (value: "dark" | "light") => void;
  onNotify: (text: string) => void;
}) {
  const skin = getSkin(distro.slug);
  const [section, setSection] = useState("appearance");
  const [wifi, setWifi] = useState(true);
  const [bluetooth, setBluetooth] = useState(false);
  const [nightLight, setNightLight] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [resolution, setResolution] = useState("1920 × 1080");
  const [scale, setScale] = useState("100%");

  const sections = [
    { id: "appearance", label: "Внешний вид", icon: Palette },
    { id: "network", label: "Сеть", icon: Wifi },
    { id: "display", label: "Экран", icon: Monitor },
    { id: "power", label: "Питание", icon: Battery },
    { id: "updates", label: "Обновления", icon: RefreshCw },
    { id: "about", label: "О системе", icon: Info },
  ];

  return (
    <div className="lp-settings">
      <aside className="lp-settings-nav">
        {sections.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSection(item.id)}
            className={`lp-settings-nav-item ${section === item.id ? "lp-settings-nav-active" : ""}`}
          >
            <item.icon className="h-4 w-4" /> {item.label}
          </button>
        ))}
      </aside>
      <div className="lp-settings-content">
        {section === "appearance" && (
          <>
            <h3>Внешний вид</h3>
            <p className="lp-muted">Оформление рабочего стола, обои и акцентный цвет.</p>
            <div className="lp-settings-block">
              <div className="lp-setting-row">
                <span>Тема</span>
                <div className="lp-segmented">
                  <button type="button" className={theme === "light" ? "active" : ""} onClick={() => setTheme("light")}>
                    <Sun className="h-3.5 w-3.5" /> Светлая
                  </button>
                  <button type="button" className={theme === "dark" ? "active" : ""} onClick={() => setTheme("dark")}>
                    <Moon className="h-3.5 w-3.5" /> Тёмная
                  </button>
                </div>
              </div>
              <div className="lp-setting-row lp-setting-row-column">
                <span>Обои</span>
                <div className="lp-wallpaper-current">
                  {skin.wallpaper ? <img src={asset(skin.wallpaper)} alt="" /> : <span className="lp-wallpaper-tty" />}
                  <div>
                    <strong>Стандартные обои {distro.name}</strong>
                    <p>Изменить фон можно в настройках рабочего стола.</p>
                  </div>
                </div>
              </div>
              <div className="lp-setting-row">
                <span>Акцентный цвет</span>
                <span className="lp-accent-dot" style={{ background: distro.accent }} />
              </div>
            </div>
          </>
        )}

        {section === "network" && (
          <>
            <h3>Сеть</h3>
            <p className="lp-muted">Wi-Fi, Bluetooth и проводные подключения.</p>
            <div className="lp-settings-block">
              <ToggleRow label="Wi-Fi" value={wifi} onChange={(value) => { setWifi(value); onNotify(value ? "Wi-Fi подключён" : "Wi-Fi отключён"); }} icon={<Wifi className="h-4 w-4" />} />
              <ToggleRow label="Bluetooth" value={bluetooth} onChange={setBluetooth} icon={<Bluetooth className="h-4 w-4" />} />
              <div className="lp-setting-row">
                <span>Подключение</span>
                <span className="lp-muted">Home_5G · 192.168.1.42</span>
              </div>
            </div>
          </>
        )}

        {section === "display" && (
          <>
            <h3>Экран</h3>
            <p className="lp-muted">Разрешение, масштаб и частота обновления.</p>
            <div className="lp-settings-block">
              <div className="lp-setting-row">
                <span>Разрешение</span>
                <select value={resolution} onChange={(event) => setResolution(event.target.value)}>
                  <option>1920 × 1080</option>
                  <option>2560 × 1440</option>
                  <option>3840 × 2160</option>
                  <option>1366 × 768</option>
                </select>
              </div>
              <div className="lp-setting-row">
                <span>Масштаб</span>
                <select value={scale} onChange={(event) => setScale(event.target.value)}>
                  <option>100%</option>
                  <option>125%</option>
                  <option>150%</option>
                </select>
              </div>
              <ToggleRow label="Ночной свет" value={nightLight} onChange={setNightLight} icon={<Moon className="h-4 w-4" />} />
            </div>
          </>
        )}

        {section === "power" && (
          <>
            <h3>Питание</h3>
            <p className="lp-muted">Батарея, режим сна и профиль производительности.</p>
            <div className="lp-settings-block">
              <div className="lp-battery-card">
                <Battery className="h-8 w-8" />
                <div>
                  <strong>87%</strong>
                  <p>Осталось примерно 4 ч 20 мин</p>
                </div>
              </div>
              <div className="lp-setting-row">
                <span>Режим</span>
                <span className="lp-muted">Сбалансированный</span>
              </div>
              <ToggleRow label="Автоматический сон" value={true} onChange={() => {}} icon={<Zap className="h-4 w-4" />} />
            </div>
          </>
        )}

        {section === "updates" && (
          <>
            <h3>Обновления</h3>
            <p className="lp-muted">Проверка и установка обновлений системы.</p>
            <div className="lp-settings-block">
              <div className="lp-update-card">
                <RefreshCw className={`h-8 w-8 ${updating ? "lp-spin" : ""}`} />
                <div>
                  <strong>{updating ? "Проверка обновлений..." : "Система актуальна"}</strong>
                  <p>Последняя проверка: сегодня</p>
                </div>
              </div>
              <button
                type="button"
                className="lp-btn lp-btn-primary"
                disabled={updating}
                onClick={() => {
                  setUpdating(true);
                  window.setTimeout(() => {
                    setUpdating(false);
                    onNotify("Обновления проверены. Новых версий нет.");
                  }, 1400);
                }}
              >
                <RefreshCw className="h-3.5 w-3.5" /> Проверить обновления
              </button>
            </div>
          </>
        )}

        {section === "about" && (
          <>
            <h3>О системе</h3>
            <div className="lp-about-settings">
              <img src={distro.logo} alt="" />
              <div>
                <strong>{distro.name}</strong>
                <p>{distro.version}</p>
              </div>
            </div>
            <div className="lp-settings-block">
              <div className="lp-setting-row"><span>Пакеты</span><span className="lp-muted">{packageTool(distro).name}</span></div>
              <div className="lp-setting-row"><span>Рабочий стол</span><span className="lp-muted">{distro.desktops.join(", ")}</span></div>
              <div className="lp-setting-row"><span>Ядро</span><span className="lp-muted">6.12.4-generic</span></div>
              <div className="lp-setting-row"><span>ОЗУ</span><span className="lp-muted">{formatRam(distro.recRam)}</span></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
  icon,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  icon?: ReactNode;
}) {
  return (
    <div className="lp-setting-row">
      <span className="lp-setting-label">{icon}{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`lp-switch ${value ? "lp-switch-on" : ""}`}
      >
        <span />
      </button>
    </div>
  );
}

function StoreApp({ distro, onNotify }: { distro: Distro; onNotify: (text: string) => void }) {
  const apps = [
    { name: "Firefox", category: "Интернет", icon: "/icons/apps/firefox.svg" },
    { name: "LibreOffice", category: "Офис", icon: "/icons/apps/libreoffice.svg" },
    { name: "GIMP", category: "Графика", icon: "/icons/apps/gimp.svg" },
    { name: "Visual Studio Code", category: "Разработка", icon: "/icons/apps/code.svg" },
    { name: "VLC", category: "Мультимедиа", icon: "/icons/apps/vlc.svg" },
    { name: "Steam", category: "Игры", icon: "/icons/apps/steam.svg" },
    { name: "Telegram", category: "Общение", icon: "/icons/apps/telegram.svg" },
    { name: "Spotify", category: "Музыка", icon: "/icons/apps/spotify.svg" },
  ];
  const [installed, setInstalled] = useState<string[]>(["Firefox"]);
  const [installing, setInstalling] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const visible = apps.filter((app) => app.name.toLowerCase().includes(query.toLowerCase()));

  function install(app: string) {
    if (installed.includes(app) || installing) return;
    setInstalling(app);
    window.setTimeout(() => {
      setInstalled((prev) => [...prev, app]);
      setInstalling(null);
      onNotify(`${app} установлен через ${packageTool(distro).name}`);
    }, 1200);
  }

  return (
    <div className="lp-store">
      <div className="lp-store-header">
        <div>
          <h3>Центр приложений</h3>
          <p className="lp-muted">Программы для {distro.name}</p>
        </div>
        <div className="lp-store-search">
          <Search className="h-4 w-4" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск приложений" />
        </div>
      </div>
      <div className="lp-store-chips">
        {["Все", "Интернет", "Офис", "Графика", "Разработка", "Игры"].map((chip) => (
          <span key={chip} className="lp-chip">{chip}</span>
        ))}
      </div>
      <div className="lp-store-grid">
        {visible.map((app) => {
          const isInstalled = installed.includes(app.name);
          const isInstalling = installing === app.name;
          return (
            <div key={app.name} className="lp-store-card">
              <span className="lp-store-icon">
                <img src={asset(app.icon)} alt="" />
              </span>
              <div className="lp-store-info">
                <strong>{app.name}</strong>
                <span>{app.category}</span>
              </div>
              <button
                type="button"
                className={`lp-btn lp-btn-small ${isInstalled ? "lp-btn-ghost" : "lp-btn-primary"}`}
                disabled={isInstalling}
                onClick={() => install(app.name)}
              >
                {isInstalled ? <><Check className="h-3.5 w-3.5" /> Установлено</> : isInstalling ? "Установка..." : "Установить"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BrowserApp({ distro }: { distro: Distro }) {
  const home = "https://distrohub.local/";
  const [url, setUrl] = useState(home);
  const [address, setAddress] = useState(home);
  const [history, setHistory] = useState([home]);
  const [index, setIndex] = useState(0);

  function navigate(next: string) {
    const normalized = next.startsWith("http") ? next : `https://${next}`;
    setUrl(normalized);
    setAddress(normalized);
    setHistory((prev) => [...prev.slice(0, index + 1), normalized]);
    setIndex((prev) => prev + 1);
  }

  const page = useMemo(() => {
    if (url.includes("docs")) {
      return (
        <div className="lp-browser-page">
          <h2>Документация {distro.name}</h2>
          <p>Установка, настройка оборудования и работа с пакетами.</p>
          <div className="lp-browser-links">
            {["Быстрый старт", "Установка с флешки", "Драйверы NVIDIA", "Wi-Fi и Bluetooth", "Работа с терминалом"].map((item) => (
              <div key={item}><ChevronRight className="h-4 w-4" /> {item}</div>
            ))}
          </div>
        </div>
      );
    }
    if (url.includes("store")) {
      return (
        <div className="lp-browser-page">
          <h2>Магазин приложений</h2>
          <p>Популярные программы для {distro.name}.</p>
          <div className="lp-browser-apps">
            {["Firefox", "LibreOffice", "GIMP", "VS Code", "VLC", "Steam"].map((app) => (
              <div key={app}><Package className="h-4 w-4" /> {app}</div>
            ))}
          </div>
        </div>
      );
    }
    if (url.includes("search")) {
      return (
        <div className="lp-browser-page">
          <h2>Результаты поиска</h2>
          <p>Найдено 3 полезные страницы.</p>
          <div className="lp-browser-results">
            <div><strong>Как установить {distro.name} на VirtualBox</strong><span>Пошаговая инструкция с настройками виртуальной машины.</span></div>
            <div><strong>Настройка драйверов и обновлений</strong><span>Что делать после первой загрузки.</span></div>
            <div><strong>Лучшие приложения для повседневной работы</strong><span>Подборка редактора DistroHub.</span></div>
          </div>
        </div>
      );
    }
    return (
      <div className="lp-browser-page lp-browser-home">
        <div className="lp-browser-hero">
          <img src={distro.logo} alt="" />
          <div>
            <h2>{distro.name} {distro.version}</h2>
            <p>{distro.tagline}</p>
          </div>
        </div>
        <p>{distro.summary}</p>
        <div className="lp-browser-links">
          <button type="button" onClick={() => navigate("https://docs.distrohub.local/")}><FileText className="h-4 w-4" /> Документация</button>
          <button type="button" onClick={() => navigate("https://store.distrohub.local/")}><ShoppingBag className="h-4 w-4" /> Магазин</button>
          <button type="button" onClick={() => navigate("https://distrohub.local/search?q=linux")}><Search className="h-4 w-4" /> Поиск</button>
        </div>
      </div>
    );
  }, [url, distro]);

  return (
    <div className="lp-browser">
      <div className="lp-browser-toolbar">
        <button
          type="button"
          className="lp-icon-btn"
          onClick={() => {
            if (index > 0) {
              const next = index - 1;
              setIndex(next);
              setUrl(history[next]);
              setAddress(history[next]);
            }
          }}
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="lp-icon-btn"
          onClick={() => {
            if (index < history.length - 1) {
              const next = index + 1;
              setIndex(next);
              setUrl(history[next]);
              setAddress(history[next]);
            }
          }}
        >
          <ArrowRight className="h-4 w-4" />
        </button>
        <form
          className="lp-browser-address"
          onSubmit={(event) => {
            event.preventDefault();
            navigate(address);
          }}
        >
          <Shield className="h-3.5 w-3.5" />
          <input value={address} onChange={(event) => setAddress(event.target.value)} aria-label="Адресная строка" />
        </form>
        <button type="button" className="lp-icon-btn" onClick={() => navigate(home)}>
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
      <div className="lp-browser-view">{page}</div>
    </div>
  );
}

function AboutApp({ distro, profile }: { distro: Distro; profile: DeProfile }) {
  return (
    <div className="lp-about">
      <div className="lp-about-hero">
        <img src={distro.logo} alt="" />
        <div>
          <h2>{distro.name}</h2>
          <p>{distro.version}</p>
          <span>{profile.label}</span>
        </div>
      </div>
      <div className="lp-about-grid">
        <div><span>Ядро</span><strong>6.12.4-generic</strong></div>
        <div><span>Пакеты</span><strong>{packageTool(distro).name}</strong></div>
        <div><span>ОЗУ</span><strong>{formatRam(distro.recRam)}</strong></div>
        <div><span>Диск</span><strong>{distro.disk} ГБ</strong></div>
        <div><span>Архитектура</span><strong>{distro.architectures.join(", ")}</strong></div>
        <div><span>Тип обновлений</span><strong>{distro.releaseModel.toUpperCase()}</strong></div>
      </div>
      <div className="lp-about-footer">
        <span>DistroHub Live Session</span>
        <span>{distro.website}</span>
      </div>
    </div>
  );
}

function WindowFrame({
  win,
  iconSrc,
  profile,
  onFocus,
  onClose,
  onMinimize,
  onMaximize,
  onDragStart,
  children,
}: {
  win: WindowState;
  iconSrc: string;
  profile: DeProfile;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onDragStart: (event: ReactPointerEvent) => void;
  children: ReactNode;
}) {
  if (win.minimized) return null;
  const style: CSSProperties = win.maximized
    ? { left: 0, top: 0, width: "100%", height: "100%", zIndex: win.z }
    : { left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z };

  return (
    <section
      className={`lp-window lp-window-${profile.kind} ${win.maximized ? "lp-window-max" : ""}`}
      data-controls={profile.controls}
      style={style}
      onPointerDown={onFocus}
      aria-label={win.title}
    >
      <header className="lp-titlebar" onPointerDown={onDragStart} onDoubleClick={onMaximize}>
        {profile.controls !== "gnome" && <img className="lp-titlebar-icon" src={asset(iconSrc)} alt="" />}
        <span className="lp-titlebar-title">{win.title}</span>
        <span className={`lp-controls lp-controls-${profile.controls}`} onPointerDown={(event) => event.stopPropagation()}>
          {profile.controls === "mac" ? (
            <>
              <button type="button" className="lp-mac-close" onClick={(event) => { event.stopPropagation(); onClose(); }} aria-label="Закрыть"><span /></button>
              <button type="button" className="lp-mac-min" onClick={(event) => { event.stopPropagation(); onMinimize(); }} aria-label="Свернуть"><span /></button>
              <button type="button" className="lp-mac-max" onClick={(event) => { event.stopPropagation(); onMaximize(); }} aria-label="Развернуть"><span /></button>
            </>
          ) : (
            <>
              {profile.controls !== "gnome" && (
                <button type="button" onClick={(event) => { event.stopPropagation(); onMinimize(); }} aria-label="Свернуть">
                  <Minimize2 className="h-3 w-3" />
                </button>
              )}
              {profile.controls !== "gnome" && (
                <button type="button" onClick={(event) => { event.stopPropagation(); onMaximize(); }} aria-label="Развернуть">
                  <Maximize2 className="h-3 w-3" />
                </button>
              )}
              <button type="button" className="lp-close" onClick={(event) => { event.stopPropagation(); onClose(); }} aria-label="Закрыть">
                <X className="h-3 w-3" />
              </button>
            </>
          )}
        </span>
      </header>
      <div className="lp-window-body">{children}</div>
    </section>
  );
}

function BootScreen({ distro, profile, onSkip }: { distro: Distro; profile: DeProfile; onSkip: () => void }) {
  const [progress, setProgress] = useState(8);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setProgress((prev) => Math.min(100, prev + Math.round(Math.random() * 18) + 6));
    }, 160);
    return () => window.clearInterval(timer);
  }, []);

  const boot = profile.skin.boot;

  if (boot.style === "tty") {
    return (
      <div className="lp-boot lp-boot-tty">
        <div className="lp-boot-log">
          <p>[    0.000000] Linux version {distro.slug === "alpine-linux" ? "6.12.0-alpine" : "6.14.0"} (build@distrohub) #1 SMP PREEMPT_DYNAMIC</p>
          <p>[    0.000000] Command line: BOOT_IMAGE=/vmlinuz root=/dev/sda2 ro quiet</p>
          <p>[    0.124703] Memory: 8124M available</p>
          <p>[    0.388201] ACPI: Early table checksum verification disabled</p>
          <p>[    0.741055] pci 0000:00:02.0: [8086:9a49] type 00 class 0x030000</p>
          <p>[    1.204418] usb 1-1: new high-speed USB device number 2 using xhci_hcd</p>
          <p>[    1.884920] systemd[1]: Detected architecture x86-64.</p>
          <p>[    2.225107] systemd[1]: Reached target Local File Systems.</p>
          <p>[    2.670442] systemd[1]: Started Journal Service.</p>
          <p className="lp-boot-log-ok">[  OK  ] Reached target Multi-User System.</p>
          <p className="lp-boot-log-cursor">Starting Login Service... <i /></p>
        </div>
        <button type="button" className="lp-boot-skip" onClick={onSkip}>
          <SkipForward className="h-3.5 w-3.5" /> Пропустить
        </button>
      </div>
    );
  }

  return (
    <div className="lp-boot" style={{ background: boot.background, color: boot.foreground }}>
      <div className="lp-boot-vignette" />
      <div className="lp-boot-content">
        <img src={asset(distro.logo)} alt={`Логотип ${distro.name}`} />
        {boot.style === "kde" ? (
          <div className="lp-boot-kde">
            <span className="lp-boot-ring" style={{ borderTopColor: boot.accent }} />
            <span className="lp-boot-status">{progress < 100 ? "Загрузка" : "Готово"}</span>
          </div>
        ) : (
          <>
            <div className="lp-boot-dots" aria-hidden>
              {[0, 1, 2, 3, 4].map((dot) => (
                <i key={dot} style={{ background: boot.accent, animationDelay: `${dot * 120}ms` }} />
              ))}
            </div>
            <span className="lp-boot-status">{boot.label}</span>
          </>
        )}
      </div>
      <span className="lp-boot-version">{boot.sublabel}</span>
      <button type="button" className="lp-boot-skip" onClick={onSkip}>
        <SkipForward className="h-3.5 w-3.5" /> Пропустить
      </button>
    </div>
  );
}

function QuickSettings({
  wifi,
  setWifi,
  bluetooth,
  setBluetooth,
  theme,
  setTheme,
  onClose,
}: {
  wifi: boolean;
  setWifi: (value: boolean) => void;
  bluetooth: boolean;
  setBluetooth: (value: boolean) => void;
  theme: "dark" | "light";
  setTheme: (value: "dark" | "light") => void;
  onClose: () => void;
}) {
  return (
    <div className="lp-quick" onClick={(event) => event.stopPropagation()}>
      <div className="lp-quick-grid">
        <button type="button" className={wifi ? "active" : ""} onClick={() => setWifi(!wifi)}>
          <Wifi className="h-5 w-5" /> Wi-Fi
        </button>
        <button type="button" className={bluetooth ? "active" : ""} onClick={() => setBluetooth(!bluetooth)}>
          <Bluetooth className="h-5 w-5" /> Bluetooth
        </button>
        <button type="button" className={theme === "dark" ? "active" : ""} onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />} Тема
        </button>
        <button type="button" onClick={onClose}>
          <Power className="h-5 w-5" /> Выйти
        </button>
      </div>
      <div className="lp-quick-slider">
        <Volume2 className="h-4 w-4" />
        <span><i style={{ width: "64%" }} /></span>
      </div>
    </div>
  );
}

function PanelTray({
  skin,
  onQuick,
  onClock,
  onClose,
}: {
  skin: DesktopSkin;
  onQuick: () => void;
  onClock: () => void;
  onClose: () => void;
}) {
  return (
    <div className="lp-panel-tray">
      <button type="button" className="lp-tray-btn" onClick={onQuick} title="Быстрые настройки">
        <Wifi className="h-3.5 w-3.5" />
        <Volume2 className="h-3.5 w-3.5" />
        <Battery className="h-3.5 w-3.5" />
        <ChevronRight className="h-3 w-3 lp-tray-more" />
      </button>
      <button type="button" className="lp-clock" onClick={onClock}>
        {new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
      </button>
      {skin.slug === "tails" && <span className="lp-tor-badge">Tor</span>}
      <button type="button" className="lp-tray-btn lp-power" onClick={onClose} title="Завершить сеанс">
        <Power className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function LpPanel({
  distro,
  skin,
  windows,
  onLauncher,
  onTask,
  onQuick,
  onClock,
  onClose,
}: {
  distro: Distro;
  skin: DesktopSkin;
  windows: WindowState[];
  onLauncher: () => void;
  onTask: (win: WindowState) => void;
  onQuick: () => void;
  onClock: () => void;
  onClose: () => void;
}) {
  if (skin.panel.position === "none") return null;

  if (skin.shell === "gnome" || skin.shell === "ubuntu" || skin.shell === "cosmic") {
    return (
      <div className="lp-panel lp-panel-top lp-panel-gnome" data-shell={skin.shell}>
        <div className="lp-gnome-left">
          <button type="button" className="lp-activities" onClick={onLauncher}>
            {skin.shell === "ubuntu" ? "Ubuntu" : skin.shell === "cosmic" ? "COSMIC" : "Деятельность"}
          </button>
          <span className="lp-workspace-dots" aria-hidden><i /><i /><i /></span>
        </div>
        <button type="button" className="lp-gnome-clock" onClick={onClock}>
          {new Date().toLocaleString("ru-RU", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
        </button>
        <div className="lp-gnome-right">
          <button type="button" className="lp-tray-btn" onClick={onQuick} title="Быстрые настройки">
            <Wifi className="h-3.5 w-3.5" />
            <Volume2 className="h-3.5 w-3.5" />
            <Battery className="h-3.5 w-3.5" />
            <ChevronDown className="h-3 w-3" />
          </button>
          {skin.slug === "tails" && <span className="lp-tor-badge">Tor</span>}
          <button type="button" className="lp-tray-btn lp-power" onClick={onClose} title="Завершить сеанс">
            <Power className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="lp-panel lp-panel-bottom lp-panel-classic" data-shell={skin.shell}>
      <button type="button" className="lp-panel-launcher" onClick={onLauncher}>
        <img src={asset(distro.logo)} alt="" />
        <span>{skin.launcher}</span>
      </button>
      <div className="lp-panel-windows">
        {windows.map((win) => (
          <button
            key={win.id}
            type="button"
            className={`lp-panel-window ${win.minimized ? "lp-panel-window-min" : ""}`}
            onClick={() => onTask(win)}
          >
            <img src={asset(appIconFor(distro, win.app))} alt="" />
            <span>{win.title}</span>
          </button>
        ))}
      </div>
      <div className="lp-panel-spacer" />
      {skin.shell === "plasma" && <span className="lp-pager" aria-hidden><i /><i /></span>}
      <PanelTray skin={skin} onQuick={onQuick} onClock={onClock} onClose={onClose} />
    </div>
  );
}

function LpDock({ distro, skin, onOpen }: { distro: Distro; skin: DesktopSkin; onOpen: (app: AppId) => void }) {
  if (!skin.dock) return null;
  return (
    <div className={`lp-dock lp-dock-${skin.dock.position}`} data-shell={skin.shell}>
      {skin.dock.apps.map((app) => (
        <button key={app} type="button" className="lp-dock-item" onClick={() => onOpen(app)} title={APP_META[app].title}>
          <img src={asset(appIcon(skin, app))} alt="" />
          {(app === "browser" || app === "terminal") && <i className="lp-dock-running" />}
        </button>
      ))}
    </div>
  );
}

function LpDesktopIcons({ distro, skin, onOpen }: { distro: Distro; skin: DesktopSkin; onOpen: (app: AppId) => void }) {
  const side = skin.dock?.position === "left" ? "right" : "left";
  return (
    <div className={`lp-desktop-icons lp-desktop-icons-${side}`}>
      {skin.desktopIcons.map((item) => {
        const app: AppId =
          item.app === "install" || item.app === "trash" || item.app === "computer"
            ? item.app === "trash" || item.app === "computer"
              ? "files"
              : "store"
            : item.app;
        const icon =
          item.icon ??
          (item.app === "trash"
            ? accentIcon(skin, "trash")
            : item.app === "computer"
              ? "/icons/apps/computer.svg"
              : appIcon(skin, item.app as PreviewApp));
        return (
          <button key={item.label} type="button" className="lp-desktop-icon" onClick={() => onOpen(app)}>
            <img src={asset(icon)} alt="" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function LiveShell({
  distro,
  profile,
  onClose,
  onStartX,
}: {
  distro: Distro;
  profile: DeProfile;
  onClose: () => void;
  onStartX?: () => void;
}) {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [launcher, setLauncher] = useState(false);
  const [quick, setQuick] = useState(false);
  const [notifications, setNotifications] = useState<{ id: number; text: string }[]>([]);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [wifi, setWifi] = useState(true);
  const [bluetooth, setBluetooth] = useState(false);
  const [clock, setClock] = useState(new Date());
  const [query, setQuery] = useState("");
  const nextId = useRef(1);
  const zRef = useRef(10);
  const dragRef = useRef<{ id: number; offsetX: number; offsetY: number } | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    function move(event: PointerEvent) {
      const drag = dragRef.current;
      if (!drag) return;
      setWindows((prev) =>
        prev.map((win) =>
          win.id === drag.id && !win.maximized
            ? { ...win, x: event.clientX - drag.offsetX, y: event.clientY - drag.offsetY }
            : win,
        ),
      );
    }
    function up() {
      dragRef.current = null;
    }
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  function notify(text: string) {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [...prev, { id, text }]);
    window.setTimeout(() => setNotifications((prev) => prev.filter((item) => item.id !== id)), 2600);
  }

  function focus(id: number) {
    zRef.current += 1;
    const z = zRef.current;
    setWindows((prev) => prev.map((win) => (win.id === id ? { ...win, z, minimized: false } : win)));
  }

  function openApp(app: AppId) {
    setLauncher(false);
    setQuick(false);
    const existing = windows.find((win) => win.app === app);
    if (existing) {
      focus(existing.id);
      return;
    }
    const meta = APP_META[app];
    const viewportW = Math.max(320, window.innerWidth);
    const viewportH = Math.max(480, window.innerHeight);
    const w = Math.min(meta.w, viewportW - 32);
    const h = Math.min(meta.h, viewportH - 96);
    const offset = windows.length % 5;
    const id = nextId.current++;
    zRef.current += 1;
    setWindows((prev) => [
      ...prev,
      {
        id,
        app,
        title: meta.title,
        x: Math.max(12, Math.round((viewportW - w) / 2) + offset * 18),
        y: Math.max(profile.panel === "top" ? 44 : 12, Math.round((viewportH - h) / 2) + offset * 14),
        w,
        h,
        z: zRef.current,
        minimized: false,
        maximized: false,
      },
    ]);
  }

  function closeWindow(id: number) {
    setWindows((prev) => prev.filter((win) => win.id !== id));
  }

  function minimize(id: number) {
    setWindows((prev) => prev.map((win) => (win.id === id ? { ...win, minimized: true } : win)));
  }

  function maximize(id: number) {
    setWindows((prev) => prev.map((win) => (win.id === id ? { ...win, maximized: !win.maximized } : win)));
  }

  function startDrag(event: ReactPointerEvent, win: WindowState) {
    if (win.maximized) return;
    event.preventDefault();
    dragRef.current = { id: win.id, offsetX: event.clientX - win.x, offsetY: event.clientY - win.y };
    focus(win.id);
  }

  const filteredApps = DESKTOP_APPS.filter((app) => APP_META[app].title.toLowerCase().includes(query.toLowerCase()));

  function renderApp(win: WindowState) {
    return (
      <WindowFrame
        key={win.id}
        win={win}
        iconSrc={appIconFor(distro, win.app)}
        profile={profile}
        onFocus={() => focus(win.id)}
        onClose={() => closeWindow(win.id)}
        onMinimize={() => minimize(win.id)}
        onMaximize={() => maximize(win.id)}
        onDragStart={(event) => startDrag(event, win)}
      >
        {win.app === "terminal" && (
          <TerminalApp distro={distro} profile={profile} onExit={() => closeWindow(win.id)} onNotify={notify} />
        )}
        {win.app === "files" && <FilesApp distro={distro} onNotify={notify} />}
        {win.app === "settings" && (
          <SettingsApp distro={distro} theme={theme} setTheme={setTheme} onNotify={notify} />
        )}
        {win.app === "store" && <StoreApp distro={distro} onNotify={notify} />}
        {win.app === "browser" && <BrowserApp distro={distro} />}
        {win.app === "about" && <AboutApp distro={distro} profile={profile} />}
      </WindowFrame>
    );
  }

  const skin = profile.skin;

  return (
    <div
      className={`lp-shell lp-${profile.kind}`}
      data-shell={skin.shell}
      data-tone={skin.wallpaperTone}
      style={wallpaperStyle(distro)}
    >
      {skin.wallpaper ? (
        <img className="lp-wall" src={asset(skin.wallpaper)} alt="" draggable={false} />
      ) : (
        <div className="lp-wall lp-wall-empty" />
      )}
      <div className="lp-desktop-shade" />

      <div className="lp-desktop">
        <LpDesktopIcons distro={distro} skin={skin} onOpen={openApp} />
        {windows.map(renderApp)}
        <LpDock distro={distro} skin={skin} onOpen={openApp} />
        <LpPanel
          distro={distro}
          skin={skin}
          windows={windows}
          onLauncher={() => setLauncher((prev) => !prev)}
          onTask={(win) => (win.minimized ? focus(win.id) : minimize(win.id))}
          onQuick={() => setQuick((prev) => !prev)}
          onClock={() => notify(clock.toLocaleString("ru-RU", { dateStyle: "full", timeStyle: "short" }))}
          onClose={onClose}
        />
      </div>

      {launcher && (
        <div className="lp-launcher-backdrop" data-shell={skin.shell} onClick={() => setLauncher(false)}>
          <div className={`lp-launcher lp-launcher-${skin.shell}`} onClick={(event) => event.stopPropagation()}>
            <div className="lp-launcher-search">
              <Search className="h-4 w-4" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Поиск приложений"
                autoFocus
              />
              <span>{filteredApps.length} прил.</span>
            </div>
            <div className="lp-launcher-grid">
              {filteredApps.map((app) => (
                <button key={app} type="button" className="lp-launcher-app" onClick={() => openApp(app)}>
                  <img src={asset(appIconFor(distro, app))} alt="" />
                  <span>{APP_META[app].title}</span>
                </button>
              ))}
            </div>
            <div className="lp-launcher-footer">
              <span className="lp-launcher-brand"><img src={distro.logo} alt="" /> {distro.name} {distro.version}</span>
              <button type="button" onClick={onClose}><Power className="h-4 w-4" /> Завершить сеанс</button>
            </div>
          </div>
        </div>
      )}

      {quick && (
        <QuickSettings
          wifi={wifi}
          setWifi={setWifi}
          bluetooth={bluetooth}
          setBluetooth={setBluetooth}
          theme={theme}
          setTheme={setTheme}
          onClose={onClose}
        />
      )}

      <div className="lp-notifications" aria-live="polite">
        {notifications.map((note) => (
          <div key={note.id} className="lp-notification">
            <img src={distro.logo} alt="" />
            <span>{note.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TtySession({ distro, profile, onClose, onStartX }: { distro: Distro; profile: DeProfile; onClose: () => void; onStartX?: () => void }) {
  return (
    <div className="lp-tty-shell" style={wallpaperStyle(distro)}>
      <TerminalApp distro={distro} profile={profile} onExit={onClose} onNotify={() => {}} onStartX={onStartX} tty />
    </div>
  );
}

export function LivePreview({ distro, onClose }: { distro: Distro; onClose: () => void }) {
  const profile = useMemo(() => getProfile(distro), [distro]);
  const [booted, setBooted] = useState(false);
  const [graphical, setGraphical] = useState(profile.kind !== "tty");
  const [startX, setStartX] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setBooted(true), 1700);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const desktopProfile = useMemo<DeProfile>(() => {
    if (profile.kind !== "tty") return profile;
    const base = profile.skin;
    const skin: DesktopSkin = {
      ...base,
      shell: "xfce",
      label: "Xfce 4.20",
      wallpaper: "/wallpapers/arch-linux.webp",
      wallpaperTone: "dark",
      font: '"Noto Sans", sans-serif',
      iconTheme: "papirus",
      panel: {
        ...base.panel,
        position: "top",
        height: 30,
        background: "rgba(23, 23, 27, 0.96)",
        foreground: "#e8e8e8",
        border: "rgba(0,0,0,0.5)",
        blur: false,
        clock: "right",
      },
      dock: null,
      launcher: "Приложения",
      controls: "win",
      window: {
        ...base.window,
        background: "#2b2b2b",
        foreground: "#e8e8e8",
        muted: "#a0a0a0",
        titlebar: "#383838",
        border: "rgba(0,0,0,0.5)",
        radius: 4,
        titlebarHeight: 32,
      },
      boot: {
        ...base.boot,
        style: "plymouth",
        background: "#0b0b0f",
        foreground: "#f0f0f2",
        accent: "#1793d1",
        label: "Arch Linux",
        sublabel: "Xfce · Linux 6.16",
      },
      desktopIcons: [
        { app: "files", label: "Домашняя папка" },
        { app: "terminal", label: "Терминал" },
        { app: "trash", label: "Корзина" },
      ],
    };
    return {
      kind: "xfce",
      label: "Xfce 4.20",
      panel: "top",
      controls: "win",
      dock: false,
      launcher: "Приложения",
      prompt: "$",
      canStartX: false,
      skin,
    };
  }, [profile]);

  const content = !booted ? (
    <BootScreen distro={distro} profile={profile} onSkip={() => setBooted(true)} />
  ) : graphical ? (
    <LiveShell distro={distro} profile={desktopProfile} onClose={onClose} />
  ) : (
    <TtySession
      distro={distro}
      profile={profile}
      onClose={onClose}
      onStartX={profile.canStartX ? () => {
        setStartX(true);
        setGraphical(true);
      } : undefined}
    />
  );

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className={`live-preview-root ${startX ? "lp-started-x" : ""}`}>
      {content}
    </div>,
    document.body,
  );
}
