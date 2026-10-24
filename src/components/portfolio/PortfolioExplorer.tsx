"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ProjectCard } from "./ProjectCard";
import { buttonClass } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { Category, ProjectWithRelations } from "@/types";

const PAGE = 12;
const ASPECTS = ["aspect-[4/5]", "aspect-[4/3]", "aspect-[3/4]", "aspect-square", "aspect-[4/5]", "aspect-[5/4]"];

interface Props {
  projects: ProjectWithRelations[];
  categories: Category[];
}

/** Client-side filtering, search and load-more over published projects. */
export function PortfolioExplorer({ projects, categories }: Props) {
  const [active, setActive] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE);

  const usedCategories = useMemo(
    () => categories.filter((c) => projects.some((p) => p.category_id === c.id)),
    [categories, projects],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter(
      (p) =>
        (active === "all" || p.category?.slug === active) &&
        (!q || p.title.toLowerCase().includes(q) || (p.location ?? "").toLowerCase().includes(q)),
    );
  }, [projects, active, query]);

  const shown = filtered.slice(0, limit);

  return (
    <div>
      <div className="flex flex-col gap-6 border-b border-white/10 pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div role="group" aria-label="Filter by category" className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          <FilterChip active={active === "all"} onClick={() => { setActive("all"); setLimit(PAGE); }}>
            All <span className="opacity-60">({projects.length})</span>
          </FilterChip>
          {usedCategories.map((c) => (
            <FilterChip key={c.id} active={active === c.slug} onClick={() => { setActive(c.slug); setLimit(PAGE); }}>
              {c.name}
            </FilterChip>
          ))}
        </div>
        <label className="relative block w-full lg:w-80">
          <span className="sr-only">Search projects by title or location</span>
          <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mist" />
          <input
            type="search"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setLimit(PAGE); }}
            placeholder="Search projects"
            className="field pl-11"
          />
        </label>
      </div>

      <p className="sr-only" aria-live="polite">
        {filtered.length} project{filtered.length === 1 ? "" : "s"} found
      </p>

      {shown.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-serif text-3xl text-ivory">No projects found.</p>
          <p className="mt-3 text-mist">Try another category or clear your search.</p>
          <button type="button" onClick={() => { setActive("all"); setQuery(""); }} className={buttonClass("outline", "mt-8")}>
            Show all projects
          </button>
        </div>
      ) : (
        <div className="mt-10 columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5 [&>*]:break-inside-avoid">
          {shown.map((p, i) => (
            <ProjectCard key={p.id} project={p} aspect={ASPECTS[i % ASPECTS.length]} priority={i < 3} />
          ))}
        </div>
      )}

      {filtered.length > limit && (
        <div className="mt-12 text-center">
          <button type="button" onClick={() => setLimit((l) => l + PAGE)} className={buttonClass("outline")}>
            Load more projects
          </button>
          <p className="mt-3 text-xs text-mist">Showing {shown.length} of {filtered.length}</p>
        </div>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "shrink-0 whitespace-nowrap border px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] transition-colors duration-300",
        active ? "border-gold bg-gold text-ink" : "border-white/15 text-ivory/80 hover:border-gold/60 hover:text-gold",
      )}
    >
      {children}
    </button>
  );
}
