import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "@/components/auth-forms";

export const metadata: Metadata = {
  title: "Вход",
  description: "Войдите в аккаунт DistroHub, чтобы сохранять избранные дистрибутивы и оставлять отзывы.",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : undefined;

  return (
    <AuthShell
      mode="login"
      eyebrow="Вход"
      title="Войти в аккаунт"
      subtitle="Избранное и ваши отзывы синхронизируются между устройствами."
      footer={
        <div className="border border-line bg-surface2/60 p-4">
          <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-muted">
            Демо-доступ для проверки
          </p>
          <p className="mt-1.5 font-mono text-xs text-ink">demo@distrohub.ru</p>
          <p className="font-mono text-xs text-ink">demo12345</p>
          <p className="mt-2 text-[0.7rem] leading-relaxed text-muted">
            Тестовый аккаунт: проверьте вход, избранное и форму отзыва.
          </p>
        </div>
      }
    >
      <LoginForm next={next} />

      <div className="mt-6 flex items-center justify-between border-t border-line pt-4 text-[0.7rem] text-muted">
        <Link href="/wizard" className="hover:text-ink">
          Подобрать дистрибутив без аккаунта
        </Link>
        <Link href="/about" className="hover:text-ink">
          Зачем аккаунт?
        </Link>
      </div>
    </AuthShell>
  );
}
