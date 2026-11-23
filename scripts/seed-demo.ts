/**
 * Наполняет базу демонстрационными данными.
 * Запуск: npm run seed
 *
 * Скрипт идемпотентен: пользователи и отзывы обновляются, а не дублируются.
 */
import { hashSync } from "bcryptjs";
import {
  createUser,
  getDb,
  getUserByEmail,
  isFavorite,
  toggleFavorite,
  upsertReview,
  type UserRow,
} from "../src/lib/db";

const DEMO_EMAIL = "demo@distrohub.ru";
const DEMO_PASSWORD = "demo12345";

interface SeedUser {
  email: string;
  name: string;
  daysAgo: number;
}

interface SeedReview {
  distro: string;
  email: string;
  rating: number;
  body: string;
  daysAgo: number;
}

const REVIEWERS: SeedUser[] = [
  { email: "anna@demo.distrohub.ru", name: "Анна К.", daysAgo: 160 },
  { email: "maksim@demo.distrohub.ru", name: "Максим П.", daysAgo: 210 },
  { email: "olga@demo.distrohub.ru", name: "Ольга В.", daysAgo: 140 },
  { email: "ilya@demo.distrohub.ru", name: "Илья С.", daysAgo: 120 },
  { email: "dmitry@demo.distrohub.ru", name: "Дмитрий Р.", daysAgo: 260 },
];

const REVIEWS: SeedReview[] = [
  {
    distro: "ubuntu",
    email: DEMO_EMAIL,
    rating: 5,
    daysAgo: 12,
    body: "Поставил 26.04 LTS на рабочий ноутбук с Ryzen 5 и 16 ГБ. Wi-Fi, звук, внешний монитор и принтер заработали сразу, без танцев. Snap поначалу раздражает медленным первым запуском, но к этому быстро привыкаешь.",
  },
  {
    distro: "linux-mint",
    email: DEMO_EMAIL,
    rating: 5,
    daysAgo: 34,
    body: "Перевёл родителей на Mint 22.3 — через неделю они уже сами ставят обновления. Cinnamon выглядит привычно после Windows 10, а на 8 ГБ ОЗУ система работает заметно бодрее. Единственное, о чём пришлось рассказать, — где искать настройки экрана.",
  },
  {
    distro: "fedora-workstation",
    email: DEMO_EMAIL,
    rating: 4,
    daysAgo: 58,
    body: "Fedora 44 на ThinkPad T14: Wayland и дробное масштабирование работают отлично, свежие пакеты приятны для разработки. Раз в полгода приходится обновляться и проверять, не сломались ли сторонние репозитории.",
  },
  {
    distro: "bazzite",
    email: DEMO_EMAIL,
    rating: 5,
    daysAgo: 6,
    body: "Поставил на HTPC вместо Windows — Steam запускается в игровом режиме, Proton тянет почти всю библиотеку. Иммутабельная система обновляется атомарно, поэтому бояться неудачного апдейта больше не нужно.",
  },
  {
    distro: "linux-mint",
    email: "anna@demo.distrohub.ru",
    rating: 5,
    daysAgo: 22,
    body: "Ноутбуку восемь лет, 4 ГБ ОЗУ. Mint Xfce работает быстрее, чем Windows 10 на том же железе. Firefox с десятком вкладок не съедает всю память, а установщик понятный даже без инструкции.",
  },
  {
    distro: "zorin-os",
    email: "anna@demo.distrohub.ru",
    rating: 5,
    daysAgo: 47,
    body: "Выбирала систему для мамы, которая всю жизнь на Windows. Zorin 18 с раскладкой «как Windows» не вызвал ни одного вопроса: меню «Пуск» на месте, панель внизу. Из минусов — часть оформления доступна только в платной версии.",
  },
  {
    distro: "lubuntu",
    email: "anna@demo.distrohub.ru",
    rating: 4,
    daysAgo: 75,
    body: "Стоит на офисном ПК с 4 ГБ. Браузер, документы и Телеграм работают, система почти не нагружает процессор. LXQt выглядит простовато, но свои задачи выполняет.",
  },
  {
    distro: "tails",
    email: "anna@demo.distrohub.ru",
    rating: 5,
    daysAgo: 101,
    body: "Беру в поездки на флешке: после загрузки весь трафик идёт через Tor, данные не сохраняются. Важно проверять контрольную сумму образа и помнить, что Tails — не замена нормальной гигиене паролей.",
  },
  {
    distro: "fedora-workstation",
    email: "maksim@demo.distrohub.ru",
    rating: 5,
    daysAgo: 18,
    body: "Fedora 44 — мой основной рабочий инструмент уже третий год. Отличная поддержка контейнеров и свежие тулчейны, обновления почти не ломают систему. Хотелось бы меньше сюрпризов с NVIDIA после мажорных апдейтов.",
  },
  {
    distro: "arch-linux",
    email: "maksim@demo.distrohub.ru",
    rating: 4,
    daysAgo: 29,
    body: "Ставил по официальной инструкции, не по сторонним скриптам. За два года ни одного фатального обновления: раз в неделю читаю archnews перед pacman -Syu. Система ровно такая, какой её соберёшь, — в этом и смысл.",
  },
  {
    distro: "manjaro",
    email: "maksim@demo.distrohub.ru",
    rating: 4,
    daysAgo: 63,
    body: "Хороший компромисс: AUR доступен, но обновления приходят с задержкой и обычно не ломают KDE. Пару раз после крупных апдейтов приходилось чинить темы, но без потери данных.",
  },
  {
    distro: "opensuse-tumbleweed",
    email: "maksim@demo.distrohub.ru",
    rating: 5,
    daysAgo: 88,
    body: "После неудачного обновления NVIDIA откатился через snapper за пару минут — за это Tumbleweed можно простить любые мелочи. YaST всё ещё удобен для настройки сервисов.",
  },
  {
    distro: "alpine-linux",
    email: "maksim@demo.distrohub.ru",
    rating: 5,
    daysAgo: 133,
    body: "Использую в контейнерах: образ меньше 10 МБ, apk ставит зависимости мгновенно. На десктопе не пробовал бы, но для сервисов это идеальный минимализм.",
  },
  {
    distro: "ubuntu",
    email: "olga@demo.distrohub.ru",
    rating: 4,
    daysAgo: 15,
    body: "LTS-релиз предсказуем и хорошо документирован. Всё, что нужно для учёбы, ставится из коробки. Снимаю звезду за snap: некоторые приложения запускаются дольше, чем хотелось бы.",
  },
  {
    distro: "pop-os",
    email: "olga@demo.distrohub.ru",
    rating: 5,
    daysAgo: 42,
    body: "Pop!_OS 24.04 на ноутбуке с гибридной графикой: переключение между Intel и NVIDIA работает из коробки, tiling-режим экономит кучу времени. GNOME с фирменными улучшениями ощущается цельным.",
  },
  {
    distro: "debian",
    email: "olga@demo.distrohub.ru",
    rating: 5,
    daysAgo: 69,
    body: "Debian 13 стоит на домашнем сервере третий год. Обновления редкие и понятные, ничего не разваливается. Для нового железа пакеты бывают староваты, но для сервера это скорее плюс.",
  },
  {
    distro: "ubuntu-server",
    email: "olga@demo.distrohub.ru",
    rating: 5,
    daysAgo: 111,
    body: "Домашний сервер на LTS: Docker, Nextcloud и пара скриптов. Пять лет поддержки и огромная база инструкций решают. Главное — не ставить на сервер лишние репозитории.",
  },
  {
    distro: "almalinux",
    email: "olga@demo.distrohub.ru",
    rating: 4,
    daysAgo: 155,
    body: "На VPS под веб-приложения: совместимость с RHEL и стабильные пакеты. Документации меньше, чем у Ubuntu, но сообщество и общие с RHEL статьи закрывают почти все вопросы.",
  },
  {
    distro: "bazzite",
    email: "ilya@demo.distrohub.ru",
    rating: 5,
    daysAgo: 9,
    body: "На Steam Deck и втором ПК — лучший опыт из «игровых» систем, которые пробовал. Обновления приходят образом, откатиться можно из меню загрузки. Для рабочего стола тоже подходит, если не нужны специфические пакеты.",
  },
  {
    distro: "pop-os",
    email: "ilya@demo.distrohub.ru",
    rating: 4,
    daysAgo: 37,
    body: "Ставил на ноутбук для игр: Steam, Proton и драйверы работают. COSMIC ещё молодой и местами шероховатый, но развивается быстро. Для повседневной работы пока выбрал бы GNOME.",
  },
  {
    distro: "manjaro",
    email: "ilya@demo.distrohub.ru",
    rating: 3,
    daysAgo: 81,
    body: "Система удобная, но за год дважды ломался AUR после обновления. Для новичка, который хочет «как Arch, но проще», это может стать неприятным сюрпризом.",
  },
  {
    distro: "kali-linux",
    email: "ilya@demo.distrohub.ru",
    rating: 4,
    daysAgo: 118,
    body: "Использую в учебной лаборатории для пентеста и разбора трафика. Инструменты собраны удобно, но на повседневную систему ставить не стал бы: лишние сервисы и специфичные настройки.",
  },
  {
    distro: "rocky-linux",
    email: "ilya@demo.distrohub.ru",
    rating: 4,
    daysAgo: 170,
    body: "Поставил на тестовый сервер вместо CentOS. Всё, что было написано для RHEL, работает без изменений. Раздражает только необходимость подключать сторонние репозитории для свежих версий пакетов.",
  },
  {
    distro: "antix",
    email: "dmitry@demo.distrohub.ru",
    rating: 5,
    daysAgo: 26,
    body: "Оживил нетбук 2009 года с 2 ГБ ОЗУ. antiX загружается за полминуты и позволяет нормально работать с документами. Интерфейс спартанский, но для такого железа это честный выбор.",
  },
  {
    distro: "puppy-linux",
    email: "dmitry@demo.distrohub.ru",
    rating: 4,
    daysAgo: 52,
    body: "Загружаюсь с флешки, чтобы проверить диск или зайти в банк на чужом компьютере. Система целиком живёт в оперативной памяти и летает. Для постоянной работы не хватает привычных приложений.",
  },
  {
    distro: "xubuntu",
    email: "dmitry@demo.distrohub.ru",
    rating: 4,
    daysAgo: 97,
    body: "Ставил на старый ноутбук как замену Windows 7. Xfce простой и предсказуемый, LTS обновляется без сюрпризов. Внешний вид устарел, но за стабильность это приемлемая цена.",
  },
  {
    distro: "arch-linux",
    email: "dmitry@demo.distrohub.ru",
    rating: 5,
    daysAgo: 124,
    body: "Мой основной дистрибутив на домашнем ПК. Нравится, что система не тащит ничего лишнего и я точно знаю, откуда взялся каждый пакет. Требует времени на чтение новостей, зато вознаграждает.",
  },
  {
    distro: "debian",
    email: "dmitry@demo.distrohub.ru",
    rating: 4,
    daysAgo: 143,
    body: "Ставил родителям на стационарный компьютер: стабильно, никаких внезапных обновлений интерфейса. Пришлось немного повозиться с Wi-Fi-адаптером, которому нужна проприетарная прошивка.",
  },
  {
    distro: "ubuntu",
    email: "dmitry@demo.distrohub.ru",
    rating: 4,
    daysAgo: 190,
    body: "Универсальный вариант: любая инструкция в интернете с высокой вероятностью подойдёт. После перехода на Wayland пропали мелкие проблемы с внешним монитором. Snap остаётся главным раздражителем.",
  },
];

function ensureUser(email: string, name: string, passwordHash: string, daysAgo = 90): UserRow {
  const existing = getUserByEmail(email);
  if (existing) {
    getDb().prepare("UPDATE users SET password_hash = ?, name = ? WHERE id = ?").run(
      passwordHash,
      name,
      existing.id,
    );
    return existing;
  }
  const user = createUser(email, name, passwordHash);
  getDb()
    .prepare("UPDATE users SET created_at = ? WHERE id = ?")
    .run(Date.now() - daysAgo * 86_400_000, user.id);
  return user;
}

function main() {
  const db = getDb();

  const demo = ensureUser(DEMO_EMAIL, "Демо-пользователь", hashSync(DEMO_PASSWORD, 10), 180);
  db.prepare("UPDATE users SET created_at = ? WHERE id = ?").run(
    Date.now() - 200 * 86_400_000,
    demo.id,
  );

  const users = new Map<string, UserRow>();
  users.set(DEMO_EMAIL, demo);

  for (const reviewer of REVIEWERS) {
    users.set(
      reviewer.email,
      ensureUser(
        reviewer.email,
        reviewer.name,
        hashSync(`seed-only-${reviewer.email}`, 10),
        reviewer.daysAgo,
      ),
    );
  }

  let reviewCount = 0;
  for (const review of REVIEWS) {
    const user = users.get(review.email);
    if (!user) continue;
    upsertReview(review.distro, user.id, review.rating, review.body);
    const timestamp = Date.now() - review.daysAgo * 86_400_000;
    db.prepare(
      "UPDATE reviews SET created_at = ?, updated_at = ? WHERE distro = ? AND user_id = ?",
    ).run(timestamp, timestamp, review.distro, user.id);
    reviewCount += 1;
  }

  const favorites = ["linux-mint", "fedora-workstation", "bazzite", "debian"];
  for (const slug of favorites) {
    if (!isFavorite(demo.id, slug)) toggleFavorite(demo.id, slug);
  }

  const userTotal = REVIEWERS.length + 1;
  console.log(`Готово: ${userTotal} пользователей, ${reviewCount} отзывов, ${favorites.length} избранных.`);
  console.log(`Демо-аккаунт: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
}

main();
