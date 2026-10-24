import Link from "next/link";
import { ArrowLeft, ExternalLink, MapPin, CalendarDays } from "lucide-react";
import { SmartImage } from "@/components/ui/SmartImage";
import { Reveal } from "@/components/ui/Reveal";
import { buttonClass } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { Gallery } from "./Gallery";
import { VideoEmbed } from "./VideoEmbed";
import { ProjectCard } from "./ProjectCard";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { SERVICES } from "@/lib/config/services";
import { formatDate } from "@/lib/utils";
import type { ProjectWithRelations, SiteSettings } from "@/types";

interface Props {
  project: ProjectWithRelations;
  related: ProjectWithRelations[];
  settings: SiteSettings;
}

export function ProjectView({ project, related, settings }: Props) {
  const date = formatDate(project.event_date);
  const service = SERVICES.find((s) => s.categorySlug === project.category?.slug);
  const whatsapp = buildWhatsAppUrl(
    settings.whatsapp_number,
    `Hello PR Production! I saw your project "${project.title}" on your website and would like a similar shoot. Please share the details.`,
  );
  const images = project.images.map((img, i) => ({ url: img.url, alt: img.alt || `${project.title} — photo ${i + 1}` }));

  return (
    <article>
      <header className="relative flex min-h-[78svh] items-end overflow-hidden">
        <div className="absolute inset-0">
          <SmartImage src={project.cover_image_url} alt={project.title} priority sizes="100vw" placeholderLabel={project.category?.name ?? project.title} width={2400} />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/30" />
        </div>
        <div className="container-x relative pb-16 pt-40">
          <Link href="/portfolio" className="mb-10 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-ivory/80 hover:text-gold">
            <ArrowLeft className="h-4 w-4" /> All projects
          </Link>
          {project.is_sample && (
            <p className="mb-4 inline-block bg-ink/80 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-gold ring-1 ring-gold/40">
              Sample project · placeholder content
            </p>
          )}
          {project.category && (
            <Link href={`/portfolio/category/${project.category.slug}`} className="eyebrow block hover:text-gold-soft">
              {project.category.name}
            </Link>
          )}
          <h1 className="mt-4 max-w-4xl text-5xl leading-[1.02] sm:text-7xl">{project.title}</h1>
          <div className="mt-6 flex flex-wrap gap-6 text-sm text-mist">
            {project.location && (
              <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-gold" /> {project.location}</span>
            )}
            {date && (
              <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-gold" /> {date}</span>
            )}
          </div>
        </div>
      </header>

      <section className="py-20">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_auto] lg:items-start">
          {project.description && (
            <Reveal className="max-w-2xl text-lg leading-relaxed text-mist">
              <p className="whitespace-pre-line">{project.description}</p>
            </Reveal>
          )}
          <Reveal delay={0.1} className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Link href={`/booking${service ? `?service=${service.slug}` : ""}`} className={buttonClass("gold")}>
              Book a Similar Shoot
            </Link>
            {whatsapp && (
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={buttonClass("outline")}>
                <WhatsAppIcon className="h-4 w-4" /> Enquire on WhatsApp
              </a>
            )}
          </Reveal>
        </div>
      </section>

      {project.video_url && (
        <section className="pb-20" aria-label="Film">
          <div className="container-x">
            <VideoEmbed url={project.video_url} title={`${project.title} — film`} poster={project.cover_image_url} />
          </div>
        </section>
      )}

      {images.length > 0 && (
        <section className="pb-20" aria-labelledby="gallery-h">
          <div className="container-x">
            <h2 id="gallery-h" className="sr-only">Gallery</h2>
            <Gallery images={images} title={project.title} />
          </div>
        </section>
      )}

      {project.drive_folder_url && (
        <section className="pb-24">
          <div className="container-x flex flex-col items-center gap-4 border-y border-white/10 py-12 text-center">
            <p className="font-serif text-3xl text-ivory">See the complete collection</p>
            <a href={project.drive_folder_url} target="_blank" rel="noopener noreferrer" className={buttonClass("outline")}>
              View Full Gallery <ExternalLink className="h-4 w-4" />
            </a>
            <p className="text-xs text-mist">Opens in Google Drive in a new tab.</p>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="border-t border-white/5 bg-charcoal/40 py-24" aria-labelledby="related-h">
          <div className="container-x">
            <h2 id="related-h" className="text-4xl text-ivory sm:text-5xl">More Stories</h2>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <ProjectCard key={p.id} project={p} aspect="aspect-[4/3]" />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
