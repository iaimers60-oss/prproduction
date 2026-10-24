import { INQUIRY_STATUSES } from "@/lib/config/site";
import { cn } from "@/lib/utils";

const COLORS: Record<string, string> = {
  new: "bg-gold text-ink",
  contacted: "bg-sky-400/15 text-sky-200",
  discussion: "bg-violet-400/15 text-violet-200",
  quotation_sent: "bg-amber-400/15 text-amber-200",
  confirmed: "bg-emerald-400/15 text-emerald-200",
  completed: "bg-white/10 text-ivory",
  cancelled: "bg-red-400/10 text-red-300",
  created: "bg-white/10 text-ivory",
  pending: "bg-amber-400/15 text-amber-200",
  paid: "bg-emerald-400/15 text-emerald-200",
  failed: "bg-red-400/10 text-red-300",
};

export function StatusBadge({ status }: { status: string }) {
  const label = INQUIRY_STATUSES.find((s) => s.value === status)?.label ?? status.charAt(0).toUpperCase() + status.slice(1);
  return <span className={cn("inline-block whitespace-nowrap px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em]", COLORS[status] ?? "bg-white/10")}>{label}</span>;
}
