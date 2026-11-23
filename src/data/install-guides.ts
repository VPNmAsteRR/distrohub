export interface InstallStep {
  title: string;
  text: string;
  code?: string;
}

export interface InstallGuide {
  slug: string;
  label: string;
  iso: string;
  size: string;
  time: string;
  writer: string;
  bootKey: string;
  checksum: string;
  steps: InstallStep[];
  after: string[];
  trap: string;
  related: string;
}

/**
 * Per-distro install runbook. The download deck reads this to build the
 * slide-out guide, the /install/[slug] page renders the long form.
 */
export const INSTALL_GUIDES: InstallGuide[] = [
  {
    slug: "ubuntu",
    label: "Ubuntu 26.04.1 LTS",
    iso: "ubuntu-26.04.1-desktop-amd64.iso",
    size: "около 7 ГБ",
    time: "20 минут на запись, 15 на установку",
    writer: "Ventoy, Rufus или balenaEtcher",
    bootKey: "F12, F11 или Esc при старте",
    checksum: "sha256sum ubuntu-26.04.1-desktop-amd64.iso",
    steps: [
      {
        title: "Проверьте образ",
        text: "Скачайте SHA256SUMS с releases.ubuntu.com и сверьте хеш. Расхождение значит битую загрузку, а не редкий баг.",
        code: "sha256sum -c SHA256SUMS --ignore-missing",
      },
      {
        title: "Запишите флешку",
        text: "В Ventoy просто скопируйте ISO на раздел с данными. В Rufus выберите GPT и UEFI, файловая система FAT32.",
      },
      {
        title: "Загрузитесь с носителя",
        text: "Откройте меню загрузки клавишей F12 или F11, выберите флешку в режиме UEFI. В меню GRUB выберите Try Ubuntu, чтобы проверить Wi-Fi и звук до установки.",
      },
      {
        title: "Установка",
        text: "Мастер спросит раскладку, сеть и тип установки. Для чистой системы берите Erase disk; для соседства с Windows сначала освободите место в самом Windows.",
      },
      {
        title: "Первый запуск",
        text: "Обновите пакеты и включите Flatpak, если нужен свежий софт вне Snap.",
        code: "sudo apt update && sudo apt upgrade -y\nflatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo",
      },
    ],
    after: [
      "Проверьте драйвер NVIDIA командой ubuntu-drivers devices",
      "Включите шифрование диска до установки, а не после",
      "Snap можно отключить, но часть приложений Canonical зависит от него",
    ],
    trap: "Установщик по умолчанию форматирует весь диск. Если рядом живёт Windows, выбирайте «Установить рядом» или ручную разметку.",
    related: "zapis-iso-na-fleshku",
  },
  {
    slug: "linux-mint",
    label: "Linux Mint 22.3",
    iso: "linuxmint-22.3-cinnamon-64bit.iso",
    size: "около 3 ГБ",
    time: "15 минут на запись, 12 на установку",
    writer: "Ventoy или Rufus",
    bootKey: "F12, F9 или Esc",
    checksum: "sha256sum linuxmint-22.3-cinnamon-64bit.iso",
    steps: [
      {
        title: "Возьмите Cinnamon",
        text: "Для первого знакомства берите редакцию Cinnamon. MATE и Xfce нужны только на слабом железе или для очень старых привычек.",
      },
      {
        title: "Сверьте контрольную сумму",
        text: "На странице релиза лежит sha256sum.txt. Сверка занимает секунду и отсеивает повреждённые загрузки.",
        code: "sha256sum -c sha256sum.txt --ignore-missing",
      },
      {
        title: "Запись и загрузка",
        text: "Rufus в режиме GPT/UEFI, затем меню загрузки по F12. Secure Boot можно оставить включённым, Mint его поддерживает.",
      },
      {
        title: "Разметка",
        text: "Установщик предложит стереть диск или поставить рядом. Для ручной схемы нужны разделы / и swap, EFI создаётся автоматически.",
      },
      {
        title: "После установки",
        text: "Откройте Менеджер обновлений, поставьте последние обновления и проверьте драйверы в разделе Driver Manager.",
        code: "sudo apt update && sudo apt full-upgrade -y",
      },
    ],
    after: [
      "Timeshift включён по умолчанию, сделайте первый снимок сразу",
      "Flatpak уже настроен, Snap отсутствует намеренно",
      "Для NVIDIA выберите проприетарный драйвер в Driver Manager",
    ],
    trap: "Не устанавливайте Mint на раздел с включённым BitLocker без ключа восстановления: Windows попросит его после изменения загрузчика.",
    related: "dual-boot-windows-linux",
  },
  {
    slug: "zorin-os",
    label: "Zorin OS 18",
    iso: "Zorin-OS-18-Core-64-bit.iso",
    size: "около 3,5 ГБ",
    time: "15 минут на запись, 15 на установку",
    writer: "Ventoy или Rufus",
    bootKey: "F12 или F10",
    checksum: "sha256sum Zorin-OS-18-Core-64-bit.iso",
    steps: [
      {
        title: "Выберите редакцию",
        text: "Core бесплатна и подходит большинству. Pro платная и добавляет раскладки и приложения, но не меняет саму систему.",
      },
      {
        title: "Запишите носитель",
        text: "Rufus, GPT, UEFI. Zorin хорошо работает с Secure Boot, отключать его не нужно.",
      },
      {
        title: "Проверьте режим",
        text: "В загрузочном меню есть Try Zorin OS. Прогоните Wi-Fi, звук и масштабирование, если ноутбук с HiDPI.",
      },
      {
        title: "Установка",
        text: "Мастер предложит выбрать раскладку рабочего стола: Windows-подобную или macOS-подобную. Это можно поменять позже в Zorin Appearance.",
      },
      {
        title: "Настройка",
        text: "Обновите систему и проверьте, что нужные Windows-программы запускаются через встроенный Wine.",
        code: "sudo apt update && sudo apt upgrade -y",
      },
    ],
    after: [
      "Zorin Appearance меняет расположение панели и док",
      "Встроенный Wine не заменяет полноценный Proton для игр",
      "Для старых ПК есть редакция Lite на Xfce",
    ],
    trap: "Zorin OS Lite и Core имеют разные образы. Не перепутайте при скачивании, установщик не предложит выбор.",
    related: "pervye-30-minut-v-linux",
  },
  {
    slug: "pop-os",
    label: "Pop!_OS 24.04 LTS",
    iso: "pop-os_24.04_amd64_intel_XX.iso",
    size: "около 3 ГБ",
    time: "15 минут на запись, 12 на установку",
    writer: "Ventoy или Rufus",
    bootKey: "F12, F7 или Esc",
    checksum: "sha256sum pop-os_24.04_amd64_intel_XX.iso",
    steps: [
      {
        title: "Выберите образ под GPU",
        text: "Для NVIDIA берите сборку с драйвером, для AMD и Intel обычную. Это единственное реальное отличие образов.",
      },
      {
        title: "Запишите флешку",
        text: "Ventoy подходит, но Rufus надёжнее, если материнская плата капризна к UEFI.",
      },
      {
        title: "Загрузка",
        text: "Pop!_OS использует systemd-boot, поэтому меню загрузки выглядит иначе, чем у Ubuntu. Это нормально.",
      },
      {
        title: "Установка",
        text: "Мастер предложит Clean Install или Custom. Для шифрования выберите его сразу: позже включить LUKS без переустановки нельзя.",
      },
      {
        title: "Космический рабочий стол",
        text: "COSMIC настраивается через Settings, а обновления идут через Pop!_Shop и apt.",
        code: "sudo apt update && sudo apt full-upgrade -y",
      },
    ],
    after: [
      "Pop!_OS поставляет собственное ядро с патчами для ноутбуков System76",
      "Горячие клавиши для тайлинга включены из коробки",
      "Для старых релизов доступен GNOME-сеанс",
    ],
    trap: "Образ intel и образ nvidia не взаимозаменяемы: на NVIDIA без проприетарного образа установка упрётся в чёрный экран.",
    related: "ustanovka-drayverov-nvidia",
  },
  {
    slug: "fedora-workstation",
    label: "Fedora Workstation 44",
    iso: "Fedora-Workstation-Live-x86_64-44-1.1.iso",
    size: "около 2,5 ГБ",
    time: "12 минут на запись, 10 на установку",
    writer: "Fedora Media Writer, Ventoy",
    bootKey: "F12 или F8",
    checksum: "sha256sum Fedora-Workstation-Live-x86_64-44-1.1.iso",
    steps: [
      {
        title: "Fedora Media Writer",
        text: "Родная утилита сама скачает образ и проверит подпись. Это самый короткий путь без ручной сверки хешей.",
      },
      {
        title: "Загрузка",
        text: "Secure Boot поддерживается официальными образами, отключать его не нужно. В меню GRUB выберите Start Fedora-Workstation-Live.",
      },
      {
        title: "Установщик Anaconda",
        text: "Он не похож на Ubuntu: сначала выберите диск и схему разметки на главном экране, потом нажмите Begin Installation.",
      },
      {
        title: "Шифрование",
        text: "Включите Encrypt my data на этапе разметки. Fedora использует LUKS2 и требует пароль при каждой загрузке.",
      },
      {
        title: "Первые пакеты",
        text: "RPM Fusion нужен для кодеков и проприетарных драйверов, без него часть медиа не заведётся.",
        code: "sudo dnf upgrade --refresh -y\nsudo dnf install https://mirrors.rpmfusion.org/free/fedora/rpmfusion-free-release-$(rpm -E %fedora).noarch.rpm",
      },
    ],
    after: [
      "dnf автоматически удаляет старые ядра, отдельная чистка не нужна",
      "Toolbox и Podman предустановлены для контейнеров",
      "Для NVIDIA: rpmfusion-nonfree и akmod-nvidia",
    ],
    trap: "Anaconda не ставит систему, пока не нажать Begin Installation. Экран разметки легко принять за финальный шаг.",
    related: "pervye-30-minut-v-linux",
  },
  {
    slug: "debian",
    label: "Debian 13.7",
    iso: "debian-13.7.0-amd64-DVD-1.iso",
    size: "около 4 ГБ DVD",
    time: "20 минут на запись, 20 на установку",
    writer: "Ventoy или Rufus",
    bootKey: "F12 или Esc",
    checksum: "sha256sum debian-13.7.0-amd64-DVD-1.iso",
    steps: [
      {
        title: "Возьмите live-образ",
        text: "Для настольного ПК проще debian-live с GNOME или KDE. DVD-образ нужен, если интернета при установке нет.",
      },
      {
        title: "Проверьте подпись",
        text: "Debian публикует SHA512SUMS и подпись. Для одноразовой установки хватит сверки хеша.",
        code: "sha512sum -c SHA512SUMS --ignore-missing",
      },
      {
        title: "Установка",
        text: "Классический установщик спросит про root-пароль и отдельного пользователя. Не оставляйте root без пароля.",
      },
      {
        title: "Прошивки",
        text: "Официальные образы включают non-free firmware с Debian 12. Если Wi-Fi не виден, проверьте, что скачали образ с firmware.",
      },
      {
        title: "Репозитории",
        text: "Добавьте contrib и non-free, если нужны драйверы и кодеки.",
        code: "sudo apt update\nsudo apt install firmware-linux firmware-iwlwifi",
      },
    ],
    after: [
      "Debian стабилен, но софт в нём старше, чем в Ubuntu",
      "Backports дают свежие пакеты без перехода на testing",
      "Для новичка установщик суровее, чем у Mint",
    ],
    trap: "Debian не добавляет пользователя в sudo автоматически, если не отметить это в установщике. Проверьте группу sudo после первого входа.",
    related: "pervye-30-minut-v-linux",
  },
  {
    slug: "arch-linux",
    label: "Arch Linux, rolling",
    iso: "archlinux-2026.11.01-x86_64.iso",
    size: "около 1,2 ГБ",
    time: "15 минут на запись, от часа на установку",
    writer: "Ventoy или dd",
    bootKey: "F12 или F11",
    checksum: "sha256sum archlinux-2026.11.01-x86_64.iso",
    steps: [
      {
        title: "Запишите и загрузитесь",
        text: "Arch ставится вручную из консоли. Загрузитесь в UEFI-режиме, иначе загрузчик не встанет как ожидается.",
        code: "ls /sys/firmware/efi/efivars",
      },
      {
        title: "Сеть и время",
        text: "Проверьте соединение и синхронизируйте часы. Без сети pacstrap не поставит базовую систему.",
        code: "iwctl station wlan0 connect SSID\nping -c 3 archlinux.org\ntimedatectl set-ntp true",
      },
      {
        title: "Разметка",
        text: "Создайте EFI-раздел, корень и при желании swap. Для LUKS сначала настройте шифрование, потом файловую систему.",
        code: "fdisk -l\nmkfs.fat -F32 /dev/nvme0n1p1\nmkfs.ext4 /dev/nvme0n1p2\nmount /dev/nvme0n1p2 /mnt\nmount --mkdir /dev/nvme0n1p1 /mnt/boot",
      },
      {
        title: "Базовая система",
        text: "pacstrap ставит ядро и пакеты, genfstab переносит разметку в новую систему.",
        code: "pacstrap -K /mnt base linux linux-firmware nano networkmanager\narch-chroot /mnt",
      },
      {
        title: "Загрузчик и пользователь",
        text: "Для UEFI проще всего GRUB, для systemd-boot нужна ручная настройка. Не забудьте пароль root и обычного пользователя.",
        code: "pacman -S grub efibootmgr\n grub-install --target=x86_64-efi --efi-directory=/boot --bootloader-id=GRUB\ngrub-mkconfig -o /boot/grub/grub.cfg",
      },
    ],
    after: [
      "Включите multilib, если нужны 32-битные библиотеки для Steam",
      "AUR не входит в систему, поставьте yay или paru отдельно",
      "Читайте новости Arch перед крупным обновлением",
    ],
    trap: "Arch не прощает пропущенных шагов. Если забыть mkinitcpio или загрузчик, система не стартует, и это не баг дистрибутива.",
    related: "zapis-iso-na-fleshku",
  },
  {
    slug: "manjaro",
    label: "Manjaro, rolling",
    iso: "manjaro-kde-26.0-261101-linux612.iso",
    size: "около 3,5 ГБ",
    time: "15 минут на запись, 15 на установку",
    writer: "Ventoy или Rufus",
    bootKey: "F12 или F11",
    checksum: "sha256sum manjaro-kde-26.0-261101-linux612.iso",
    steps: [
      {
        title: "Выберите редакцию",
        text: "KDE Plasma самая дружелюбная, Xfce легче, GNOME ближе к Ubuntu. Образы отличаются только окружением.",
      },
      {
        title: "Загрузка",
        text: "Manjaro использует Calamares. Загрузитесь в UEFI, Secure Boot обычно требует отключения.",
      },
      {
        title: "Установка",
        text: "Calamares предложит выбрать диск, файловую систему и загрузчик. Оставьте ext4 или btrfs, если не уверены.",
      },
      {
        title: "Обновления",
        text: "Manjaro обновляется через pamac, но терминал надёжнее. Первое обновление лучше делать до установки программ.",
        code: "sudo pacman -Syu",
      },
      {
        title: "AUR",
        text: "Включите поддержку AUR в pamac и поставьте yay для терминала.",
        code: "sudo pacman -S --needed git base-devel\ngit clone https://aur.archlinux.org/yay.git && cd yay && makepkg -si",
      },
    ],
    after: [
      "Manjaro задерживает пакеты Arch на несколько дней для стабильности",
      "Timeshift с btrfs спасает после неудачных обновлений",
      "Форум Manjaro отвечает быстро, но проверяйте даты тем",
    ],
    trap: "Manjaro не является Arch. Команды из Arch Wiki работают не всегда, особенно для ядра и загрузчика.",
    related: "pervye-30-minut-v-linux",
  },
  {
    slug: "opensuse-tumbleweed",
    label: "openSUSE Tumbleweed",
    iso: "openSUSE-Tumbleweed-DVD-x86_64-Current.iso",
    size: "около 4 ГБ",
    time: "20 минут на запись, 20 на установку",
    writer: "Ventoy или Rufus",
    bootKey: "F12 или Esc",
    checksum: "sha256sum openSUSE-Tumbleweed-DVD-x86_64-Current.iso",
    steps: [
      {
        title: "Скачайте Current",
        text: "Файл Current всегда указывает на свежий снапшот. Отдельные сборки не нужны.",
      },
      {
        title: "Установщик",
        text: "openSUSE ставит по умолчанию Btrfs с снапшотами. Это удобно для откатов, но следите за свободным местом.",
      },
      {
        title: "Разметка",
        text: "Для двойной загрузки установщик аккуратно уменьшает раздел Windows. Всё равно сделайте резервную копию.",
      },
      {
        title: "Обновления",
        text: "Tumbleweed обновляется через zypper dup, а не через обычный upgrade.",
        code: "sudo zypper refresh\nsudo zypper dup",
      },
      {
        title: "Кодеки",
        text: "Мультимедиа и проприетарные драйверы подключаются через Packman и репозиторий NVIDIA.",
        code: "sudo zypper addrepo --refresh https://ftp.gwdg.de/pub/linux/misc/packman/suse/openSUSE_Tumbleweed/ packman\nsudo zypper dup --from packman",
      },
    ],
    after: [
      "snapper list показывает снапшоты, откат делается из загрузчика",
      "YaST остаётся лучшим способом настроить сеть и репозитории",
      "Rolling-ветка стабильнее, чем принято думать, но обновляйтесь регулярно",
    ],
    trap: "zypper dup без Packman может сломать кодеки. Подключите Packman до установки медиаплееров.",
    related: "pervye-30-minut-v-linux",
  },
  {
    slug: "almalinux",
    label: "AlmaLinux 10.2",
    iso: "AlmaLinux-10.2-x86_64-dvd.iso",
    size: "около 2 ГБ",
    time: "15 минут на запись, 15 на установку",
    writer: "Ventoy или Rufus",
    bootKey: "F12 или F11",
    checksum: "sha256sum AlmaLinux-10.2-x86_64-dvd.iso",
    steps: [
      {
        title: "Это серверная система",
        text: "AlmaLinux повторяет RHEL. Для домашнего ПК берите редакцию с GNOME, если очень нужно, но проще Ubuntu.",
      },
      {
        title: "Загрузка",
        text: "Secure Boot поддерживается, UEFI обязателен для новых серверов. Старые BIOS работают, но ограниченно.",
      },
      {
        title: "Установка",
        text: "Anaconda спросит диск, сеть и пароль root. Создайте пользователя с правами sudo, иначе придётся входить под root.",
      },
      {
        title: "Подписки",
        text: "AlmaLinux бесплатен, подписка не нужна. Репозитории уже включены.",
      },
      {
        title: "База",
        text: "Обновите систему и включите EPEL, если нужны пакеты вне RHEL.",
        code: "sudo dnf upgrade -y\nsudo dnf install epel-release -y",
      },
    ],
    after: [
      "SELinux включён по умолчанию, не отключайте его без причины",
      "dnf module list помогает ставить разные версии PHP и Node",
      "Для контейнеров используйте podman, а не docker из сторонних репозиториев",
    ],
    trap: "AlmaLinux не про игры и свежие драйверы. Это серверная ветка с консервативными пакетами.",
    related: "pervye-30-minut-v-linux",
  },
  {
    slug: "rocky-linux",
    label: "Rocky Linux 10.2",
    iso: "Rocky-10.2-x86_64-dvd1.iso",
    size: "около 2 ГБ",
    time: "15 минут на запись, 15 на установку",
    writer: "Ventoy или Rufus",
    bootKey: "F12 или F11",
    checksum: "sha256sum Rocky-10.2-x86_64-dvd1.iso",
    steps: [
      {
        title: "Проверьте образ",
        text: "Rocky публикует CHECKSUM рядом с ISO. Сверка обязательна для серверной установки.",
      },
      {
        title: "Загрузка",
        text: "UEFI, Secure Boot включён. Загрузочное меню стандартное для RHEL-семейства.",
      },
      {
        title: "Anaconda",
        text: "Выберите диск, сеть и профиль безопасности. Для сервера включите только нужные порты в firewalld.",
      },
      {
        title: "Пользователи",
        text: "Создайте администратора и включите его в wheel. Отдельный root-пароль оставьте для аварийного доступа.",
        code: "usermod -aG wheel username",
      },
      {
        title: "Обновления",
        text: "После установки обновите базу и проверьте статус SELinux.",
        code: "sudo dnf upgrade -y\nsestatus",
      },
    ],
    after: [
      "Rocky и AlmaLinux почти идентичны, выбор чаще про сообщество",
      "EPEL нужен для многих утилит мониторинга",
      "Ядро консервативное, но стабильное",
    ],
    trap: "Не ставьте сторонние репозитории вроде remi без понимания зависимостей: они ломают обновления RHEL-ветки.",
    related: "pervye-30-minut-v-linux",
  },
  {
    slug: "alpine-linux",
    label: "Alpine Linux 3.24.3",
    iso: "alpine-standard-3.24.3-x86_64.iso",
    size: "около 250 МБ",
    time: "5 минут на запись, 10 на установку",
    writer: "Ventoy или dd",
    bootKey: "F12 или Esc",
    checksum: "sha256sum alpine-standard-3.24.3-x86_64.iso",
    steps: [
      {
        title: "Это не настольная система",
        text: "Alpine делают для контейнеров, роутеров и серверов. Графику можно поставить, но это отдельная работа.",
      },
      {
        title: "Загрузка",
        text: "Загрузитесь в режиме diskless и войдите как root без пароля. Сеть настраивается через setup-alpine.",
      },
      {
        title: "Установка",
        text: "setup-alpine проведёт по сети, диску и зеркалам. Для диска выберите sys, для флешки diskless.",
        code: "setup-alpine",
      },
      {
        title: "Пакеты",
        text: "Alpine использует apk и musl libc. Часть бинарников из других систем не запустится.",
        code: "apk update && apk upgrade\napk add nano curl",
      },
      {
        title: "Сервисы",
        text: "OpenRC вместо systemd. Сервисы включаются через rc-update.",
        code: "rc-update add sshd default\nrc-service sshd start",
      },
    ],
    after: [
      "Образы Alpine весят десятки мегабайт, отсюда популярность в Docker",
      "musl libc ломает совместимость с некоторыми драйверами и играми",
      "Документация в wiki.alpinelinux.org точнее сторонних постов",
    ],
    trap: "Не ставьте Alpine на домашний ПК с ожиданием GNOME из коробки. Это конструктор для тех, кто знает, зачем пришёл.",
    related: "pervye-30-minut-v-linux",
  },
  {
    slug: "ubuntu-server",
    label: "Ubuntu Server 26.04.1 LTS",
    iso: "ubuntu-26.04.1-live-server-amd64.iso",
    size: "около 3 ГБ",
    time: "15 минут на запись, 15 на установку",
    writer: "Ventoy или Rufus",
    bootKey: "F12 или F11",
    checksum: "sha256sum ubuntu-26.04.1-live-server-amd64.iso",
    steps: [
      {
        title: "Образ без графики",
        text: "Server-образ не содержит рабочего стола. Управление идёт по SSH или через консоль.",
      },
      {
        title: "Загрузка",
        text: "UEFI предпочтителен. Secure Boot поддерживается для подписанных ядер.",
      },
      {
        title: "Subiquity",
        text: "Установщик предложит сеть, SSH, диск и снапшоты. Настройте сеть сразу, иначе после перезагрузки не будет доступа.",
      },
      {
        title: "Диск",
        text: "Для LVM и шифрования выберите Custom storage. Для простого сервера хватит Use an entire disk без LVM.",
      },
      {
        title: "После установки",
        text: "Обновите пакеты и настройте firewall до открытия портов.",
        code: "sudo apt update && sudo apt upgrade -y\nsudo ufw allow OpenSSH\nsudo ufw enable",
      },
    ],
    after: [
      "SSH-ключи надёжнее паролей, настройте их сразу",
      "Landscape и Livepatch доступны в Ubuntu Pro",
      "Для Docker используйте официальный репозиторий, а не snap",
    ],
    trap: "Установщик может включить только IPv6 или неверный интерфейс, если сеть настроена автоматически. Проверьте ip a после первой загрузки.",
    related: "pervye-30-minut-v-linux",
  },
  {
    slug: "lubuntu",
    label: "Lubuntu 26.04 LTS",
    iso: "lubuntu-26.04-desktop-amd64.iso",
    size: "около 3 ГБ",
    time: "15 минут на запись, 12 на установку",
    writer: "Ventoy или Rufus",
    bootKey: "F12 или F11",
    checksum: "sha256sum lubuntu-26.04-desktop-amd64.iso",
    steps: [
      {
        title: "Лёгкий LXQt",
        text: "Lubuntu это Ubuntu с LXQt. Экономит память, но интерфейс проще, чем GNOME.",
      },
      {
        title: "Запись",
        text: "Rufus или Ventoy, GPT/UEFI. Secure Boot работает.",
      },
      {
        title: "Установка",
        text: "Мастер почти такой же, как у Ubuntu. Для слабого ПК отключите эффекты после установки.",
      },
      {
        title: "Оптимизация",
        text: "Проверьте автозапуск и уберите лишние службы. LXQt сам по себе нетребователен.",
        code: "sudo apt update && sudo apt upgrade -y\nsudo systemctl disable bluetooth",
      },
      {
        title: "Драйверы",
        text: "Для Wi-Fi и видео используйте Additional Drivers, как в Ubuntu.",
      },
    ],
    after: [
      "Lubuntu не требует 4 ГБ ОЗУ, но 2 ГБ уже тесно",
      "LXQt настраивается через LXQt Configuration Center",
      "Snap присутствует, но им можно не пользоваться",
    ],
    trap: "Lubuntu всё ещё тянет Snap-службы, поэтому «самый лёгкий Ubuntu» это не совсем правда. Для очень старого железа смотрите antiX.",
    related: "linux-na-starom-zheleze",
  },
  {
    slug: "xubuntu",
    label: "Xubuntu 26.04 LTS",
    iso: "xubuntu-26.04-desktop-amd64.iso",
    size: "около 3 ГБ",
    time: "15 минут на запись, 12 на установку",
    writer: "Ventoy или Rufus",
    bootKey: "F12 или F11",
    checksum: "sha256sum xubuntu-26.04-desktop-amd64.iso",
    steps: [
      {
        title: "Xfce без сюрпризов",
        text: "Xubuntu это Ubuntu с Xfce: меньше памяти, привычная панель, стабильные настройки.",
      },
      {
        title: "Запись и загрузка",
        text: "Стандартные Rufus и UEFI. Secure Boot поддерживается.",
      },
      {
        title: "Установка",
        text: "Мастер Ubuntu без изменений. Для двойной загрузки освободите место заранее.",
      },
      {
        title: "Настройка",
        text: "Панель настраивается через Panel Preferences, темы ставятся через Appearance.",
      },
      {
        title: "Обновления",
        text: "После установки обновите систему и включите Flatpak при необходимости.",
        code: "sudo apt update && sudo apt upgrade -y",
      },
    ],
    after: [
      "Xfce экономит около 300 МБ ОЗУ по сравнению с GNOME",
      "Композитор можно отключить для ещё большей экономии",
      "Плагины панели ставятся через apt",
    ],
    trap: "Xfce не любит смешивания тем GTK2 и GTK3, интерфейс может выглядеть пёстро. Ставьте одну тему на всё.",
    related: "linux-na-starom-zheleze",
  },
  {
    slug: "antix",
    label: "antiX 23.x",
    iso: "antiX-23.2_x64-full.iso",
    size: "около 1,5 ГБ",
    time: "10 минут на запись, 10 на установку",
    writer: "Ventoy, Rufus или dd",
    bootKey: "F12 или F11",
    checksum: "sha256sum antiX-23.2_x64-full.iso",
    steps: [
      {
        title: "Для очень старого железа",
        text: "antiX работает без systemd и запускается на машинах с 512 МБ ОЗУ. Это осознанный компромисс.",
      },
      {
        title: "Запись",
        text: "Образ небольшой, подойдёт и CD, и старая флешка. Rufus в режиме MBR, если BIOS древний.",
      },
      {
        title: "Загрузка",
        text: "В меню можно выбрать IceWM, Fluxbox или JWM. Начните с IceWM, он самый предсказуемый.",
      },
      {
        title: "Установка",
        text: "Установщик текстовый, но понятный. Разметку делайте вручную, если диск уже размечен.",
      },
      {
        title: "Настройка",
        text: "Сеть и звук настраиваются через antiX Control Centre.",
        code: "sudo apt update && sudo apt upgrade -y",
      },
    ],
    after: [
      "antiX использует SysVinit, а не systemd",
      "Пакеты Debian совместимы, но не все",
      "Для интернета на старом ПК нужен лёгкий браузер",
    ],
    trap: "Не ждите современного GNOME. antiX выбирают за скорость, а не за красоту.",
    related: "linux-na-starom-zheleze",
  },
  {
    slug: "puppy-linux",
    label: "Puppy Linux 9.x",
    iso: "puppy-9.6-fossapup64.iso",
    size: "около 500 МБ",
    time: "5 минут на запись, 5 на запуск",
    writer: "dd или Rufus",
    bootKey: "F12 или Esc",
    checksum: "sha256sum puppy-9.6-fossapup64.iso",
    steps: [
      {
        title: "Режим frugal",
        text: "Puppy чаще запускают с флешки или в frugal-режиме, а не ставят на диск. Система живёт в оперативной памяти.",
      },
      {
        title: "Запись",
        text: "dd подходит лучше всего, но можно и Rufus. Для UEFI нужен соответствующий образ.",
      },
      {
        title: "Первый запуск",
        text: "Выберите раскладку и сохраните сессию в файл на флешке, иначе все изменения пропадут после выключения.",
      },
      {
        title: "Пакеты",
        text: "Puppy использует собственный формат пакетов и репозитории. Не все программы из Debian встанут напрямую.",
      },
      {
        title: "Установка на диск",
        text: "Мастер установки есть, но для постоянной работы лучше взять полноценный дистрибутив.",
      },
    ],
    after: [
      "Система целиком помещается в ОЗУ, отсюда скорость",
      "Сохранение сессии критично, без него настройки исчезнут",
      "Для спасения данных с умершего ПК Puppy удобен",
    ],
    trap: "Puppy это не система на каждый день. Обновления и совместимость пакетов слабее, чем у Debian-ветки.",
    related: "linux-na-starom-zheleze",
  },
  {
    slug: "kali-linux",
    label: "Kali Linux 2026.3",
    iso: "kali-linux-2026.3-installer-amd64.iso",
    size: "около 4,5 ГБ",
    time: "20 минут на запись, 20 на установку",
    writer: "Ventoy или Rufus",
    bootKey: "F12 или F11",
    checksum: "sha256sum kali-linux-2026.3-installer-amd64.iso",
    steps: [
      {
        title: "Live или installer",
        text: "Для знакомства берите Live-образ. Installer нужен для постоянной системы с шифрованием.",
      },
      {
        title: "Запись",
        text: "Rufus и UEFI. Secure Boot придётся отключить, подписи для Kali нет.",
      },
      {
        title: "Установка",
        text: "Установщик Debian-типа. Для шифрования выберите Guided encrypted LVM.",
      },
      {
        title: "Первый вход",
        text: "В Live-образе пользователь kali и пароль kali. Смените его сразу после установки.",
        code: "passwd",
      },
      {
        title: "Инструменты",
        text: "Полный набор занимает десятки гигабайт. Ставьте только нужные метапакеты.",
        code: "sudo apt update\nsudo apt install kali-tools-wireless",
      },
    ],
    after: [
      "Kali не предназначен для повседневной работы под root",
      "Обновляйте систему часто, инструменты меняются",
      "Для тестов используйте изолированную сеть и разрешение",
    ],
    trap: "Kali по умолчанию не скрывает ваш трафик и не делает анонимным. Это инструмент, а не щит.",
    related: "pervye-30-minut-v-linux",
  },
  {
    slug: "tails",
    label: "Tails 7.15",
    iso: "tails-amd64-7.15.iso",
    size: "около 1,6 ГБ",
    time: "10 минут на запись, 3 на загрузку",
    writer: "официальный Tails Installer или dd",
    bootKey: "F12 или Esc",
    checksum: "sha256sum tails-amd64-7.15.iso",
    steps: [
      {
        title: "Не ставьте на диск",
        text: "Tails рассчитан на загрузку с флешки. Установка на внутренний диск ломает модель безопасности.",
      },
      {
        title: "Запишите образ",
        text: "Лучше официальный Tails Installer: он проверяет подпись и умеет обновлять флешку.",
      },
      {
        title: "Загрузка",
        text: "Отключите Secure Boot, если он блокирует неопознанный носитель. Tails предложит выбрать режим и пароль администратора.",
      },
      {
        title: "Постоянное хранилище",
        text: "Если нужно сохранять файлы между сессиями, включите Persistent Storage и задайте отдельную парольную фразу.",
      },
      {
        title: "Сеть",
        text: "Весь трафик идёт через Tor. Проверьте соединение через Tor Connection перед входом в почту.",
      },
    ],
    after: [
      "Tails не сохраняет историю без Persistent Storage",
      "Мост Tor помогает в сетях, где Tor заблокирован",
      "Для чувствительных данных используйте отдельную флешку",
    ],
    trap: "Tails не защищает, если вы входите в личный аккаунт и сами раскрываете личность. Анонимность зависит от привычек.",
    related: "pervye-30-minut-v-linux",
  },
  {
    slug: "bazzite",
    label: "Bazzite, rolling",
    iso: "bazzite-deck-stable.iso",
    size: "около 7 ГБ",
    time: "20 минут на запись, 15 на установку",
    writer: "Ventoy или официальный образ",
    bootKey: "F12 или F11",
    checksum: "sha256sum bazzite-deck-stable.iso",
    steps: [
      {
        title: "Выберите вариант",
        text: "Deck-образ для портативных консолей, Desktop для ПК. Они отличаются настройками и оболочкой.",
      },
      {
        title: "Запись",
        text: "Ventoy подходит, но для Steam Deck удобнее Rufus и карта памяти. Secure Boot поддерживается через подписанный загрузчик.",
      },
      {
        title: "Установка",
        text: "Установщик Fedora Atomic. Система ставится как образ, поэтому изменения вне /var и /etc не сохраняются.",
      },
      {
        title: "Игры",
        text: "Steam и Proton настроены, для сторонних лаунчеров используйте Flatpak или distrobox.",
        code: "rpm-ostree status",
      },
      {
        title: "Обновления",
        text: "Обновление целиком через rpm-ostree, откат доступен при загрузке.",
        code: "sudo rpm-ostree upgrade\nsystemctl reboot",
      },
    ],
    after: [
      "Система иммутабельна, сломать её сложнее",
      "Для модов и сторонних лаунчеров используйте контейнеры",
      "Steam Deck требует настроек TDP и контроллера, они уже включены",
    ],
    trap: "rpm-ostree не даёт ставить пакеты обычным dnf. Используйте Flatpak, distrobox или rpm-ostree install.",
    related: "pervye-30-minut-v-linux",
  },
];

export function getInstallGuide(slug: string): InstallGuide | undefined {
  return INSTALL_GUIDES.find((guide) => guide.slug === slug);
}
