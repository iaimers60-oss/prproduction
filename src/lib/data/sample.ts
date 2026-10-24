import type { Category, ProjectWithRelations } from "@/types";

/**
 * Built-in SAMPLE content, used only while Supabase is not configured.
 * These are not real PR Production projects. They render with a visible
 * "Sample" label and placeholder artwork instead of photographs.
 */

const cat = (name: string, slug: string, sort_order: number, description: string | null = null): Category => ({
  id: `sample-cat-${slug}`,
  name,
  slug,
  description,
  sort_order,
  is_visible: true,
});

export const SAMPLE_CATEGORIES: Category[] = [
  cat("Wedding", "wedding", 1, "Complete wedding stories, from rituals to reception."),
  cat("Traditional Wedding", "traditional-wedding", 2),
  cat("Candid Wedding", "candid-wedding", 3),
  cat("Pre-Wedding", "pre-wedding", 4, "Couple portraits and concept shoots before the big day."),
  cat("Engagement", "engagement", 5),
  cat("Haldi", "haldi", 6),
  cat("Mehendi", "mehendi", 7),
  cat("Sangeet", "sangeet", 8),
  cat("Reception", "reception", 9),
  cat("Wedding Cinematography", "wedding-cinematography", 10, "Highlight films and wedding features."),
  cat("Birthday", "birthday", 11),
  cat("Maternity", "maternity", 12),
  cat("Baby and Newborn", "baby-and-newborn", 13),
  cat("Corporate", "corporate", 14, "Conferences, offices, and corporate portraits."),
  cat("Events", "events", 15),
  cat("Commercial Shoots", "commercial-shoots", 16),
  cat("Brand Films", "brand-films", 17),
];

const byslug = (slug: string) => SAMPLE_CATEGORIES.find((c) => c.slug === slug)!;

const p = (
  n: number,
  title: string,
  catSlug: string,
  description: string,
  extra: Partial<ProjectWithRelations> = {},
): ProjectWithRelations => {
  const c = byslug(catSlug);
  const id = `sample-${n}`;
  return {
    id,
    title,
    slug: `sample-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-$/, "")}`,
    category_id: c.id,
    category: c,
    location: null,
    event_date: null,
    description,
    cover_image_url: null,
    drive_folder_url: null,
    video_url: null,
    film_type: null,
    is_featured: false,
    is_published: true,
    sort_order: n,
    created_at: "2026-01-01T00:00:00Z",
    is_sample: true,
    images: Array.from({ length: 6 }, (_, i) => ({
      id: `${id}-img-${i}`,
      project_id: id,
      url: "",
      alt: `${title} placeholder image ${i + 1}`,
      sort_order: i,
    })),
    ...extra,
  };
};

export const SAMPLE_PROJECTS: ProjectWithRelations[] = [
  p(1, "Wedding Story Placeholder", "wedding", "Replace this sample with a real wedding project from the admin dashboard.", { is_featured: true, film_type: "wedding-highlight" }),
  p(2, "Pre-Wedding Placeholder", "pre-wedding", "Replace this sample with a real pre-wedding shoot.", { is_featured: true, film_type: "pre-wedding" }),
  p(3, "Sangeet Night Placeholder", "sangeet", "Replace this sample with a real celebration.", { is_featured: true }),
  p(4, "Corporate Event Placeholder", "corporate", "Replace this sample with a real corporate project.", { is_featured: true, film_type: "event" }),
  p(5, "Haldi Ceremony Placeholder", "haldi", "Replace this sample with a real haldi ceremony.", { is_featured: true }),
  p(6, "Brand Film Placeholder", "brand-films", "Replace this sample with a real brand film.", { film_type: "brand" }),
  p(7, "Maternity Session Placeholder", "maternity", "Replace this sample with a real maternity session."),
  p(8, "Birthday Celebration Placeholder", "birthday", "Replace this sample with a real birthday shoot."),
  p(9, "Reception Placeholder", "reception", "Replace this sample with a real reception."),
  p(10, "Newborn Session Placeholder", "baby-and-newborn", "Replace this sample with a real newborn session."),
];
