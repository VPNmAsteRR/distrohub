import { getDistro } from "@/data/distros";
import { getInstallGuide } from "@/data/install-guides";
import { InstallGuideView } from "@/components/install-guide";
import NotFound from "@/app/not-found";

export default function InstallPage({ params }: { params: { slug: string } }) {
  const distro = getDistro(params.slug);
  const guide = getInstallGuide(params.slug);
  if (!distro || !guide) return <NotFound />;
  return <InstallGuideView distro={distro} guide={guide} />;
}
