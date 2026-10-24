import Image from "next/image";
import { toDisplayImageUrl } from "@/lib/drive";
import { cn } from "@/lib/utils";
import { Placeholder } from "./Placeholder";

const OPTIMIZABLE_HOSTS = [/^lh3\.googleusercontent\.com$/, /\.supabase\.co$/, /^i\.ytimg\.com$/, /^i\.vimeocdn\.com$/];

function canOptimize(src: string) {
  if (src.startsWith("/")) return true;
  try {
    const host = new URL(src).hostname;
    return OPTIMIZABLE_HOSTS.some((r) => r.test(host));
  } catch {
    return false;
  }
}

interface Props {
  src: string | null | undefined;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  placeholderLabel?: string;
  width?: number;
}

/**
 * Fills its (relatively positioned) parent. Converts Google Drive links,
 * uses next/image for known hosts, and falls back to a labelled placeholder.
 */
export function SmartImage({ src, alt, sizes = "100vw", priority, className, placeholderLabel, width = 2000 }: Props) {
  const url = toDisplayImageUrl(src, width);
  if (!url) return <Placeholder label={placeholderLabel ?? alt} />;
  if (canOptimize(url)) {
    return <Image src={url} alt={alt} fill sizes={sizes} priority={priority} className={cn("object-cover", className)} />;
  }
  return (
    // Unknown host: plain <img> so any https image the owner adds still works.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={cn("absolute inset-0 h-full w-full object-cover", className)}
    />
  );
}
