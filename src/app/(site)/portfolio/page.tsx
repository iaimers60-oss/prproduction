import type { Metadata } from "next";
import { PageHero } from "@/components/site/PageHero";
import { CtaSection } from "@/components/site/CtaSection";
import { PortfolioExplorer } from "@/components/portfolio/PortfolioExplorer";
import { DevNotice } from "@/components/ui/DevNotice";
import { getCategories, getPublishedProjects, getSettings } from "@/lib/data/public";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { DEFAULT_WHATSAPP_MESSAGE } from "@/lib/config/services";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Portfolio — Weddings, Pre-Weddings, Events & Films",
  description: "Explore wedding, pre-wedding, engagement, celebration, corporate, and commercial projects by PR Production.",
  alternates: { canonical: "/portfolio" },
};

export default async function PortfolioPage() {
  const [projects, categories, settings] = await Promise.all([getPublishedProjects(), getCategories(), getSettings()]);
  const hasSamples = projects.some((p) => p.is_sample);
  return (
    <>
      <PageHero eyebrow="Portfolio" title={<>Stories, <em className="italic text-gold-soft">Frame by Frame.</em></>} intro="Browse our work by category, or search for a project.">
        {hasSamples && (
          <div className="mt-8 max-w-xl">
            <DevNotice>The projects below are labelled samples. Connect Supabase and add real projects in Admin → Portfolio.</DevNotice>
          </div>
        )}
      </PageHero>
      <section className="pb-28">
        <div className="container-x">
          {projects.length ? (
            <PortfolioExplorer projects={projects} categories={categories} />
          ) : (
            <p className="py-20 text-center font-serif text-3xl text-mist">New projects are on their way.</p>
          )}
        </div>
      </section>
      <CtaSection whatsappUrl={buildWhatsAppUrl(settings.whatsapp_number, DEFAULT_WHATSAPP_MESSAGE)} />
    </>
  );
}
