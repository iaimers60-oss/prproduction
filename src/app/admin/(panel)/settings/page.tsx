import { requireAdmin } from "@/lib/admin/auth";
import { PageHeader } from "@/components/admin/PageHeader";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { DEFAULT_SETTINGS } from "@/lib/config/site";
import type { SiteSettings } from "@/types";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { db } = await requireAdmin();
  const { data } = await db.from("website_settings").select("*").eq("id", 1).maybeSingle();
  const settings = { ...DEFAULT_SETTINGS } as SiteSettings;
  for (const k of Object.keys(DEFAULT_SETTINGS) as (keyof SiteSettings)[]) {
    const v = (data as Record<string, unknown> | null)?.[k];
    if (v !== null && v !== undefined) (settings as unknown as Record<string, unknown>)[k] = v;
  }
  return (
    <>
      <PageHeader title="Website settings" description="Contact details, payment information, media, and copy used across the website. Homepage featured projects are chosen with the ★ in Portfolio." />
      <SettingsForm settings={settings} />
    </>
  );
}
