import type { Metadata } from "next";
import { AuthShell } from "@/components/auth-shell";
import { RegisterForm } from "@/components/auth-forms";

export const metadata: Metadata = {
  title: "Регистрация",
  description: "Создайте аккаунт DistroHub: сохраняйте избранные дистрибутивы и делитесь опытом.",
  robots: { index: false, follow: false },
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : undefined;

  return (
    <AuthShell
      mode="register"
      eyebrow="Регистрация"
      title="Создать аккаунт"
      subtitle="Займёт полминуты. Почту не подтверждаем, письма не присылаем."
    >
      <RegisterForm next={next} />
    </AuthShell>
  );
}
