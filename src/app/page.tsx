import { allSummaries } from "@/lib/db";
import { HomeContent } from "@/components/home-content";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const summaries = allSummaries();
  const ratings = Object.fromEntries(
    Object.entries(summaries).map(([slug, summary]) => [
      slug,
      { average: summary.average, count: summary.count },
    ]),
  );

  return <HomeContent ratings={ratings} />;
}
