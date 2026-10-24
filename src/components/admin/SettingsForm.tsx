"use client";

import { useActionState } from "react";
import { saveSettings, type ActionState } from "@/lib/admin/actions";
import { AdminField, FormMessage, SubmitButton } from "./ui";
import type { SiteSettings } from "@/types";

const fileInput = "block w-full text-sm text-mist file:mr-4 file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-xs file:uppercase file:tracking-[0.15em] file:text-ivory";

function Upload({ name, label, state }: { name: string; label: string; state: ActionState }) {
  return (
    <AdminField name={name} label={label} state={state} hint="Optional. Uploading replaces the URL.">
      <input id={name} name={name} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className={fileInput} />
    </AdminField>
  );
}

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-6 border-b border-white/10 pb-10 md:grid-cols-2">
      <div className="md:col-span-2">
        <h2 className="text-2xl">{title}</h2>
        {desc && <p className="mt-1 text-sm text-mist">{desc}</p>}
      </div>
      {children}
    </section>
  );
}

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, action] = useActionState<ActionState, FormData>(saveSettings, {});
  const s = settings;

  return (
    <form action={action} className="space-y-10" encType="multipart/form-data">
      <FormMessage state={state} />

      <Section title="Brand" desc="Texts shown on the homepage and footer. The brand name is always PR Production.">
        <AdminField name="tagline" label="Tagline" state={state} defaultValue={s.tagline} />
        <AdminField name="brand_statement" label="Brand statement" state={state} defaultValue={s.brand_statement} />
        <AdminField name="location_statement" label="Location statement" state={state} defaultValue={s.location_statement} className="md:col-span-2" />
        <AdminField name="intro_heading" label="Homepage introduction heading" state={state} defaultValue={s.intro_heading} className="md:col-span-2" />
        <AdminField name="intro_text" label="Homepage introduction text" state={state} defaultValue={s.intro_text} textarea className="md:col-span-2" />
        <AdminField name="footer_text" label="Footer description" state={state} defaultValue={s.footer_text} textarea rows={2} className="md:col-span-2" />
      </Section>

      <Section title="Logo & homepage media" desc="Paste a Google Drive file link or https image URL, or upload a file.">
        <AdminField name="logo_url" label="Logo URL" state={state} defaultValue={s.logo_url} hint="Transparent PNG works best. Leave empty to use the typographic logo." />
        <Upload name="logo_file" label="Upload logo" state={state} />
        <AdminField name="hero_image_url" label="Hero image URL" state={state} defaultValue={s.hero_image_url} hint="Landscape, at least 2400px wide." />
        <Upload name="hero_file" label="Upload hero image" state={state} />
        <AdminField name="hero_video_url" label="Hero background video URL (optional)" state={state} defaultValue={s.hero_video_url} className="md:col-span-2" hint="A direct, muted .mp4 link (under ~8 MB) hosted on Supabase Storage or a CDN. YouTube links cannot be used as backgrounds. The hero image is used as the poster." />
        <AdminField name="intro_image_url" label="Introduction photo URL" state={state} defaultValue={s.intro_image_url} hint="Portrait orientation." />
        <Upload name="intro_file" label="Upload introduction photo" state={state} />
      </Section>

      <Section title="Contact" desc="Leave a field empty to hide it on the website. Nothing is shown until you add it.">
        <AdminField name="whatsapp_number" label="Business WhatsApp number" state={state} defaultValue={s.whatsapp_number} placeholder="+91 98765 43210" hint="Used by every WhatsApp button on the site." />
        <AdminField name="email" label="Business email" type="email" state={state} defaultValue={s.email} />
        <AdminField name="instagram_url" label="Instagram URL" state={state} defaultValue={s.instagram_url} placeholder="https://instagram.com/…" />
        <AdminField name="youtube_url" label="YouTube URL" state={state} defaultValue={s.youtube_url} placeholder="https://youtube.com/@…" />
        <AdminField name="address" label="Business address (optional)" state={state} defaultValue={s.address} textarea rows={3} className="md:col-span-2" />
      </Section>

      <Section title="Service areas & booking">
        <AdminField name="service_regions" label="Service regions (one per line)" state={state} defaultValue={s.service_regions.join("\n")} textarea rows={4} />
        <AdminField name="service_cities" label="Example cities you serve (one per line)" state={state} defaultValue={s.service_cities.join("\n")} textarea rows={4} hint="Only list cities you are ready to serve, e.g. Raipur, Bilaspur, Nagpur." />
        <AdminField name="budget_ranges" label="Budget range options (one per line)" state={state} defaultValue={s.budget_ranges.join("\n")} textarea rows={6} className="md:col-span-2" hint="Shown as indicative options in the booking form, not as prices." />
      </Section>

      <Section title="Payment details" desc="Shown on the /payment page. Use only official details. Empty fields stay hidden.">
        <AdminField name="account_holder" label="Account holder name" state={state} defaultValue={s.account_holder} />
        <AdminField name="upi_id" label="UPI ID" state={state} defaultValue={s.upi_id} placeholder="name@bank" />
        <AdminField name="payment_qr_url" label="Official payment QR image URL" state={state} defaultValue={s.payment_qr_url} />
        <Upload name="qr_file" label="Upload official payment QR" state={state} />
        <AdminField name="bank_name" label="Bank name (optional)" state={state} defaultValue={s.bank_name} />
        <AdminField name="account_number" label="Account number (optional)" state={state} defaultValue={s.account_number} />
        <AdminField name="ifsc" label="IFSC (optional)" state={state} defaultValue={s.ifsc} />
        <AdminField name="support_whatsapp" label="Payment support WhatsApp (optional)" state={state} defaultValue={s.support_whatsapp} hint="Defaults to the business WhatsApp number." />
        <AdminField name="payment_instructions" label="Payment instructions" state={state} defaultValue={s.payment_instructions} textarea rows={4} className="md:col-span-2" />
      </Section>

      <div className="sticky bottom-0 -mx-4 border-t border-white/10 bg-ink/95 px-4 py-4 backdrop-blur sm:-mx-8 sm:px-8">
        <SubmitButton>Save settings</SubmitButton>
      </div>
    </form>
  );
}
