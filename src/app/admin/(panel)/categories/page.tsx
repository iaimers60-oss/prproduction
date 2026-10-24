import { ArrowDown, ArrowUp } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { moveCategory } from "@/lib/admin/actions";
import { PageHeader } from "@/components/admin/PageHeader";
import { CategoryForm } from "@/components/admin/CategoryForms";
import type { Category } from "@/types";

export const metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const { db } = await requireAdmin();
  const [{ data }, { data: counts }] = await Promise.all([
    db.from("portfolio_categories").select("*").order("sort_order"),
    db.from("portfolio_projects").select("category_id"),
  ]);
  const categories = (data ?? []) as Category[];
  const countOf = (id: string) => (counts ?? []).filter((r) => r.category_id === id).length;

  return (
    <>
      <PageHeader title="Categories" description="Create, rename, reorder, or hide portfolio categories. Hidden categories are removed from public navigation. A category that still has projects cannot be deleted." />
      <section className="mb-12 border border-gold/30 bg-charcoal/60 p-6">
        <h2 className="mb-4 text-2xl">Add a category</h2>
        <CategoryForm nextOrder={(categories.at(-1)?.sort_order ?? 0) + 1} />
      </section>
      <ul className="space-y-4">
        {categories.map((c, i) => (
          <li key={c.id} className="border border-white/10 p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <p className="text-sm text-mist">
                <span className="font-serif text-xl text-ivory">{c.name}</span> · {countOf(c.id)} project{countOf(c.id) === 1 ? "" : "s"}{!c.is_visible && " · hidden"}
              </p>
              <div className="flex gap-1">
                <form action={moveCategory}><input type="hidden" name="id" value={c.id} /><input type="hidden" name="dir" value="up" /><button disabled={i === 0} aria-label={`Move ${c.name} up`} className="p-1 text-mist hover:text-gold disabled:opacity-20"><ArrowUp className="h-4 w-4" /></button></form>
                <form action={moveCategory}><input type="hidden" name="id" value={c.id} /><input type="hidden" name="dir" value="down" /><button disabled={i === categories.length - 1} aria-label={`Move ${c.name} down`} className="p-1 text-mist hover:text-gold disabled:opacity-20"><ArrowDown className="h-4 w-4" /></button></form>
              </div>
            </div>
            <CategoryForm category={c} />
          </li>
        ))}
      </ul>
    </>
  );
}
