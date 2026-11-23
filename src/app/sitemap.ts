import type { MetadataRoute } from "next";
import { DISTROS } from "@/data/distros";
import { GUIDES } from "@/data/guides";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const updated = new Date("2026-10-29");

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified: updated, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/distros`, lastModified: updated, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/wizard`, lastModified: updated, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/compare`, lastModified: updated, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/guides`, lastModified: updated, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/about`, lastModified: updated, changeFrequency: "yearly", priority: 0.4 },
  ];

  const distroPages: MetadataRoute.Sitemap = DISTROS.map((distro) => ({
    url: `${siteUrl}/distros/${distro.slug}`,
    lastModified: updated,
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  const guidePages: MetadataRoute.Sitemap = GUIDES.map((guide) => ({
    url: `${siteUrl}/guides/${guide.slug}`,
    lastModified: new Date(guide.updated),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...distroPages, ...guidePages];
}
