import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { JsonLd } from "@/components/site/JsonLd";
import { getCategories, getSettings } from "@/lib/data/public";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { DEFAULT_WHATSAPP_MESSAGE } from "@/lib/config/services";
import { BRAND, DEFAULT_DESCRIPTION, SITE_URL } from "@/lib/config/site";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, categories] = await Promise.all([getSettings(), getCategories()]);
  const whatsappUrl = buildWhatsAppUrl(settings.whatsapp_number, DEFAULT_WHATSAPP_MESSAGE);
  const sameAs = [settings.instagram_url, settings.youtube_url].filter(Boolean);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ProfessionalService",
          name: BRAND,
          description: DEFAULT_DESCRIPTION,
          url: SITE_URL,
          slogan: settings.tagline,
          areaServed: [...settings.service_regions.map((r) => ({ "@type": "State", name: r })), { "@type": "Country", name: "India" }],
          ...(settings.email ? { email: settings.email } : {}),
          ...(sameAs.length ? { sameAs } : {}),
        }}
      />
      <Header logoUrl={settings.logo_url} whatsappUrl={whatsappUrl} />
      <main id="main">{children}</main>
      <Footer settings={settings} categories={categories} whatsappUrl={whatsappUrl} />
      <WhatsAppFloat href={whatsappUrl} />
    </>
  );
}
