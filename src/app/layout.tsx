import type { Metadata, Viewport } from "next";
import "./fonts.css";
import "./globals.css";
import "./field-guide.css";
import "./orbit.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SessionProvider } from "@/components/session-provider";
import { CommandPalette } from "@/components/command-palette";
import { MotionLayer } from "@/components/motion";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "DistroHub: каталог и навигатор по дистрибутивам Linux",
    template: "%s · DistroHub",
  },
  description:
    "Интерактивный каталог дистрибутивов Linux: фильтры по задачам и железу, сравнение, мастер подбора и гайды для переезда с Windows.",
  keywords: [
    "Linux",
    "дистрибутивы Linux",
    "каталог дистрибутивов",
    "выбрать Linux",
    "Ubuntu",
    "Linux Mint",
    "Fedora",
    "Arch Linux",
  ],
  authors: [{ name: "DistroHub" }],
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "/",
    siteName: "DistroHub",
    title: "DistroHub: каталог и навигатор по дистрибутивам Linux",
    description:
      "20 дистрибутивов, честное сравнение и подбор за минуту. Найдите Linux под свои задачи и железо.",
  },
  twitter: {
    card: "summary_large_image",
    title: "DistroHub: каталог дистрибутивов Linux",
    description: "Подбор, сравнение и гайды по Linux в одном месте.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3efe6" },
    { media: "(prefers-color-scheme: dark)", color: "#171411" },
  ],
  width: "device-width",
  initialScale: 1,
};

const themeScript = `(function(){try{var stored=localStorage.getItem('dh-theme');var dark=stored?stored==='dark':true;if(dark)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:shadow-lg"
        >
          Перейти к содержимому
        </a>
        <SessionProvider>
          <Header />
          <main id="content">{children}</main>
          <Footer />
          <CommandPalette />
          <MotionLayer />
        </SessionProvider>
      </body>
    </html>
  );
}
