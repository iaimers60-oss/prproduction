import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/site/PageHero";
import { CtaSection } from "@/components/site/CtaSection";
import { Reveal } from "@/components/ui/Reveal";
import { SmartImage } from "@/components/ui/SmartImage";
import { buttonClass } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { getServiceImages, getSettings } from "@/lib/data/public";
import { SERVICES, DEFAULT_WHATSAPP_MESSAGE } from "@/lib/config/services";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Photography & Film Services",
  description:
    "Wedding photography, wedding cinematography, pre-wedding shoots and films, engagement, birthday, maternity, newborn, corporate, commercial, brand films, and drone shoots by PR Production.",
  alternates: { canonical: "/services" },
};

export default async function ServicesPage() {
  const [settings, images] = await Promise.all([getSettings(), getServiceImages()]);

  return (
    <>
      <PageHero eyebrow="Services" title={<>Photography &amp; Films, <em className="italic text-gold-soft">Made Personal.</em></>} intro="Choose a service to learn more, or book directly. Packages and pricing are shared personally after we understand your requirements.">
        <nav aria-label="Services on this page" className="mt-12 flex flex-wrap gap-2">
          {SERVICES.map((s) => (
            <a key={s.slug} href={`#${s.slug}`} className="border border-white/15 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-ivory/80 hover:border-gold hover:text-gold">
              {s.name}
            </a>
          ))}
        </nav>
      </PageHero>

      <div className="pb-20">
        {SERVICES.map((s, i) => {
          const wa = buildWhatsAppUrl(settings.whatsapp_number, s.whatsapp);
          return (
            <section key={s.slug} id={s.slug} className="scroll-mt-24 border-t border-white/5 py-16 sm:py-24" aria-labelledby={`${s.slug}-h`}>
              <div className="container-x grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
                <Reveal className={cn("relative aspect-[4/3] overflow-hidden", i % 2 === 1 && "lg:order-2")}>
                  <SmartImage src={images[s.slug]} alt={s.name} sizes="(min-width: 1024px) 50vw, 100vw" placeholderLabel={s.name} />
                </Reveal>
                <Reveal delay={0.1}>
                  <span className="font-serif text-lg italic text-gold">{String(i + 1).padStart(2, "0")}</span>
                  <h2 id={`${s.slug}-h`} className="mt-3 text-4xl leading-tight text-ivory sm:text-5xl">{s.name}</h2>
                  <p className="mt-6 text-lg leading-relaxed text-mist">{s.description}</p>
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Link href={`/booking?service=${s.slug}`} className={buttonClass("gold")}>Book This Service</Link>
                    {wa && (
                      <a href={wa} target="_blank" rel="noopener noreferrer" className={buttonClass("outline")}>
                        <WhatsAppIcon className="h-4 w-4" /> Ask on WhatsApp
                      </a>
                    )}
                  </div>
                  <Link href={`/portfolio/category/${s.categorySlug}`} className="mt-6 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-gold hover:text-gold-soft">
                    See related work →
                  </Link>
                </Reveal>
              </div>
            </section>
          );
        })}
      </div>

      <CtaSection whatsappUrl={buildWhatsAppUrl(settings.whatsapp_number, DEFAULT_WHATSAPP_MESSAGE)} />
    </>
  );
}
