"use client";

import { useActionState } from "react";
import { saveTestimonial, type ActionState } from "@/lib/admin/actions";
import { AdminField, FormMessage, SubmitButton } from "./ui";
import type { Testimonial } from "@/types";

export function TestimonialForm({ t }: { t?: Testimonial }) {
  const [state, action] = useActionState<ActionState, FormData>(saveTestimonial, {});
  const k = t?.id ?? "new";
  const v = (f: string, fallback: string | number | null | undefined) => state.data?.[f] ?? String(fallback ?? "");
  return (
    <form action={action} className="grid gap-4 md:grid-cols-2">
      {t && <input type="hidden" name="id" value={t.id} />}
      <AdminField id={`client_name-${k}`} name="client_name" label="Client name" state={state} required>
        <input id={`client_name-${k}`} name="client_name" defaultValue={v("client_name", t?.client_name)} key={v("client_name", t?.client_name)} required className="field py-2.5 text-sm" />
      </AdminField>
      <AdminField id={`event_type-${k}`} name="event_type" label="Event type" state={state}>
        <input id={`event_type-${k}`} name="event_type" defaultValue={v("event_type", t?.event_type)} key={v("event_type", t?.event_type)} className="field py-2.5 text-sm" placeholder="e.g. Wedding, Raipur" />
      </AdminField>
      <AdminField id={`review-${k}`} name="review" label="Review (as written by the client)" state={state} className="md:col-span-2" required>
        <textarea id={`review-${k}`} name="review" defaultValue={v("review", t?.review)} key={v("review", t?.review)} rows={4} required className="field py-2.5 text-sm" />
      </AdminField>
      <AdminField id={`photo_url-${k}`} name="photo_url" label="Approved photo URL (optional)" state={state}>
        <input id={`photo_url-${k}`} name="photo_url" defaultValue={v("photo_url", t?.photo_url)} key={v("photo_url", t?.photo_url)} className="field py-2.5 text-sm" />
      </AdminField>
      <AdminField id={`sort_order-${k}`} name="sort_order" label="Order" state={state}>
        <input id={`sort_order-${k}`} name="sort_order" type="number" defaultValue={v("sort_order", t?.sort_order ?? 0)} className="field py-2.5 text-sm" />
      </AdminField>
      <label className="flex items-center gap-2 text-sm md:col-span-2">
        <input type="checkbox" name="is_published" defaultChecked={state.data ? state.data.is_published === "on" : (t?.is_published ?? false)} className="h-4 w-4 accent-[#C5A572]" /> Published on the website
      </label>
      <div className="space-y-3 md:col-span-2">
        <FormMessage state={state} />
        <SubmitButton variant={t ? "outline" : "gold"}>{t ? "Save" : "Add testimonial"}</SubmitButton>
      </div>
    </form>
  );
}
