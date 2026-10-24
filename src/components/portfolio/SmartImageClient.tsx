"use client";

import Image from "next/image";
import { toDisplayImageUrl } from "@/lib/drive";
import { Placeholder } from "@/components/ui/Placeholder";

const OPTIMIZABLE = [/^lh3\.googleusercontent\.com$/, /\.supabase\.co$/];

/** Client-side twin of SmartImage for interactive galleries. */
export function SmartImageClient({ src, alt, sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" }: { src: string; alt: string; sizes?: string }) {
  const url = toDisplayImageUrl(src, 1400);
  if (!url) return <Placeholder label={alt} compact />;
  let host = "";
  try { host = new URL(url).hostname; } catch {}
  if (url.startsWith("/") || OPTIMIZABLE.some((r) => r.test(host))) {
    return <Image src={url} alt={alt} fill sizes={sizes} className="object-cover" />;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={alt} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />;
}
