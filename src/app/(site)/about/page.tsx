import type { Metadata } from "next";
import { PageHero } from "@/components/site/PageHero";
import { CtaSection } from "@/components/site/CtaSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { SmartImage } from "@/components/ui/SmartImage";
import { getFeaturedProjects, getSettings } from "@/lib/data/public";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { DEFAULT_WHATSAPP_MESSAGE } from "@/lib/config/services";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "About Us",
  description: "PR Production is a photography and cinematic production studio based in Chhattisgarh, creating wedding, family, corporate, and brand stories across India.",
  alternates: { canonical: "/about" },
};

const PRINCIPLES = [
  { title: "We listen first", text: "Every family and every brand is different. We begin by understanding your traditions, priorities, and the feeling you want to remember." },
  { title: "Moments over poses", text: "We guide gently when needed, but the heart of our work is real emotion as it unfolds." },
  { title: "Stills and cinema together", text: "Photography and films are planned as one story, so nothing important is missed." },
  { title: "Care after the day", text: "Thoughtful editing, colour, and delivery are as important to us as the shoot itself." },
];

export default async function AboutPage() {
  const [settings, featured] = await Promise.all([getSettings(), getFeaturedProjects(2)]);
  const whatsappUrl = buildWhatsAppUrl(settings.whatsapp_number, DEFAULT_WHATSAPP_MESSAGE);
  const images = featured.map((p) => p.cover_image_url);

  return (
    <>
      <PageHero eyebrow="About us" title={<>Capturing Emotions. <em className="italic text-gold-soft">Creating Timeless Stories.</em></>} intro={settings.location_statement} />

      <section className="pb-28">
        <div className="container-x grid gap-14 lg:grid-cols-[1.1fr_1fr] lg:gap-24">
          <div className="grid grid-cols-5 gap-4">
            <Reveal className="relative col-span-3 aspect-[3/4] overflow-hidden">
              <SmartImage src={settings.intro_image_url ?? images[0]} alt="PR Production at work" sizes="(min-width: 1024px) 30vw, 60vw" placeholderLabel="Team or behind-the-scenes photo" />
            </Reveal>
            <Reveal delay={0.15} className="relative col-span-2 mt-20 aspect-[3/4] overflow-hidden">
              <SmartImage src={images[1]} alt="A story captured by PR Production" sizes="(min-width: 1024px) 20vw, 40vw" placeholderLabel="Portfolio photo" />
            </Reveal>
          </div>
          <div>
            <SectionHeading eyebrow="Our story" title={settings.intro_heading} />
            <Reveal delay={0.1} className="mt-8 space-y-6 text-lg leading-relaxed text-mist">
              <p>{settings.intro_text}</p>
              <p>
                We work across weddings, pre-wedding films, family milestones, corporate events, and commercial productions,
                with a primary focus on {settings.service_regions.join(", ")}, and we travel for projects across India.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="border-t border-white/5 bg-charcoal/40 py-28">
        <div className="container-x">
          <SectionHeading eyebrow="How we work" title="What Guides Us" />
          <div className="mt-14 grid gap-px bg-white/[0.06] sm:grid-cols-2 lg:grid-cols-4">
            {PRINCIPLES.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.06} className="bg-ink p-8">
                <span className="font-serif text-4xl italic text-gold/50">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-5 text-2xl text-ivory">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-mist">{p.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaSection whatsappUrl={whatsappUrl} />
    </>
  );
}
