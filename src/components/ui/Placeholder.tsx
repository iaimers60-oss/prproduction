import { cn } from "@/lib/utils";

const TONES = [
  "from-[#2a2118] via-[#14110d] to-[#0b0a09]",
  "from-[#1c1a1f] via-[#121114] to-[#0a0a0b]",
  "from-[#2b1d17] via-[#16100d] to-[#0a0808]",
  "from-[#1d211d] via-[#111311] to-[#090a09]",
  "from-[#262019] via-[#151210] to-[#0b0a08]",
];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/**
 * Clearly-labelled stand-in for media the owner has not supplied yet.
 * It never imitates a real photograph.
 */
export function Placeholder({ label, className, compact = false }: { label?: string; className?: string; compact?: boolean }) {
  const tone = TONES[hash(label ?? "pr") % TONES.length];
  return (
    <div
      role="img"
      aria-label={`Placeholder${label ? ` for ${label}` : ""}. Real photograph to be added.`}
      className={cn("grain absolute inset-0 overflow-hidden bg-linear-to-br", tone, className)}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(197,165,114,0.16),transparent_60%)]" />
      <div className="absolute inset-3 border border-gold/15 sm:inset-4" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
        <svg aria-hidden viewBox="0 0 24 24" className={cn("text-gold/50", compact ? "h-5 w-5" : "h-7 w-7")} fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M3 7h3l2-3h8l2 3h3v13H3z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
        {!compact && (
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-gold/70">Placeholder</span>
        )}
        {!compact && label && <span className="max-w-[16rem] font-serif text-lg italic text-ivory/50">{label}</span>}
      </div>
    </div>
  );
}
