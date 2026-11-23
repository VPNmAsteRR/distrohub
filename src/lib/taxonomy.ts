import type { PackageManager, Purpose, ReleaseModel } from "./types";

export const PURPOSE_LABELS: Record<Purpose, string> = {
  beginners: "Новичкам",
  switchers: "С Windows и macOS",
  servers: "Для серверов",
  lightweight: "Лёгкие",
  "old-pc": "Старым ПК",
  dev: "Разработчикам",
  gaming: "Для игр",
  privacy: "Приватность",
  security: "Пентест",
  containers: "Контейнеры",
};

export const PURPOSE_DESCRIPTIONS: Record<Purpose, string> = {
  beginners: "Понятная установка, готовый софт и большое сообщество.",
  switchers: "Привычные раскладки и внешний вид после Windows или macOS.",
  servers: "Долгая поддержка, предсказуемые обновления, минимум лишнего.",
  lightweight: "Мало памяти и CPU: система не мешает работать.",
  "old-pc": "Оживляет ноутбуки и компьютеры возрастом 10+ лет.",
  dev: "Свежие тулчейны, контейнеры и удобная среда для кода.",
  gaming: "Драйверы, Proton и готовые настройки для игр.",
  privacy: "Минимум телеметрии, анонимность и шифрование.",
  security: "Инструменты для аудита и тестирования на проникновение.",
  containers: "Маленький образ, быстрый запуск, минимум зависимостей.",
};

export const PACKAGE_LABELS: Record<PackageManager, string> = {
  deb: "DEB · apt",
  rpm: "RPM · dnf",
  pacman: "Pacman",
  apk: "APK · apk-tools",
  other: "Свой формат",
};

export const PACKAGE_SHORT: Record<PackageManager, string> = {
  deb: "DEB",
  rpm: "RPM",
  pacman: "Pacman",
  apk: "APK",
  other: "other",
};

export const RELEASE_LABELS: Record<ReleaseModel, string> = {
  lts: "LTS",
  fixed: "Фиксированный",
  rolling: "Rolling",
  immutable: "Иммутабельный",
};

export const RELEASE_DESCRIPTIONS: Record<ReleaseModel, string> = {
  lts: "Редкие крупные релизы с длительной поддержкой: стабильно и без сюрпризов.",
  fixed: "Плановые релизы раз в 6–13 месяцев, обновления внутри ветки.",
  rolling: "Пакеты обновляются непрерывно, версии всегда свежие, но нужен опыт.",
  immutable: "Система собрана в образ и обновляется целиком; сломать сложно.",
};

export function formatRam(gb: number): string {
  if (gb < 1) return `${Math.round(gb * 1024)} МБ`;
  return `${gb} ГБ`;
}

export function formatRating(value: number): string {
  return value > 0 ? value.toFixed(1).replace(".", ",") : "нет";
}

export const PURPOSE_ORDER: Purpose[] = [
  "beginners",
  "switchers",
  "dev",
  "servers",
  "containers",
  "lightweight",
  "old-pc",
  "gaming",
  "privacy",
  "security",
];
