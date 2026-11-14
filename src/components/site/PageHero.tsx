import { Reveal } from "@/components/ui/Reveal";

interface Props {
  eyebrow: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  children?: React.ReactNode;
}

/** Heading block for inner pages. */
export function PageHero({ eyebrow, title, intro, children }: Props) {
  return (
    <section className="relative overflow-hidden pb-16 pt-40 sm:pb-20 sm:pt-48">
      <div aria-hidden className="absolute inset-x-0 top-0 h-120 bg-[radial-gradient(ellipse_at_top,rgba(197,165,114,0.10),transparent_70%)]" />
      <div className="container-x relative">
        <Reveal>
          <div className="mb-6 flex items-center gap-4">
            <span className="rule-gold" aria-hidden />
            <p className="eyebrow">{eyebrow}</p>
          </div>
          <h1 className="max-w-5xl text-5xl leading-[1.02] sm:text-6xl lg:text-8xl">{title}</h1>
          {intro && <p className="mt-8 max-w-2xl text-base leading-relaxed text-mist sm:text-lg">{intro}</p>}
        </Reveal>
        {children}
      </div>
    </section>
  );
}
