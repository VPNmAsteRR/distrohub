import { HomeContent } from "@/components/home-content";
import { useRatingStats } from "../store";

export default function HomePage() {
  const ratings = useRatingStats();
  return <HomeContent ratings={ratings} />;
}
