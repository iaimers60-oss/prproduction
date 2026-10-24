import Link from "next/link";
import { BRAND } from "@/lib/config/site";
import { toDisplayImageUrl } from "@/lib/drive";

/** Uses the uploaded logo when available, otherwise an elegant typographic wordmark. */
export function Logo({ logoUrl, onClick }: { logoUrl?: string | null; onClick?: () => void }) {
  const src = toDisplayImageUrl(logoUrl, 600);
  return (
    <Link href="/" onClick={onClick} className="group flex items-center gap-3" aria-label={`${BRAND} — home`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={BRAND} className="h-10 w-auto max-w-[180px] object-contain" />
      ) : (
        <>
          <span className="flex h-10 w-10 items-center justify-center border border-gold/60 font-serif text-lg tracking-wider text-gold transition-colors duration-500 group-hover:bg-gold group-hover:text-ink">
            PR
          </span>
          <span className="flex flex-col whitespace-nowrap leading-none">
            <span className="font-serif text-xl tracking-wide text-ivory">PR Production</span>
            <span className="mt-1 text-[0.55rem] font-semibold uppercase tracking-[0.42em] text-mist">Photo · Films</span>
          </span>
        </>
      )}
    </Link>
  );
}
