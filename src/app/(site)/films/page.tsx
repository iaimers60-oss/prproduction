import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/site/PageHero";
import { CtaSection } from "@/components/site/CtaSection";
import { VideoEmbed } from "@/components/portfolio/VideoEmbed";
import { Reveal } from "@/components/ui/Reveal";
import { DevNotice } from "@/components/ui/DevNotice";
import { buttonClass } from "@/components/ui/Button";
import { getFilms, getSettings } from "@/lib/data/public";
import { FILM_TYPES } from "@/lib/config/site";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { DEFAULT_WHATSAPP_MESSAGE } from "@/lib/config/services";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Wedding Films & Cinematic Videos",
  description: "Wedding highlight films, pre-wedding films, event films, and brand films by PR Production.",
  alternates: { canonical: "/films" },
};

export default async function FilmsPage() {
  const [films, settings] = await Promise.all([getFilms(), getSettings()]);
  const groups = FILM_TYPES.map((t) => ({ ...t, films: films.filter((f) => f.film_type === t.value) }));
  const ungrouped = films.filter((f) => !f.film_type);
  const hasSamples = films.some((f) => f.is_sample);

  return (
    <>
      <PageHero eyebrow="Films" title={<>Wedding Films, <em className="italic text-gold-soft">Told Like Cinema.</em></>} intro="Highlight films, pre-wedding stories, event films, and brand films. Press play to watch.">
        {hasSamples && (
          <div className="mt-8 max-w-xl"><DevNotice>These are sample film slots. Add YouTube or Vimeo links to projects in the admin dashboard.</DevNotice></div>
        )}
        <nav aria-label="Film types" className="mt-10 flex flex-wrap gap-2">
          {groups.filter((g) => g.films.length).map((g) => (
            <a key={g.value} href={`#${g.value}`} className="border border-white/15 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-ivory/80 hover:border-gold hover:text-gold">{g.label}</a>
          ))}
        </nav>
      </PageHero>

      {films.length === 0 ? (
        <section className="pb-28">
          <div className="container-x border border-white/10 py-20 text-center">
            <p className="font-serif text-3xl text-ivory">Our films will be published here soon.</p>
            {settings.youtube_url && (
              <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer" className={buttonClass("outline", "mt-8")}>Visit our YouTube channel</a>
            )}
          </div>
        </section>
      ) : (
        <div className="pb-20">
          {[...groups, { value: "other", label: "More Films", films: ungrouped }].filter((g) => g.films.length).map((g) => (
            <section key={g.value} id={g.value} className="scroll-mt-24 border-t border-white/5 py-16" aria-labelledby={`${g.value}-h`}>
              <div className="container-x">
                <h2 id={`${g.value}-h`} className="text-4xl text-ivory sm:text-5xl">{g.label}</h2>
                <div className="mt-10 grid gap-10 md:grid-cols-2">
                  {g.films.map((f, i) => (
                    <Reveal key={f.id} delay={(i % 2) * 0.08}>
                      <VideoEmbed url={f.video_url} title={f.title} poster={f.cover_image_url} label={`${g.label} — placeholder`} />
                      <div className="mt-5 flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-2xl text-ivory">{f.title}</h3>
                          {f.location && <p className="mt-1 text-sm text-mist">{f.location}</p>}
                          {f.is_sample && <p className="mt-1 text-xs text-gold">Sample slot</p>}
                        </div>
                        <Link href={`/portfolio/${f.slug}`} className="shrink-0 text-xs font-semibold uppercase tracking-[0.2em] text-gold hover:text-gold-soft">Project →</Link>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>
      )}
      <CtaSection whatsappUrl={buildWhatsAppUrl(settings.whatsapp_number, DEFAULT_WHATSAPP_MESSAGE)} />
    </>
  );
}
