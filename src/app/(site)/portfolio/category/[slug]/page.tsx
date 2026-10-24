import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/site/PageHero";
import { CtaSection } from "@/components/site/CtaSection";
import { ProjectCard } from "@/components/portfolio/ProjectCard";
import { Reveal } from "@/components/ui/Reveal";
import { getCategories, getProjectsByCategory, getSettings } from "@/lib/data/public";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { DEFAULT_WHATSAPP_MESSAGE } from "@/lib/config/services";
import { cn } from "@/lib/utils";

export const revalidate = 60;

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getCategories()).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const category = (await getCategories()).find((c) => c.slug === slug);
  if (!category) return {};
  return {
    title: `${category.name} Photography & Films`,
    description: category.description ?? `${category.name} projects by PR Production.`,
    alternates: { canonical: `/portfolio/category/${slug}` },
  };
}

export default async function CategoryPage({ params }: Params) {
  const { slug } = await params;
  const [categories, projects, settings] = await Promise.all([getCategories(), getProjectsByCategory(slug), getSettings()]);
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  return (
    <>
      <PageHero eyebrow="Portfolio" title={category.name} intro={category.description ?? undefined}>
        <nav aria-label="Portfolio categories" className="-mx-5 mt-12 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          <Link href="/portfolio" className="shrink-0 border border-white/15 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-ivory/80 hover:border-gold hover:text-gold">
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/portfolio/category/${c.slug}`}
              aria-current={c.slug === slug ? "page" : undefined}
              className={cn(
                "shrink-0 whitespace-nowrap border px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em]",
                c.slug === slug ? "border-gold bg-gold text-ink" : "border-white/15 text-ivory/80 hover:border-gold hover:text-gold",
              )}
            >
              {c.name}
            </Link>
          ))}
        </nav>
      </PageHero>
      <section className="pb-28">
        <div className="container-x">
          {projects.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p, i) => (
                <Reveal key={p.id} delay={(i % 3) * 0.06}>
                  <ProjectCard project={p} priority={i < 3} />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="border border-white/10 py-20 text-center">
              <p className="font-serif text-3xl text-ivory">New {category.name.toLowerCase()} stories are coming soon.</p>
              <Link href="/portfolio" className="mt-6 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-gold">Browse all work →</Link>
            </div>
          )}
        </div>
      </section>
      <CtaSection whatsappUrl={buildWhatsAppUrl(settings.whatsapp_number, DEFAULT_WHATSAPP_MESSAGE)} />
    </>
  );
}
