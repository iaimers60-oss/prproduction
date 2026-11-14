import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { SmartImage } from "@/components/ui/SmartImage";
import { DevNotice } from "@/components/ui/DevNotice";
import { toDisplayImageUrl } from "@/lib/drive";

interface Props {
  imageUrl: string | null;
  videoUrl: string | null;
  regions: string[];
}

export function Hero({ imageUrl, videoUrl, regions }: Props) {
  const poster = toDisplayImageUrl(imageUrl, 2400) ?? undefined;
  const hasMedia = Boolean(imageUrl || videoUrl);
  return (
    <section className="relative flex min-h-svh items-end overflow-hidden bg-ink" aria-label="Introduction">
      <div className="absolute inset-0">
        {videoUrl ? (
          <video
            className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
            src={videoUrl}
            poster={poster}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden
          />
        ) : null}
        {imageUrl ? (
          <div className={`absolute inset-0 animate-slow-zoom ${videoUrl ? "hidden motion-reduce:block" : ""}`}>
            <SmartImage src={imageUrl} alt="Wedding photograph by PR Production" priority sizes="100vw" width={2400} />
          </div>
        ) : null}
        {!hasMedia && (
          <div aria-hidden className="grain absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,rgba(197,165,114,0.22),transparent_55%),radial-gradient(ellipse_at_10%_90%,rgba(197,165,114,0.08),transparent_50%),linear-gradient(160deg,#17130f,#080808_60%)]">
            <div className="absolute inset-y-0 right-[8%] hidden w-px bg-linear-to-b from-transparent via-gold/25 to-transparent lg:block" />
            <div className="absolute inset-x-0 top-[22%] h-px bg-linear-to-r from-transparent via-gold/15 to-transparent" />
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/40 to-ink/30" />
        <div className="absolute inset-0 bg-linear-to-r from-ink/70 via-transparent to-transparent" />
      </div>

      <div className="container-x relative pb-24 pt-40 sm:pb-28">
        <p className="eyebrow mb-8 animate-[fadeUp_1s_var(--ease-cinematic)_both]">PR Production · Photography &amp; Films</p>
        <h1 className="max-w-5xl text-[3.1rem] leading-[0.98] text-ivory sm:text-7xl lg:text-[6.5rem]">
          Every Love Story <em className="font-light italic text-gold-soft">Deserves</em> To Be Remembered.
        </h1>
        <p className="mt-8 max-w-xl text-base leading-relaxed text-ivory/80 sm:text-lg">
          Wedding photography, cinematic films, and creative production crafted around your most meaningful moments.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <ButtonLink href="/portfolio">Explore Our Work</ButtonLink>
          <ButtonLink href="/booking" variant="outline">Book Your Shoot</ButtonLink>
        </div>
        <p className="mt-12 text-[0.7rem] font-medium uppercase tracking-[0.3em] text-mist">
          {[...regions, "Across India"].join("  •  ")}
        </p>
        {!hasMedia && (
          <div className="mt-8 max-w-md">
            <DevNotice>No hero photo or video yet. Add one in Admin → Settings (hero image / hero video).</DevNotice>
          </div>
        )}
      </div>

      <Link href="#intro" aria-label="Scroll to introduction" className="absolute bottom-8 right-5 hidden flex-col items-center gap-3 text-[0.6rem] uppercase tracking-[0.3em] text-mist hover:text-gold sm:right-8 sm:flex lg:right-12">
        <span className="[writing-mode:vertical-rl]">Scroll</span>
        <span className="relative h-14 w-px overflow-hidden bg-white/15">
          <span className="animate-scroll-cue absolute inset-x-0 top-0 h-1/2 bg-gold" />
        </span>
      </Link>
    </section>
  );
}
