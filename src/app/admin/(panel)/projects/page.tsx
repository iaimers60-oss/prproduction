import Link from "next/link";
import { ArrowDown, ArrowUp, Eye, Plus, Star } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { moveProject, setProjectFlag } from "@/lib/admin/actions";
import { PageHeader } from "@/components/admin/PageHeader";
import { SmartImage } from "@/components/ui/SmartImage";
import { cn } from "@/lib/utils";
import type { Category, Project } from "@/types";

export const metadata = { title: "Portfolio" };

type Props = { searchParams: Promise<{ deleted?: string; q?: string }> };

export default async function AdminProjects({ searchParams }: Props) {
  const { db } = await requireAdmin();
  const { deleted, q } = await searchParams;
  let query = db.from("portfolio_projects").select("*, category:portfolio_categories(name)").order("sort_order").order("created_at", { ascending: false });
  if (q) query = query.ilike("title", `%${q}%`);
  const { data } = await query;
  const projects = (data ?? []) as (Project & { category: Pick<Category, "name"> | null })[];

  return (
    <>
      <PageHeader
        title="Portfolio"
        description="Add, edit, publish, feature, and reorder projects. Lower order numbers appear first."
        actions={<Link href="/admin/projects/new" className="inline-flex items-center gap-2 bg-gold px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-ink"><Plus className="h-4 w-4" /> Add project</Link>}
      />
      {deleted && <p role="status" className="mb-6 border border-gold/40 bg-gold/5 px-4 py-3 text-sm text-gold-soft">Project deleted.</p>}
      <form className="mb-6 max-w-sm" role="search">
        <label htmlFor="q" className="sr-only">Search projects</label>
        <input id="q" name="q" defaultValue={q} placeholder="Search by title…" className="field py-2.5 text-sm" />
      </form>

      {projects.length === 0 ? (
        <div className="border border-dashed border-white/15 p-12 text-center">
          <p className="font-serif text-2xl">No projects {q ? "match your search" : "yet"}.</p>
          <Link href="/admin/projects/new" className="mt-4 inline-block text-sm text-gold underline">Add a project</Link>
        </div>
      ) : (
        <div className="overflow-x-auto border border-white/10">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-charcoal text-xs uppercase tracking-[0.15em] text-mist">
              <tr>
                <th scope="col" className="px-4 py-3">Project</th>
                <th scope="col" className="px-4 py-3">Category</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3">Featured</th>
                <th scope="col" className="px-4 py-3">Order</th>
                <th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {projects.map((p, i) => (
                <tr key={p.id} className="hover:bg-white/2">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="relative h-12 w-16 shrink-0 overflow-hidden bg-charcoal"><SmartImage src={p.cover_image_url} alt="" sizes="64px" width={200} placeholderLabel="" /></span>
                      <Link href={`/admin/projects/${p.id}`} className="font-medium text-ivory hover:text-gold">{p.title}</Link>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-mist">{p.category?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <form action={setProjectFlag}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="field" value="is_published" />
                      <input type="hidden" name="value" value={String(!p.is_published)} />
                      <button type="submit" className={cn("px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em]", p.is_published ? "bg-emerald-400/15 text-emerald-200" : "bg-white/10 text-mist")} title={p.is_published ? "Click to unpublish" : "Click to publish"}>
                        {p.is_published ? "Published" : "Draft"}
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <form action={setProjectFlag}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="field" value="is_featured" />
                      <input type="hidden" name="value" value={String(!p.is_featured)} />
                      <button type="submit" aria-label={p.is_featured ? "Remove from featured" : "Mark as featured"} className={p.is_featured ? "text-gold" : "text-white/25 hover:text-gold"}>
                        <Star className="h-5 w-5" fill={p.is_featured ? "currentColor" : "none"} />
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <form action={moveProject}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="dir" value="up" /><button disabled={i === 0} aria-label="Move up" className="p-1 text-mist hover:text-gold disabled:opacity-20"><ArrowUp className="h-4 w-4" /></button></form>
                      <form action={moveProject}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="dir" value="down" /><button disabled={i === projects.length - 1} aria-label="Move down" className="p-1 text-mist hover:text-gold disabled:opacity-20"><ArrowDown className="h-4 w-4" /></button></form>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-4 text-xs uppercase tracking-[0.12em]">
                      <Link href={`/admin/projects/${p.id}/preview`} className="inline-flex items-center gap-1 text-mist hover:text-gold"><Eye className="h-3.5 w-3.5" /> Preview</Link>
                      <Link href={`/admin/projects/${p.id}`} className="text-gold hover:text-gold-soft">Edit</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
