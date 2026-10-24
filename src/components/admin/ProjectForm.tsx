"use client";

import { useActionState, useState } from "react";
import { saveProject, type ActionState } from "@/lib/admin/actions";
import { AdminField, FormMessage, SubmitButton } from "./ui";
import { FILM_TYPES } from "@/lib/config/site";
import { slugify } from "@/lib/utils";
import type { Category, ProjectWithRelations } from "@/types";

interface Props {
  project?: ProjectWithRelations | null;
  categories: Category[];
}

export function ProjectForm({ project, categories }: Props) {
  const [state, action] = useActionState<ActionState, FormData>(saveProject, {});
  const [title, setTitle] = useState(project?.title ?? "");
  const [slug, setSlug] = useState(project?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(project));
  const d = state.data;
  const val = (k: keyof ProjectWithRelations) => (d?.[k as string] ?? (project?.[k] as string | null) ?? "") as string;
  const checked = (k: "is_featured" | "is_published") => (d ? d[k] === "on" : Boolean(project?.[k]));
  const gallery = d?.gallery ?? project?.images.map((i) => i.url).join("\n") ?? "";

  return (
    <form action={action} className="space-y-10" encType="multipart/form-data">
      {project && <input type="hidden" name="id" value={project.id} />}
      <FormMessage state={state} />

      <section className="grid gap-6 md:grid-cols-2">
        <h2 className="text-2xl md:col-span-2">Details</h2>
        <AdminField name="title" label="Project title" state={state} required>
          <input id="title" name="title" required className="field py-2.5 text-sm" value={title}
            onChange={(e) => { setTitle(e.target.value); if (!slugTouched) setSlug(slugify(e.target.value)); }}
            aria-invalid={state.fieldErrors?.title ? true : undefined} />
        </AdminField>
        <AdminField name="slug" label="URL slug" state={state} hint={<>Page address: /portfolio/<strong>{slug || "your-slug"}</strong></>}>
          <input id="slug" name="slug" className="field py-2.5 text-sm" value={slug} onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }} aria-invalid={state.fieldErrors?.slug ? true : undefined} />
        </AdminField>
        <AdminField name="category_id" label="Category" state={state} required>
          <select id="category_id" name="category_id" className="field py-2.5 text-sm" defaultValue={val("category_id")} key={val("category_id")} required>
            <option value="">Choose a category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}{c.is_visible ? "" : " (hidden)"}</option>)}
          </select>
        </AdminField>
        <AdminField name="location" label="Location" state={state} defaultValue={val("location")} placeholder="e.g. Raipur, Chhattisgarh" />
        <AdminField name="event_date" label="Event date (optional)" type="date" state={state} defaultValue={val("event_date")} />
        <AdminField name="sort_order" label="Display order" type="number" state={state} defaultValue={d?.sort_order ?? String(project?.sort_order ?? 0)} hint="Lower numbers appear first." />
        <AdminField name="description" label="Short description" state={state} defaultValue={val("description")} textarea rows={4} className="md:col-span-2" />
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <h2 className="text-2xl md:col-span-2">Media</h2>
        <AdminField
          name="cover_image_url"
          label="Cover image URL"
          state={state}
          defaultValue={val("cover_image_url")}
          className="md:col-span-2"
          hint="Paste a Google Drive file link (Share → Anyone with the link → Copy link) or any https image URL. Or upload a file below."
        />
        <AdminField name="cover_file" label="…or upload a cover image" state={state} className="md:col-span-2" hint="JPG, PNG, WebP or AVIF, up to 10 MB. Uploading replaces the URL above.">
          <input id="cover_file" name="cover_file" type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="block w-full text-sm text-mist file:mr-4 file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-xs file:uppercase file:tracking-[0.15em] file:text-ivory" />
        </AdminField>
        <AdminField
          name="gallery"
          label="Gallery image URLs (one per line)"
          state={state}
          defaultValue={gallery}
          textarea
          rows={8}
          className="md:col-span-2"
          hint="Each line is one photo, in display order. Drive file links work if the file is shared as “Anyone with the link”."
        />
        <AdminField
          name="drive_folder_url"
          label="Google Drive folder URL (optional)"
          state={state}
          defaultValue={val("drive_folder_url")}
          className="md:col-span-2"
          hint="Shown as a “View Full Gallery” button. Only add folders you are happy for visitors to open."
        />
        <AdminField name="video_url" label="Film URL (optional)" state={state} defaultValue={val("video_url")} hint="YouTube, Vimeo, or a direct .mp4 link." />
        <AdminField name="film_type" label="Film type" state={state}>
          <select id="film_type" name="film_type" className="field py-2.5 text-sm" defaultValue={val("film_type")} key={val("film_type")}>
            <option value="">Not a featured film</option>
            {FILM_TYPES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </AdminField>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl">Visibility</h2>
        <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="is_published" defaultChecked={checked("is_published")} className="h-4 w-4 accent-[#C5A572]" /> Published (visible on the website)</label>
        <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="is_featured" defaultChecked={checked("is_featured")} className="h-4 w-4 accent-[#C5A572]" /> Featured on the homepage</label>
        <label className="flex items-center gap-3 text-sm text-mist"><input type="checkbox" name="skip_link_check" className="h-4 w-4 accent-[#C5A572]" /> Skip link check (save even if links can&apos;t be verified right now)</label>
      </section>

      <div className="flex flex-wrap gap-3 border-t border-white/10 pt-6">
        <SubmitButton>{project ? "Save changes" : "Create project"}</SubmitButton>
      </div>
    </form>
  );
}
