"use client";

import { useState } from "react";
import { Lightbox, type LightboxImage } from "./Lightbox";
import { SmartImageClient } from "./SmartImageClient";

const ASPECTS = ["aspect-[4/5]", "aspect-[3/2]", "aspect-[4/5]", "aspect-[3/4]", "aspect-[3/2]", "aspect-square"];

export function Gallery({ images, title }: { images: LightboxImage[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null);
  if (!images.length) return null;
  return (
    <>
      <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>li]:mb-4 [&>li]:break-inside-avoid">
        {images.map((img, i) => (
          <li key={`${img.url}-${i}`}>
            <button
              type="button"
              onClick={() => setOpen(i)}
              aria-label={`Open image ${i + 1} of ${images.length} from ${title} in full screen`}
              className={`group relative block w-full overflow-hidden bg-charcoal ${ASPECTS[i % ASPECTS.length]}`}
            >
              <span className="absolute inset-0 block transition-transform duration-[1.2s] ease-[var(--ease-cinematic)] group-hover:scale-[1.03]">
                <SmartImageClient src={img.url} alt={img.alt} />
              </span>
            </button>
          </li>
        ))}
      </ul>
      {open !== null && <Lightbox images={images} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </>
  );
}
