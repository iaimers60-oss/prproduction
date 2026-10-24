import "server-only";
import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import { DEFAULT_SETTINGS } from "@/lib/config/site";
import { SAMPLE_CATEGORIES, SAMPLE_PROJECTS } from "./sample";
import type { Category, ProjectWithRelations, SiteSettings, Testimonial } from "@/types";

/**
 * Public data access. When Supabase is configured, everything comes from the
 * database (RLS returns only published rows). Otherwise clearly-labelled
 * sample content is used so the site can be previewed.
 */

const PROJECT_SELECT = "*, category:portfolio_categories(*), images:portfolio_images(*)";

function sortImages(p: ProjectWithRelations): ProjectWithRelations {
  return { ...p, images: [...(p.images ?? [])].sort((a, b) => a.sort_order - b.sort_order) };
}

export const getSettings = cache(async (): Promise<SiteSettings> => {
  const db = createPublicClient();
  if (!db) return DEFAULT_SETTINGS;
  const { data, error } = await db.from("website_settings").select("*").eq("id", 1).maybeSingle();
  if (error || !data) return DEFAULT_SETTINGS;
  const merged = { ...DEFAULT_SETTINGS };
  for (const key of Object.keys(DEFAULT_SETTINGS) as (keyof SiteSettings)[]) {
    const v = (data as Record<string, unknown>)[key];
    if (v !== null && v !== undefined && v !== "") (merged as Record<string, unknown>)[key] = v;
  }
  return merged;
});

export const getCategories = cache(async (): Promise<Category[]> => {
  const db = createPublicClient();
  if (!db) return SAMPLE_CATEGORIES;
  const { data } = await db.from("portfolio_categories").select("*").eq("is_visible", true).order("sort_order");
  return (data as Category[]) ?? [];
});

export const getPublishedProjects = cache(async (): Promise<ProjectWithRelations[]> => {
  const db = createPublicClient();
  if (!db) return SAMPLE_PROJECTS;
  const { data } = await db
    .from("portfolio_projects")
    .select(PROJECT_SELECT)
    .eq("is_published", true)
    .order("sort_order")
    .order("created_at", { ascending: false });
  return ((data as ProjectWithRelations[]) ?? []).map(sortImages);
});

export async function getFeaturedProjects(limit = 5) {
  const all = await getPublishedProjects();
  const featured = all.filter((p) => p.is_featured);
  return (featured.length ? featured : all).slice(0, limit);
}

export async function getProjectBySlug(slug: string) {
  const all = await getPublishedProjects();
  return all.find((p) => p.slug === slug) ?? null;
}

export async function getProjectsByCategory(slug: string) {
  const all = await getPublishedProjects();
  return all.filter((p) => p.category?.slug === slug);
}

export async function getRelatedProjects(project: ProjectWithRelations, limit = 3) {
  const all = await getPublishedProjects();
  const others = all.filter((p) => p.id !== project.id);
  const same = others.filter((p) => p.category_id === project.category_id);
  return [...same, ...others.filter((p) => p.category_id !== project.category_id)].slice(0, limit);
}

export async function getFilms() {
  const all = await getPublishedProjects();
  return all.filter((p) => p.video_url || (p.is_sample && p.film_type));
}

export const getTestimonials = cache(async (): Promise<Testimonial[]> => {
  const db = createPublicClient();
  if (!db) return [];
  const { data } = await db.from("testimonials").select("*").eq("is_published", true).order("sort_order");
  return (data as Testimonial[]) ?? [];
});

/** Cover image for each service, taken from the newest real project in its category. */
export async function getServiceImages(): Promise<Record<string, string | null>> {
  const { SERVICES } = await import("@/lib/config/services");
  const all = await getPublishedProjects();
  return Object.fromEntries(
    SERVICES.map((s) => [s.slug, all.find((p) => p.category?.slug === s.categorySlug && p.cover_image_url)?.cover_image_url ?? null]),
  );
}
