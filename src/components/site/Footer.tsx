import Link from "next/link";
import { Mail } from "lucide-react";
import { InstagramIcon as Instagram, YoutubeIcon as Youtube } from "@/components/ui/SocialIcons";
import { BRAND, NAV_LINKS } from "@/lib/config/site";
import { SERVICES } from "@/lib/config/services";
import type { Category, SiteSettings } from "@/types";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { Logo } from "./Logo";

interface Props {
  settings: SiteSettings;
  categories: Category[];
  whatsappUrl: string | null;
}

export function Footer({ settings, categories, whatsappUrl }: Props) {
  const year = new Date().getFullYear();
  const contacts = [
    whatsappUrl && { href: whatsappUrl, label: "WhatsApp", icon: <WhatsAppIcon className="h-4 w-4" />, external: true },
    settings.email && { href: `mailto:${settings.email}`, label: settings.email, icon: <Mail className="h-4 w-4" />, external: false },
    settings.instagram_url && { href: settings.instagram_url, label: "Instagram", icon: <Instagram className="h-4 w-4" />, external: true },
    settings.youtube_url && { href: settings.youtube_url, label: "YouTube", icon: <Youtube className="h-4 w-4" />, external: true },
  ].filter(Boolean) as { href: string; label: string; icon: React.ReactNode; external: boolean }[];

  return (
    <footer className="border-t border-white/5 bg-charcoal">
      <div className="container-x grid gap-14 py-20 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="max-w-sm">
          <Logo logoUrl={settings.logo_url} />
          <p className="mt-6 font-serif text-2xl italic leading-snug text-ivory/90">{settings.tagline}</p>
          <p className="mt-4 text-sm leading-relaxed text-mist">{settings.footer_text}</p>
          {contacts.length > 0 && (
            <ul className="mt-8 space-y-3">
              {contacts.map((c) => (
                <li key={c.label}>
                  <a
                    href={c.href}
                    {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="inline-flex items-center gap-3 text-sm text-ivory/80 transition-colors hover:text-gold"
                  >
                    <span className="text-gold">{c.icon}</span>
                    {c.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
          {settings.address && <p className="mt-6 whitespace-pre-line text-sm text-mist">{settings.address}</p>}
        </div>

        <FooterColumn title="Explore">
          {NAV_LINKS.map((l) => (
            <FooterLink key={l.href} href={l.href}>{l.label}</FooterLink>
          ))}
          <FooterLink href="/booking">Book Your Shoot</FooterLink>
          <FooterLink href="/payment">Payments</FooterLink>
        </FooterColumn>

        <FooterColumn title="Services">
          {SERVICES.slice(0, 8).map((s) => (
            <FooterLink key={s.slug} href={`/services#${s.slug}`}>{s.name}</FooterLink>
          ))}
        </FooterColumn>

        <FooterColumn title="Portfolio">
          {categories.slice(0, 8).map((c) => (
            <FooterLink key={c.slug} href={`/portfolio/category/${c.slug}`}>{c.name}</FooterLink>
          ))}
          <FooterLink href="/portfolio">View all work</FooterLink>
        </FooterColumn>
      </div>

      <div className="border-t border-white/5">
        <div className="container-x flex flex-col gap-3 py-6 text-xs text-mist sm:flex-row sm:items-center sm:justify-between">
          <p>
            Serving {settings.service_regions.join(" · ")} · Across India
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/privacy-policy" className="hover:text-gold">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gold">Terms and Conditions</Link>
            <span>© {year} {BRAND}. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="eyebrow mb-6 font-sans">{title}</h2>
      <ul className="space-y-3">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-sm text-ivory/75 transition-colors hover:text-gold">
        {children}
      </Link>
    </li>
  );
}
