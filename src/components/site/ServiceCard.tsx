import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SmartImage } from "@/components/ui/SmartImage";
import { buttonClass } from "@/components/ui/Button";
import type { Service } from "@/lib/config/services";

interface Props {
  service: Service;
  index: number;
  image: string | null;
}

export function ServiceCard({ service, index, image }: Props) {
  return (
    <article id={service.slug} className="group flex h-full scroll-mt-28 flex-col border border-white/[0.07] bg-charcoal/60 transition-colors duration-500 hover:border-gold/30">
      <div className="relative aspect-[4/3] overflow-hidden">
        <div className="absolute inset-0 transition-transform duration-[1.4s] ease-[var(--ease-cinematic)] group-hover:scale-[1.04]">
          <SmartImage src={image} alt={service.name} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" placeholderLabel={service.name} width={1000} />
        </div>
        <span className="absolute left-5 top-4 font-serif text-sm italic text-gold">{String(index + 1).padStart(2, "0")}</span>
      </div>
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <h3 className="text-3xl leading-tight text-ivory">{service.name}</h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-mist">{service.short}</p>
        <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link href={`/booking?service=${service.slug}`} className={buttonClass("outline", "px-5 py-3")}>
            Book This Service
          </Link>
          <Link href={`/services#${service.slug}`} className="inline-flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-gold hover:text-gold-soft">
            Explore Service <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
