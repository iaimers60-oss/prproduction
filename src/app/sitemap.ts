import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config/site";
import { getCategories, getPublishedProjects } from "@/lib/data/public";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, categories] = await Promise.all([getPublishedProjects(), getCategories()]);
  const now = new Date();
  const staticRoutes = ["", "/about", "/portfolio", "/services", "/films", "/booking", "/contact", "/payment", "/privacy-policy", "/terms"];
  return [
    ...staticRoutes.map((p) => ({ url: `${SITE_URL}${p}`, lastModified: now, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
    ...categories.map((c) => ({ url: `${SITE_URL}/portfolio/category/${c.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.6 })),
    ...projects
      .filter((p) => !p.is_sample)
      .map((p) => ({ url: `${SITE_URL}/portfolio/${p.slug}`, lastModified: new Date(p.created_at), changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
