export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function formatDate(value: string | null | undefined, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("en-IN", { ...opts, timeZone: "Asia/Kolkata" }).format(d);
}

export function formatINR(paise: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(paise / 100);
}

/** Lines from a textarea, trimmed and de-duplicated, empties removed. */
export function linesOf(text: string | null | undefined) {
  return Array.from(new Set((text ?? "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean)));
}
