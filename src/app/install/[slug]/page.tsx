import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDistro } from "@/data/distros";
import { getInstallGuide } from "@/data/install-guides";
import { InstallGuideView } from "@/components/install-guide";

export const dynamic = "force-static";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const distro = getDistro(slug);
  const guide = getInstallGuide(slug);
  if (!distro || !guide) return { title: "Гайд не найден" };
  return {
    title: `Установка ${distro.name}: пошаговый гайд`,
    description: `Как скачать, записать и установить ${distro.name} ${distro.version}: проверка образа, загрузка, разметка диска и первый запуск.`,
  };
}

export default async function InstallPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const distro = getDistro(slug);
  const guide = getInstallGuide(slug);
  if (!distro || !guide) notFound();

  return <InstallGuideView distro={distro} guide={guide} />;
}
