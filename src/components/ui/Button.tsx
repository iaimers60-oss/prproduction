import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "gold" | "outline" | "ghost" | "light";

const base =
  "group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 text-[0.72rem] font-semibold uppercase tracking-[0.22em] transition-all duration-500 ease-[var(--ease-cinematic)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  gold: "bg-gold text-ink hover:bg-gold-soft",
  outline: "border border-ivory/30 text-ivory hover:border-gold hover:text-gold",
  ghost: "!px-0 text-gold hover:text-gold-soft",
  light: "bg-ivory text-ink hover:bg-white",
};

export function buttonClass(variant: Variant = "gold", className?: string) {
  return cn(base, variants[variant], className);
}

interface LinkProps {
  href: string;
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
  external?: boolean;
  "aria-label"?: string;
}

export function ButtonLink({ href, variant = "gold", className, children, external, ...rest }: LinkProps) {
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={buttonClass(variant, className)} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={buttonClass(variant, className)} {...rest}>
      {children}
    </Link>
  );
}
