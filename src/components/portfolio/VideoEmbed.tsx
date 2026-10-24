"use client";

import { useState } from "react";
import { Play, ExternalLink } from "lucide-react";
import { parseVideoUrl } from "@/lib/video";
import { toDisplayImageUrl } from "@/lib/drive";
import { Placeholder } from "@/components/ui/Placeholder";

interface Props {
  url: string | null;
  title: string;
  poster?: string | null;
  label?: string;
}

/**
 * Lightweight video: shows a poster first and loads the YouTube/Vimeo player
 * only after the visitor presses play, keeping pages fast.
 */
export function VideoEmbed({ url, title, poster, label }: Props) {
  const [playing, setPlaying] = useState(false);
  const source = parseVideoUrl(url);
  const posterUrl = toDisplayImageUrl(poster, 1600) ?? (source?.kind === "youtube" ? source.poster : null);

  if (!source) {
    return (
      <div className="relative aspect-video overflow-hidden bg-charcoal">
        <Placeholder label={label ?? "Film placeholder"} />
      </div>
    );
  }

  if (source.kind === "external") {
    return (
      <a href={source.href} target="_blank" rel="noopener noreferrer" className="group relative flex aspect-video items-center justify-center overflow-hidden bg-charcoal">
        {posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={posterUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" loading="lazy" />
        ) : (
          <Placeholder label={title} compact />
        )}
        <span className="relative inline-flex items-center gap-2 bg-ink/80 px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-ivory group-hover:text-gold">
          Watch film <ExternalLink className="h-4 w-4" />
        </span>
      </a>
    );
  }

  if (playing) {
    return (
      <div className="relative aspect-video bg-ink">
        {source.kind === "file" ? (
          <video src={source.src} controls autoPlay playsInline className="absolute inset-0 h-full w-full" title={title} />
        ) : (
          <iframe
            src={source.embed}
            title={title}
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        )}
      </div>
    );
  }

  return (
    <button type="button" onClick={() => setPlaying(true)} className="group relative block aspect-video w-full overflow-hidden bg-charcoal" aria-label={`Play film: ${title}`}>
      {posterUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={posterUrl} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.4s] ease-[var(--ease-cinematic)] group-hover:scale-105" />
      ) : (
        <Placeholder label={title} compact />
      )}
      <span className="absolute inset-0 bg-ink/35 transition-colors group-hover:bg-ink/20" />
      <span className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-ivory/60 text-ivory backdrop-blur-sm transition-all duration-500 group-hover:scale-110 group-hover:border-gold group-hover:text-gold">
        <Play className="ml-1 h-7 w-7" fill="currentColor" />
      </span>
    </button>
  );
}
