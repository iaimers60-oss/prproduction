"use client";

import { useActionState } from "react";
import { deleteCategory, saveCategory, type ActionState } from "@/lib/admin/actions";
import { AdminField, ConfirmSubmit, FormMessage, SubmitButton } from "./ui";
import type { Category } from "@/types";

export function CategoryForm({ category, nextOrder }: { category?: Category; nextOrder?: number }) {
  const [state, action] = useActionState<ActionState, FormData>(saveCategory, {});
  const [delState, delAction] = useActionState<ActionState, FormData>(deleteCategory, {});
  const id = category?.id ?? "new";
  const v = (k: string, fallback: string | number | null | undefined) => state.data?.[k] ?? String(fallback ?? "");
  return (
    <div className="space-y-3">
      <form action={action} className="grid gap-4 md:grid-cols-[1.2fr_1fr_0.5fr_auto] md:items-end">
        {category && <input type="hidden" name="id" value={category.id} />}
        <AdminField id={`name-${id}`} name="name" label="Name" state={state} defaultValue={category?.name} required>
          <input id={`name-${id}`} name="name" defaultValue={v("name", category?.name)} key={v("name", category?.name)} required className="field py-2.5 text-sm" aria-label="Category name" />
        </AdminField>
        <AdminField id={`slug-${id}`} name="slug" label="Slug" state={state}>
          <input id={`slug-${id}`} name="slug" defaultValue={v("slug", category?.slug)} key={v("slug", category?.slug)} placeholder="auto from name" className="field py-2.5 text-sm" aria-label="Category slug" />
        </AdminField>
        <AdminField id={`order-${id}`} name="sort_order" label="Order" state={state}>
          <input id={`order-${id}`} name="sort_order" type="number" defaultValue={v("sort_order", category?.sort_order ?? nextOrder ?? 0)} className="field py-2.5 text-sm" aria-label="Display order" />
        </AdminField>
        <div className="flex items-center gap-4 pb-1">
          <label className="flex items-center gap-2 text-xs text-mist">
            <input type="checkbox" name="is_visible" defaultChecked={state.data ? state.data.is_visible === "on" : (category?.is_visible ?? true)} className="h-4 w-4 accent-[#C5A572]" /> Visible
          </label>
          <SubmitButton variant={category ? "outline" : "gold"}>{category ? "Save" : "Add"}</SubmitButton>
        </div>
        <AdminField id={`desc-${id}`} name="description" label="Description (optional)" state={state} className="md:col-span-4">
          <input id={`desc-${id}`} name="description" defaultValue={v("description", category?.description)} key={v("description", category?.description)} className="field py-2.5 text-sm" aria-label="Category description" />
        </AdminField>
      </form>
      <FormMessage state={state} />
      {category && (
        <form action={delAction}>
          <input type="hidden" name="id" value={category.id} />
          <ConfirmSubmit message={`Delete the category “${category.name}”?`}>Delete category</ConfirmSubmit>
          <div className="mt-2"><FormMessage state={delState} /></div>
        </form>
      )}
    </div>
  );
}
