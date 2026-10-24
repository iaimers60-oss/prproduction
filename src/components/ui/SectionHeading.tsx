import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

interface Props {
  eyebrow?: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
  as?: "h1" | "h2";
}

export function SectionHeading({ eyebrow, title, intro, align = "left", className, as: H = "h2" }: Props) {
  return (
    <Reveal className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <div className={cn("mb-6 flex items-center gap-4", align === "center" && "justify-center")}>
          <span className="rule-gold" aria-hidden />
          <p className="eyebrow">{eyebrow}</p>
          {align === "center" && <span className="rule-gold" aria-hidden />}
        </div>
      )}
      <H className="text-4xl leading-[1.05] text-ivory sm:text-5xl lg:text-6xl">{title}</H>
      {intro && <p className="mt-6 text-base leading-relaxed text-mist sm:text-lg">{intro}</p>}
    </Reveal>
  );
}
