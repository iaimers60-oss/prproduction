import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SmartImage } from "@/components/ui/SmartImage";
import { cn, formatDate } from "@/lib/utils";
import type { ProjectWithRelations } from "@/types";

interface Props {
  project: ProjectWithRelations;
  aspect?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}

export function ProjectCard({ project, aspect = "aspect-[4/5]", sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw", priority, className }: Props) {
  const date = formatDate(project.event_date, { month: "short", year: "numeric" });
  return (
    <article className={cn("group", className)}>
      <Link href={`/portfolio/${project.slug}`} className="block" aria-label={`View project: ${project.title}`}>
        <div className={cn("relative overflow-hidden bg-charcoal", aspect)}>
          <div className="absolute inset-0 transition-transform duration-[1.4s] ease-[var(--ease-cinematic)] group-hover:scale-[1.04]">
            <SmartImage src={project.cover_image_url} alt={`${project.title}${project.location ? `, ${project.location}` : ""}`} sizes={sizes} priority={priority} placeholderLabel={project.category?.name ?? project.title} width={1200} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent opacity-80 transition-opacity duration-700 group-hover:opacity-95" />
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            {project.is_sample && (
              <span className="bg-ink/80 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-gold ring-1 ring-gold/40">Sample</span>
            )}
            {project.is_featured && !project.is_sample && (
              <span className="bg-gold px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-ink">Featured</span>
            )}
          </div>
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
            <p className="eyebrow text-[0.62rem]">{project.category?.name ?? "Portfolio"}</p>
            <h3 className="mt-2 text-2xl leading-tight text-ivory sm:text-3xl">{project.title}</h3>
            {(project.location || date) && (
              <p className="mt-2 text-xs tracking-wide text-mist">{[project.location, date].filter(Boolean).join(" · ")}</p>
            )}
            <span className="mt-4 inline-flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-ivory/90 transition-colors group-hover:text-gold">
              View Project <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
