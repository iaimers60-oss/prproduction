import Link from "next/link";
import { notFound } from "next/navigation";
import { Eye } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { deleteProject } from "@/lib/admin/actions";
import { PageHeader } from "@/components/admin/PageHeader";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { ConfirmSubmit } from "@/components/admin/ui";
import type { Category, ProjectWithRelations } from "@/types";

export const metadata = { title: "Edit project" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> };

export default async function EditProjectPage({ params, searchParams }: Props) {
  const { db } = await requireAdmin();
  const [{ id }, { saved }] = await Promise.all([params, searchParams]);
  const [{ data: project }, { data: categories }] = await Promise.all([
    db.from("portfolio_projects").select("*, category:portfolio_categories(*), images:portfolio_images(*)").eq("id", id).maybeSingle(),
    db.from("portfolio_categories").select("*").order("sort_order"),
  ]);
  if (!project) notFound();
  const p = project as ProjectWithRelations;
  p.images.sort((a, b) => a.sort_order - b.sort_order);

  return (
    <>
      <PageHeader
        title={p.title}
        description={p.is_published ? "Published" : "Draft — not visible on the website"}
        actions={
          <>
            <Link href={`/admin/projects/${p.id}/preview`} className="inline-flex items-center gap-2 border border-white/20 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] hover:border-gold"><Eye className="h-4 w-4" /> Preview</Link>
            {p.is_published && <a href={`/portfolio/${p.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center border border-white/20 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] hover:border-gold">View live</a>}
          </>
        }
      />
      {saved && <p role="status" className="mb-6 border border-gold/40 bg-gold/5 px-4 py-3 text-sm text-gold-soft">Project saved. The website updates within a minute.</p>}
      <ProjectForm project={p} categories={(categories ?? []) as Category[]} />
      <form action={deleteProject} className="mt-12 border-t border-red-400/20 pt-6">
        <input type="hidden" name="id" value={p.id} />
        <ConfirmSubmit message={`Delete “${p.title}”? This cannot be undone. Files in Google Drive are not affected.`}>Delete project</ConfirmSubmit>
      </form>
    </>
  );
}
