import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { ProjectView } from "@/components/portfolio/ProjectView";
import { getSettings } from "@/lib/data/public";
import type { ProjectWithRelations } from "@/types";

export const metadata = { title: "Preview project" };

type Props = { params: Promise<{ id: string }> };

/** Renders a project exactly as visitors will see it, including drafts. */
export default async function PreviewProjectPage({ params }: Props) {
  const { db } = await requireAdmin();
  const { id } = await params;
  const { data } = await db.from("portfolio_projects").select("*, category:portfolio_categories(*), images:portfolio_images(*)").eq("id", id).maybeSingle();
  if (!data) notFound();
  const project = data as ProjectWithRelations;
  project.images.sort((a, b) => a.sort_order - b.sort_order);
  const settings = await getSettings();
  return (
    <div className="-mx-4 -my-8 sm:-mx-8 lg:-mx-12 lg:-my-12">
      <div className="sticky top-0 z-50 flex items-center justify-between gap-4 bg-gold px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-ink">
        <span>Preview{project.is_published ? "" : " · Draft (not public)"}</span>
        <Link href={`/admin/projects/${id}`} className="underline">Back to editing</Link>
      </div>
      <ProjectView project={project} related={[]} settings={settings} />
    </div>
  );
}
