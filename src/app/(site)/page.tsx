import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Camera, Clapperboard, Compass, Heart, MapPin, Sparkles, Users } from "lucide-react";
import { Hero } from "@/components/site/Hero";
import { CtaSection } from "@/components/site/CtaSection";
import { ServiceCard } from "@/components/site/ServiceCard";
import { ProjectCard } from "@/components/portfolio/ProjectCard";
import { VideoEmbed } from "@/components/portfolio/VideoEmbed";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { SmartImage } from "@/components/ui/SmartImage";
import { getFeaturedProjects, getFilms, getServiceImages, getSettings, getTestimonials } from "@/lib/data/public";
import { SERVICES, DEFAULT_WHATSAPP_MESSAGE } from "@/lib/config/services";
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, FILM_TYPES, IS_DEV } from "@/lib/config/site";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

export const revalidate = 60;

export const metadata: Metadata = {
  title: { absolute: DEFAULT_TITLE },
  description: DEFAULT_DESCRIPTION,
  alternates: { canonical: "/" },
};

const VALUES = [
  { icon: Sparkles, title: "Creative storytelling", text: "Every story is approached as its own film, with its own mood, pace, and details." },
  { icon: Heart, title: "Attention to detail", text: "The small things — a glance, a ritual, a handwritten note — are what make memories last." },
  { icon: Clapperboard, title: "Professional production approach", text: "Planning, coordination, and post-production handled with care from first call to final delivery." },
  { icon: Users, title: "Personalised client experience", text: "We listen first, then plan coverage around your traditions, priorities, and timeline." },
  { icon: Camera, title: "Photography and cinematography", text: "Stills and films from one team, so both tell the same story in the same visual language." },
  { icon: Compass, title: "Available across India", text: "Based in Chhattisgarh and ready to travel wherever your celebration takes place." },
];

const PROCESS = [
  { title: "Tell Us Your Story", text: "Share your date, city, and what matters most to you." },
  { title: "Discuss Your Requirements", text: "We talk through coverage, team, deliverables, and budget." },
  { title: "Plan Your Shoot", text: "Timelines, locations, and looks are planned together in advance." },
  { title: "Capture Your Memories", text: "On the day, we focus on the moments while you enjoy them." },
];

export default async function HomePage() {
  const [settings, featured, films, testimonials, serviceImages] = await Promise.all([
    getSettings(),
    getFeaturedProjects(5),
    getFilms(),
    getTestimonials(),
    getServiceImages(),
  ]);
  const whatsappUrl = buildWhatsAppUrl(settings.whatsapp_number, DEFAULT_WHATSAPP_MESSAGE);
  const introImage = settings.intro_image_url ?? featured.find((p) => p.cover_image_url)?.cover_image_url ?? null;

  const featuredFilms = FILM_TYPES.map((t) => ({ type: t, film: films.find((f) => f.film_type === t.value) })).filter((x) => x.film);
  const cities = settings.service_cities;

  return (
    <>
      <Hero imageUrl={settings.hero_image_url} videoUrl={settings.hero_video_url} regions={settings.service_regions} />

      {/* Brand introduction */}
      <section id="intro" className="scroll-mt-20 py-28 sm:py-36">
        <div className="container-x grid items-center gap-14 lg:grid-cols-2 lg:gap-24">
          <Reveal className="relative order-2 aspect-[4/5] overflow-hidden lg:order-1">
            <SmartImage src={introImage} alt="A moment captured by PR Production" sizes="(min-width: 1024px) 50vw, 100vw" placeholderLabel="Signature photograph" />
            <div className="pointer-events-none absolute inset-4 border border-ivory/10" />
          </Reveal>
          <div className="order-1 lg:order-2">
            <SectionHeading eyebrow="About PR Production" title={settings.intro_heading} />
            <Reveal delay={0.1}>
              <p className="mt-8 text-lg leading-relaxed text-mist">{settings.intro_text}</p>
              <p className="mt-6 font-serif text-2xl italic text-gold-soft">{settings.brand_statement}</p>
              <div className="mt-10">
                <ButtonLink href="/about" variant="ghost">
                  Our story <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </ButtonLink>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Featured portfolio */}
      <section className="border-t border-white/5 bg-charcoal/40 py-28 sm:py-36" aria-labelledby="featured-heading">
        <div className="container-x">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Selected work"
              title={<span id="featured-heading">Stories We&apos;ve Told</span>}
              intro="Wedding stories, pre-wedding films, cinematic celebrations, corporate and commercial work, and the special moments in between."
            />
            <Reveal><ButtonLink href="/portfolio" variant="outline">View All Projects</ButtonLink></Reveal>
          </div>
          {featured.length > 0 ? (
            <div className="mt-16 grid gap-5 md:grid-cols-6 md:grid-rows-[auto]">
              {featured.map((p, i) => (
                <Reveal
                  key={p.id}
                  delay={(i % 3) * 0.08}
                  className={cn(
                    i === 0 && "md:col-span-4 md:row-span-2",
                    i === 1 && "md:col-span-2",
                    i === 2 && "md:col-span-2",
                    i >= 3 && "md:col-span-3",
                  )}
                >
                  <ProjectCard
                    project={p}
                    aspect={i === 0 ? "aspect-[4/5] md:aspect-auto md:h-full md:min-h-[640px]" : i < 3 ? "aspect-[4/5] md:aspect-[4/4.6]" : "aspect-[3/2]"}
                    sizes={i === 0 ? "(min-width: 768px) 66vw, 100vw" : "(min-width: 768px) 33vw, 100vw"}
                    className="h-full [&>a]:h-full [&>a>div]:h-full"
                  />
                </Reveal>
              ))}
            </div>
          ) : (
            <p className="mt-16 text-mist">Projects will appear here once they are published.</p>
          )}
        </div>
      </section>

      {/* Services */}
      <section className="py-28 sm:py-36" aria-labelledby="services-heading">
        <div className="container-x">
          <SectionHeading eyebrow="What we do" title={<span id="services-heading">Services Crafted Around You</span>} intro="Photography and films for weddings, families, brands, and every celebration in between." />
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s, i) => (
              <Reveal key={s.slug} delay={(i % 3) * 0.08} className="h-full">
                <ServiceCard service={s} index={i} image={serviceImages[s.slug]} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Featured films */}
      {(featuredFilms.length > 0 || IS_DEV) && (
        <section className="border-y border-white/5 bg-charcoal/40 py-28 sm:py-36" aria-labelledby="films-heading">
          <div className="container-x">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <SectionHeading eyebrow="Cinema" title={<span id="films-heading">Featured Films</span>} intro="Highlight films, pre-wedding stories, event films, and brand films." />
              <Reveal><ButtonLink href="/films" variant="outline">Watch All Films</ButtonLink></Reveal>
            </div>
            <div className="mt-16 grid gap-10 md:grid-cols-2">
              {(featuredFilms.length ? featuredFilms : FILM_TYPES.map((t) => ({ type: t, film: undefined }))).map(({ type, film }, i) => (
                <Reveal key={type.value} delay={(i % 2) * 0.1}>
                  <VideoEmbed url={film?.video_url ?? null} title={film?.title ?? type.label} poster={film?.cover_image_url} label={`${type.label} — placeholder`} />
                  <p className="eyebrow mt-5 text-[0.62rem]">{type.label}</p>
                  <h3 className="mt-2 text-2xl text-ivory">{film?.title ?? "Film coming soon"}</h3>
                  {film?.is_sample && <p className="mt-1 text-xs text-gold">Sample slot — add a real film URL in the admin dashboard.</p>}
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why choose */}
      <section className="py-28 sm:py-36" aria-labelledby="why-heading">
        <div className="container-x grid gap-16 lg:grid-cols-[1fr_1.4fr]">
          <SectionHeading eyebrow="Our approach" title={<span id="why-heading">Why Choose PR Production?</span>} intro="The values that guide how we work with every family and brand." />
          <ul className="grid gap-px bg-white/[0.06] sm:grid-cols-2">
            {VALUES.map(({ icon: Icon, title, text }, i) => (
              <Reveal as="li" key={title} delay={(i % 2) * 0.08} className="bg-ink p-8">
                <Icon aria-hidden className="h-6 w-6 text-gold" strokeWidth={1.4} />
                <h3 className="mt-6 text-2xl text-ivory">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-mist">{text}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Process */}
      <section className="border-t border-white/5 bg-charcoal/40 py-28 sm:py-36" aria-labelledby="process-heading">
        <div className="container-x">
          <SectionHeading eyebrow="How it works" title={<span id="process-heading">Our Process</span>} align="center" />
          <ol className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((s, i) => (
              <Reveal as="li" key={s.title} delay={i * 0.08} className="relative border-t border-gold/30 pt-8">
                <span className="font-serif text-6xl italic text-gold/40">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-4 text-2xl text-ivory">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-mist">{s.text}</p>
              </Reveal>
            ))}
          </ol>
          <Reveal className="mt-16 text-center">
            <ButtonLink href="/booking">Book Your Shoot</ButtonLink>
          </Reveal>
        </div>
      </section>

      {/* Testimonials: only real, published reviews */}
      {testimonials.length > 0 && (
        <section className="py-28 sm:py-36" aria-labelledby="testimonials-heading">
          <div className="container-x">
            <SectionHeading eyebrow="Kind words" title={<span id="testimonials-heading">From Our Clients</span>} align="center" />
            <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.slice(0, 6).map((t, i) => (
                <Reveal as="article" key={t.id} delay={(i % 3) * 0.08} className="flex flex-col border border-white/[0.07] bg-charcoal/60 p-8">
                  <p className="font-serif text-6xl leading-none text-gold/50" aria-hidden>&ldquo;</p>
                  <blockquote className="flex-1 font-serif text-xl italic leading-relaxed text-ivory/90">{t.review}</blockquote>
                  <footer className="mt-8 flex items-center gap-4">
                    {t.photo_url && (
                      <span className="relative h-12 w-12 overflow-hidden rounded-full">
                        <SmartImage src={t.photo_url} alt={t.client_name} sizes="48px" width={200} />
                      </span>
                    )}
                    <span>
                      <span className="block text-sm font-semibold text-ivory">{t.client_name}</span>
                      {t.event_type && <span className="block text-xs text-mist">{t.event_type}</span>}
                    </span>
                  </footer>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Locations */}
      <section className="border-t border-white/5 py-28 sm:py-36" aria-labelledby="locations-heading">
        <div className="container-x grid items-end gap-14 lg:grid-cols-2">
          <SectionHeading
            eyebrow="Service locations"
            title={<span id="locations-heading">Your Story, Wherever It Happens.</span>}
            intro={settings.location_statement + " Projects in other parts of India are welcome, depending on availability and travel."}
          />
          <Reveal>
            <ul className="divide-y divide-white/10 border-y border-white/10">
              {[...settings.service_regions, "Other locations across India"].map((r) => (
                <li key={r} className="flex items-center justify-between py-5">
                  <span className="font-serif text-3xl text-ivory">{r}</span>
                  <MapPin aria-hidden className="h-5 w-5 text-gold" strokeWidth={1.4} />
                </li>
              ))}
            </ul>
            {cities.length > 0 && (
              <p className="mt-6 text-sm text-mist">Including {cities.join(", ")}.</p>
            )}
            <Link href="/contact" className="mt-6 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-gold hover:text-gold-soft">
              Ask about your city →
            </Link>
          </Reveal>
        </div>
      </section>

      <CtaSection whatsappUrl={whatsappUrl} />
    </>
  );
}
