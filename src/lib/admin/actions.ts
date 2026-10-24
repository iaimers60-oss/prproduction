"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/server";
import { requireAdmin } from "./auth";
import { checkDriveFolderAccessible, checkImageAccessible } from "./link-check";
import { categorySchema, paymentRequestSchema, projectSchema } from "@/lib/validation";
import { validateImageUrlFormat } from "@/lib/drive";
import { normalizeWhatsAppNumber } from "@/lib/whatsapp";
import { linesOf, slugify } from "@/lib/utils";
import { INQUIRY_STATUSES } from "@/lib/config/site";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface ActionState {
  ok?: boolean;
  error?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
  data?: Record<string, string>;
}

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const bool = (fd: FormData, k: string) => fd.get(k) === "on" || fd.get(k) === "true";

/** String fields of a submission, returned on error so the form can keep what was typed. */
function echo(fd: FormData): Record<string, string> {
  return Object.fromEntries([...fd.entries()].filter(([k, v]) => typeof v === "string" && !k.startsWith("$"))) as Record<string, string>;
}

function issuesToFields(issues: { path: PropertyKey[]; message: string }[]) {
  const out: Record<string, string> = {};
  for (const i of issues) out[String(i.path[0] ?? "form")] ??= i.message;
  return out;
}

function refreshSite() {
  revalidatePath("/", "layout");
}

const MAX_UPLOAD = 10 * 1024 * 1024;

async function uploadImage(db: SupabaseClient, file: FormDataEntryValue | null, folder: string): Promise<{ url?: string; error?: string }> {
  if (!(file instanceof File) || file.size === 0) return {};
  if (!file.type.startsWith("image/")) return { error: "Please upload an image file (JPG, PNG, WebP or AVIF)." };
  if (file.size > MAX_UPLOAD) return { error: "Image is larger than 10 MB. Please upload a smaller, web-optimised version." };
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${folder}/${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`;
  const { error } = await db.storage.from("media").upload(path, file, { contentType: file.type, upsert: false });
  if (error) return { error: `Upload failed: ${error.message}` };
  return { url: db.storage.from("media").getPublicUrl(path).data.publicUrl };
}

/* ─────────────── Auth ─────────────── */

export async function signIn(_: ActionState, fd: FormData): Promise<ActionState> {
  const db = await createSessionClient();
  if (!db) return { error: "Supabase is not configured yet. See the README to set it up." };
  const email = str(fd, "email");
  const password = String(fd.get("password") ?? "");
  const data = { email, next: str(fd, "next") };
  if (!email || !password) return { error: "Enter your email and password.", data };
  const { error } = await db.auth.signInWithPassword({ email, password });
  if (error) return { error: "Incorrect email or password.", data };
  const { data: isAdmin } = await db.rpc("is_admin");
  if (!isAdmin) {
    await db.auth.signOut();
    return { error: "This account is not authorised to access the PR Production admin.", data };
  }
  const next = str(fd, "next");
  redirect(next.startsWith("/admin") && !next.startsWith("/admin/login") ? next : "/admin");
}

export async function signOut() {
  const db = await createSessionClient();
  await db?.auth.signOut();
  redirect("/admin/login");
}

/* ─────────────── Projects ─────────────── */

export async function saveProject(_: ActionState, fd: FormData): Promise<ActionState> {
  const { db } = await requireAdmin();
  const id = str(fd, "id") || null;
  const title = str(fd, "title");
  const raw = {
    title,
    slug: str(fd, "slug") || slugify(title),
    category_id: str(fd, "category_id") || null,
    location: str(fd, "location"),
    event_date: str(fd, "event_date"),
    description: str(fd, "description"),
    cover_image_url: str(fd, "cover_image_url"),
    drive_folder_url: str(fd, "drive_folder_url"),
    video_url: str(fd, "video_url"),
    film_type: str(fd, "film_type"),
    is_featured: bool(fd, "is_featured"),
    is_published: bool(fd, "is_published"),
    sort_order: str(fd, "sort_order") || "0",
    gallery: linesOf(str(fd, "gallery")),
  };
  const data = echo(fd);

  const upload = await uploadImage(db, fd.get("cover_file"), "projects");
  if (upload.error) return { error: upload.error, fieldErrors: { cover_image_url: upload.error }, data };
  if (upload.url) raw.cover_image_url = upload.url;

  const parsed = projectSchema.safeParse(raw);
  const fieldErrors = parsed.success ? {} : issuesToFields(parsed.error.issues);
  const badGallery = raw.gallery
    .map((u, i) => ({ i, r: validateImageUrlFormat(u) }))
    .filter((x) => !x.r.ok)
    .map((x) => `Line ${x.i + 1}: ${(x.r as { error: string }).error}`);
  if (badGallery.length) fieldErrors.gallery = badGallery.slice(0, 5).join(" ");
  if (!parsed.success || badGallery.length) return { error: "Please fix the highlighted fields.", fieldErrors, data };

  const p = parsed.data;
  if (!bool(fd, "skip_link_check")) {
    const checks: Promise<void>[] = [];
    const errs: Record<string, string> = {};
    if (p.cover_image_url && !upload.url) checks.push(checkImageAccessible(p.cover_image_url).then((e) => { if (e) errs.cover_image_url = e; }));
    if (p.drive_folder_url) checks.push(checkDriveFolderAccessible(p.drive_folder_url).then((e) => { if (e) errs.drive_folder_url = e; }));
    const galleryErrors: string[] = [];
    p.gallery.slice(0, 40).forEach((u, i) => checks.push(checkImageAccessible(u).then((e) => { if (e) galleryErrors.push(`Line ${i + 1}: ${e}`); })));
    await Promise.all(checks);
    if (galleryErrors.length) errs.gallery = galleryErrors.slice(0, 5).join(" ");
    if (Object.keys(errs).length)
      return { error: "Some links could not be verified. Fix them, or tick “Skip link check” if you are sure they work.", fieldErrors: errs, data };
  }

  const { gallery, ...row } = p;
  let projectId = id;
  if (id) {
    const { error } = await db.from("portfolio_projects").update(row).eq("id", id);
    if (error) return { error: friendlyDbError(error.message), data };
  } else {
    const { data: created, error } = await db.from("portfolio_projects").insert(row).select("id").single();
    if (error) return { error: friendlyDbError(error.message), data };
    projectId = created.id;
  }

  // Replace gallery with the submitted list, keeping order.
  await db.from("portfolio_images").delete().eq("project_id", projectId!);
  if (gallery.length) {
    const { error } = await db
      .from("portfolio_images")
      .insert(gallery.map((url, i) => ({ project_id: projectId, url, sort_order: i, alt: `${p.title} — photo ${i + 1}` })));
    if (error) return { error: `Project saved, but gallery images failed: ${error.message}`, data };
  }

  refreshSite();
  redirect(`/admin/projects/${projectId}?saved=1`);
}

function friendlyDbError(msg: string) {
  if (msg.includes("duplicate key") && msg.includes("slug")) return "Another item already uses this slug. Choose a different one.";
  if (msg.includes("violates foreign key")) return "This item is still referenced elsewhere.";
  return `Could not save: ${msg}`;
}

export async function setProjectFlag(fd: FormData) {
  const { db } = await requireAdmin();
  const field = str(fd, "field");
  if (field !== "is_published" && field !== "is_featured") return;
  await db.from("portfolio_projects").update({ [field]: bool(fd, "value") }).eq("id", str(fd, "id"));
  refreshSite();
  revalidatePath("/admin/projects");
}

async function reorder(db: SupabaseClient, table: string, id: string, dir: "up" | "down") {
  const { data } = await db.from(table).select("id").order("sort_order").order("created_at", { ascending: false });
  const ids = (data ?? []).map((r) => r.id as string);
  const i = ids.indexOf(id);
  const j = dir === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= ids.length) return;
  [ids[i], ids[j]] = [ids[j], ids[i]];
  await Promise.all(ids.map((rid, idx) => db.from(table).update({ sort_order: (idx + 1) * 10 }).eq("id", rid)));
}

export async function moveProject(fd: FormData) {
  const { db } = await requireAdmin();
  await reorder(db, "portfolio_projects", str(fd, "id"), str(fd, "dir") === "up" ? "up" : "down");
  refreshSite();
  revalidatePath("/admin/projects");
}

export async function deleteProject(fd: FormData) {
  const { db } = await requireAdmin();
  await db.from("portfolio_projects").delete().eq("id", str(fd, "id"));
  refreshSite();
  redirect("/admin/projects?deleted=1");
}

/* ─────────────── Categories ─────────────── */

export async function saveCategory(_: ActionState, fd: FormData): Promise<ActionState> {
  const { db } = await requireAdmin();
  const id = str(fd, "id") || null;
  const name = str(fd, "name");
  const parsed = categorySchema.safeParse({
    name,
    slug: str(fd, "slug") || slugify(name),
    description: str(fd, "description"),
    sort_order: str(fd, "sort_order") || "0",
    is_visible: bool(fd, "is_visible"),
  });
  if (!parsed.success) return { error: "Please fix the highlighted fields.", fieldErrors: issuesToFields(parsed.error.issues), data: echo(fd) };
  const { error } = id
    ? await db.from("portfolio_categories").update(parsed.data).eq("id", id)
    : await db.from("portfolio_categories").insert(parsed.data);
  if (error) return { error: friendlyDbError(error.message), data: echo(fd) };
  refreshSite();
  revalidatePath("/admin/categories");
  return { ok: true, message: id ? "Category updated." : "Category added." };
}

export async function moveCategory(fd: FormData) {
  const { db } = await requireAdmin();
  await reorder(db, "portfolio_categories", str(fd, "id"), str(fd, "dir") === "up" ? "up" : "down");
  refreshSite();
  revalidatePath("/admin/categories");
}

export async function deleteCategory(_: ActionState, fd: FormData): Promise<ActionState> {
  const { db } = await requireAdmin();
  const id = str(fd, "id");
  const { count } = await db.from("portfolio_projects").select("id", { count: "exact", head: true }).eq("category_id", id);
  if (count && count > 0)
    return { error: `This category still has ${count} project${count === 1 ? "" : "s"}. Move them to another category first, or hide the category instead.`, data: echo(fd) };
  const { error } = await db.from("portfolio_categories").delete().eq("id", id);
  if (error) return { error: friendlyDbError(error.message), data: echo(fd) };
  refreshSite();
  revalidatePath("/admin/categories");
  return { ok: true, message: "Category deleted." };
}

/* ─────────────── Inquiries ─────────────── */

export async function updateInquiry(_: ActionState, fd: FormData): Promise<ActionState> {
  const { db } = await requireAdmin();
  const status = str(fd, "status");
  if (!INQUIRY_STATUSES.some((s) => s.value === status)) return { error: "Invalid status.", data: echo(fd) };
  const notes = str(fd, "internal_notes").slice(0, 5000) || null;
  const { error } = await db.from("booking_inquiries").update({ status, internal_notes: notes }).eq("id", str(fd, "id"));
  if (error) return { error: `Could not save: ${error.message}`, data: echo(fd) };
  revalidatePath("/admin/inquiries");
  revalidatePath("/admin");
  return { ok: true, message: "Inquiry updated." };
}

export async function deleteInquiry(fd: FormData) {
  const { db } = await requireAdmin();
  await db.from("booking_inquiries").delete().eq("id", str(fd, "id"));
  revalidatePath("/admin/inquiries");
  redirect("/admin/inquiries?deleted=1");
}

/* ─────────────── Payments ─────────────── */

function paymentReference() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(8);
  return "PR-" + Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

export async function createPaymentRequest(_: ActionState, fd: FormData): Promise<ActionState> {
  const { db } = await requireAdmin();
  const parsed = paymentRequestSchema.safeParse({
    client_name: str(fd, "client_name"),
    description: str(fd, "description"),
    amount_rupees: str(fd, "amount_rupees"),
    inquiry_id: str(fd, "inquiry_id"),
  });
  if (!parsed.success) return { error: "Please fix the highlighted fields.", fieldErrors: issuesToFields(parsed.error.issues), data: echo(fd) };
  const { amount_rupees, ...rest } = parsed.data;
  const reference = paymentReference();
  const { error } = await db.from("payment_records").insert({ ...rest, reference, amount_paise: Math.round(amount_rupees * 100) });
  if (error) return { error: `Could not create payment request: ${error.message}`, data: echo(fd) };
  revalidatePath("/admin/payments");
  return { ok: true, message: reference };
}

export async function cancelPayment(fd: FormData) {
  const { db } = await requireAdmin();
  await db.from("payment_records").update({ status: "cancelled" }).eq("id", str(fd, "id")).in("status", ["created", "pending", "failed"]);
  revalidatePath("/admin/payments");
}

/* ─────────────── Settings ─────────────── */

const TEXT_SETTINGS = [
  "tagline", "brand_statement", "location_statement", "intro_heading", "intro_text", "logo_url", "hero_image_url",
  "hero_video_url", "intro_image_url", "whatsapp_number", "email", "instagram_url", "youtube_url", "address",
  "footer_text", "account_holder", "upi_id", "bank_name", "account_number", "ifsc", "payment_instructions",
  "payment_qr_url", "support_whatsapp",
] as const;

export async function saveSettings(_: ActionState, fd: FormData): Promise<ActionState> {
  const { db } = await requireAdmin();
  const row: Record<string, string | string[] | null> = {};
  for (const k of TEXT_SETTINGS) row[k] = str(fd, k).slice(0, 4000) || null;
  row.service_regions = linesOf(str(fd, "service_regions"));
  row.service_cities = linesOf(str(fd, "service_cities"));
  row.budget_ranges = linesOf(str(fd, "budget_ranges"));

  const errors: Record<string, string> = {};
  for (const [field, folder] of [["logo_file", "logo"], ["qr_file", "payment"], ["hero_file", "hero"], ["intro_file", "intro"]] as const) {
    const up = await uploadImage(db, fd.get(field), folder);
    if (up.error) errors[field] = up.error;
    if (up.url) row[{ logo_file: "logo_url", qr_file: "payment_qr_url", hero_file: "hero_image_url", intro_file: "intro_image_url" }[field]] = up.url;
  }
  for (const k of ["whatsapp_number", "support_whatsapp"] as const) {
    if (row[k] && !normalizeWhatsAppNumber(row[k] as string)) errors[k] = "Enter a valid number with country code, e.g. +91 98765 43210.";
  }
  if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email as string)) errors.email = "Enter a valid email address.";
  for (const k of ["instagram_url", "youtube_url", "hero_video_url"] as const) {
    if (row[k] && !/^https:\/\//.test(row[k] as string)) errors[k] = "Links must start with https://.";
  }
  for (const k of ["logo_url", "hero_image_url", "intro_image_url", "payment_qr_url"] as const) {
    if (row[k]) {
      const r = validateImageUrlFormat(row[k] as string);
      if (!r.ok) errors[k] = r.error;
    }
  }
  if (row.ifsc && !/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(row.ifsc as string)) errors.ifsc = "IFSC should look like ABCD0123456.";
  if (row.upi_id && !/^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(row.upi_id as string)) errors.upi_id = "UPI ID should look like name@bank.";
  if (Object.keys(errors).length) return { error: "Please fix the highlighted fields.", fieldErrors: errors, data: echo(fd) };

  const { error } = await db.from("website_settings").update(row).eq("id", 1);
  if (error) return { error: `Could not save settings: ${error.message}`, data: echo(fd) };
  refreshSite();
  return { ok: true, message: "Settings saved. The website updates within a minute." };
}

/* ─────────────── Testimonials ─────────────── */

export async function saveTestimonial(_: ActionState, fd: FormData): Promise<ActionState> {
  const { db } = await requireAdmin();
  const id = str(fd, "id") || null;
  const row = {
    client_name: str(fd, "client_name").slice(0, 100),
    event_type: str(fd, "event_type").slice(0, 100) || null,
    review: str(fd, "review").slice(0, 1500),
    photo_url: str(fd, "photo_url") || null,
    is_published: bool(fd, "is_published"),
    sort_order: Number(str(fd, "sort_order")) || 0,
  };
  const errors: Record<string, string> = {};
  if (row.client_name.length < 2) errors.client_name = "Client name is required.";
  if (row.review.length < 10) errors.review = "Please enter the client's review.";
  if (row.photo_url) {
    const r = validateImageUrlFormat(row.photo_url);
    if (!r.ok) errors.photo_url = r.error;
  }
  if (Object.keys(errors).length) return { error: "Please fix the highlighted fields.", fieldErrors: errors, data: echo(fd) };
  const { error } = id ? await db.from("testimonials").update(row).eq("id", id) : await db.from("testimonials").insert(row);
  if (error) return { error: `Could not save: ${error.message}`, data: echo(fd) };
  refreshSite();
  revalidatePath("/admin/testimonials");
  return { ok: true, message: id ? "Testimonial updated." : "Testimonial added." };
}

export async function deleteTestimonial(fd: FormData) {
  const { db } = await requireAdmin();
  await db.from("testimonials").delete().eq("id", str(fd, "id"));
  refreshSite();
  revalidatePath("/admin/testimonials");
}
