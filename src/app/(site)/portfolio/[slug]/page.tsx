import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectView } from "@/components/portfolio/ProjectView";
import { CtaSection } from "@/components/site/CtaSection";
import { JsonLd } from "@/components/site/JsonLd";
import { getProjectBySlug, getPublishedProjects, getRelatedProjects, getSettings } from "@/lib/data/public";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { DEFAULT_WHATSAPP_MESSAGE } from "@/lib/config/services";
import { BRAND, SITE_URL } from "@/lib/config/site";
import { toDisplayImageUrl } from "@/lib/drive";

export const revalidate = 60;

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getPublishedProjects()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  const image = toDisplayImageUrl(project.cover_image_url, 1200);
  const description =
    project.description?.slice(0, 155) ||
    `${project.title}${project.location ? ` in ${project.location}` : ""} — ${project.category?.name ?? "photography"} by ${BRAND}.`;
  return {
    title: project.title,
    description,
    alternates: { canonical: `/portfolio/${slug}` },
    openGraph: { title: `${project.title} | ${BRAND}`, description, ...(image ? { images: [{ url: image }] } : {}) },
    ...(project.is_sample ? { robots: { index: false } } : {}),
  };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();
  const [related, settings] = await Promise.all([getRelatedProjects(project), getSettings()]);
  const image = toDisplayImageUrl(project.cover_image_url, 1200);
  return (
    <>
      {!project.is_sample && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            name: project.title,
            url: `${SITE_URL}/portfolio/${project.slug}`,
            creator: { "@type": "Organization", name: BRAND },
            ...(project.description ? { description: project.description } : {}),
            ...(image ? { image } : {}),
            ...(project.location ? { locationCreated: { "@type": "Place", name: project.location } } : {}),
            ...(project.event_date ? { dateCreated: project.event_date } : {}),
          }}
        />
      )}
      <ProjectView project={project} related={related} settings={settings} />
      <CtaSection whatsappUrl={buildWhatsAppUrl(settings.whatsapp_number, DEFAULT_WHATSAPP_MESSAGE)} />
    </>
  );
}
