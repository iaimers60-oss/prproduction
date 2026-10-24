import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin } from "lucide-react";
import { InstagramIcon as Instagram, YoutubeIcon as Youtube } from "@/components/ui/SocialIcons";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { DevNotice } from "@/components/ui/DevNotice";
import { buttonClass } from "@/components/ui/Button";
import { WhatsAppComposer } from "@/components/forms/WhatsAppComposer";
import { getSettings } from "@/lib/data/public";
import { normalizeWhatsAppNumber } from "@/lib/whatsapp";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact PR Production for wedding photography, films, and creative production across Chhattisgarh, Maharashtra, Odisha, and India.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const s = await getSettings();
  const wa = normalizeWhatsAppNumber(s.whatsapp_number);
  const channels = [
    s.email && { icon: Mail, label: "Email", value: s.email, href: `mailto:${s.email}` },
    s.instagram_url && { icon: Instagram, label: "Instagram", value: "Follow our work", href: s.instagram_url },
    s.youtube_url && { icon: Youtube, label: "YouTube", value: "Watch our films", href: s.youtube_url },
  ].filter(Boolean) as { icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; label: string; value: string; href: string }[];

  return (
    <>
      <PageHero eyebrow="Contact" title={<>Let&apos;s Talk About <em className="italic text-gold-soft">Your Story.</em></>} intro="The quickest way to reach us is WhatsApp. For detailed requirements, use the booking form." />
      <section className="pb-28">
        <div className="container-x grid gap-10 lg:grid-cols-2">
          <Reveal className="border border-white/10 bg-charcoal/60 p-6 sm:p-10">
            <h2 className="text-3xl text-ivory">Message us on WhatsApp</h2>
            <div className="mt-8">
              {wa ? (
                <WhatsAppComposer number={wa} />
              ) : (
                <>
                  <p className="text-mist">WhatsApp contact will be available here soon. Meanwhile, please use the booking form.</p>
                  <div className="mt-4"><DevNotice>Add the business WhatsApp number in Admin → Settings.</DevNotice></div>
                </>
              )}
            </div>
          </Reveal>
          <Reveal delay={0.1} className="flex flex-col gap-8 p-2 sm:p-6">
            <div>
              <h2 className="text-3xl text-ivory">Plan a shoot</h2>
              <p className="mt-3 text-mist">Share your event details and we will get back to you.</p>
              <Link href="/booking" className={buttonClass("outline", "mt-6")}>Open booking form</Link>
            </div>
            {channels.length > 0 && (
              <ul className="space-y-4 border-t border-white/10 pt-8">
                {channels.map(({ icon: Icon, label, value, href }) => (
                  <li key={label}>
                    <a href={href} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="group flex items-center gap-4">
                      <Icon className="h-5 w-5 text-gold" strokeWidth={1.4} />
                      <span>
                        <span className="block text-xs uppercase tracking-[0.2em] text-mist">{label}</span>
                        <span className="text-ivory group-hover:text-gold">{value}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <div className="border-t border-white/10 pt-8">
              <p className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-mist"><MapPin className="h-4 w-4 text-gold" /> Service regions</p>
              <p className="mt-3 font-serif text-2xl text-ivory">{s.service_regions.join(" · ")}</p>
              <p className="mt-2 text-sm text-mist">{s.location_statement}</p>
              {s.address && <p className="mt-4 whitespace-pre-line text-sm text-ivory/80">{s.address}</p>}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
