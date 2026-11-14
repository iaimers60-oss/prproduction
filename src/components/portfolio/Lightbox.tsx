"use client";

import { useCallback, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { toDisplayImageUrl } from "@/lib/drive";
import { Placeholder } from "@/components/ui/Placeholder";

export interface LightboxImage {
  url: string;
  alt: string;
}

interface Props {
  images: LightboxImage[];
  index: number;
  onClose: () => void;
  onIndex: (i: number) => void;
}

export function Lightbox({ images, index, onClose, onIndex }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);
  const count = images.length;
  const go = useCallback((d: number) => onIndex((index + d + count) % count), [index, count, onIndex]);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "Tab" && dialogRef.current) {
        // Keep focus inside the dialog.
        const f = dialogRef.current.querySelectorAll<HTMLElement>("button");
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  const img = images[index];
  const src = toDisplayImageUrl(img.url, 2400);
  const next = images[(index + 1) % count];
  const nextSrc = toDisplayImageUrl(next?.url, 2400);

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Image ${index + 1} of ${count}`}
      className="fixed inset-0 z-100 flex items-center justify-center bg-ink/97 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
    >
      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 sm:p-6">
        <p className="text-xs tracking-[0.3em] text-mist" aria-live="polite">
          {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
        </p>
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Close gallery" className="flex h-11 w-11 items-center justify-center text-ivory hover:text-gold">
          <X className="h-6 w-6" />
        </button>
      </div>

      <figure className="relative flex h-[78vh] w-[92vw] items-center justify-center sm:w-[84vw]">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={src} src={src} alt={img.alt} className="max-h-full max-w-full object-contain" />
        ) : (
          <div className="relative h-full w-full max-w-3xl"><Placeholder label={img.alt} /></div>
        )}
        {nextSrc && (
          // Preload the next image for instant navigation.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={nextSrc} alt="" aria-hidden className="hidden" />
        )}
      </figure>

      {count > 1 && (
        <>
          <button type="button" onClick={() => go(-1)} aria-label="Previous image" className="absolute left-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center text-ivory/80 hover:text-gold sm:left-6">
            <ChevronLeft className="h-8 w-8" />
          </button>
          <button type="button" onClick={() => go(1)} aria-label="Next image" className="absolute right-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center text-ivory/80 hover:text-gold sm:right-6">
            <ChevronRight className="h-8 w-8" />
          </button>
        </>
      )}
    </div>
  );
}
