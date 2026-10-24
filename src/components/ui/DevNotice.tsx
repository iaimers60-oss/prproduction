import { IS_DEV } from "@/lib/config/site";

/** A notice visible only in development, used to flag missing owner content. */
export function DevNotice({ children }: { children: React.ReactNode }) {
  if (!IS_DEV) return null;
  return (
    <p className="border border-dashed border-gold/40 bg-gold/5 px-4 py-3 text-xs leading-relaxed text-gold-soft">
      <span className="font-semibold uppercase tracking-[0.2em]">Setup · </span>
      {children}
    </p>
  );
}
