import type { Metadata } from "next";
import { BookingForm } from "@/components/forms/BookingForm";
import { Reveal } from "@/components/ui/Reveal";
import { getSettings } from "@/lib/data/public";
import { getService } from "@/lib/config/services";

export const metadata: Metadata = {
  title: "Book Your Shoot",
  description: "Tell PR Production about your wedding, pre-wedding, event, or brand shoot. We will get in touch to discuss your requirements.",
  alternates: { canonical: "/booking" },
};

type Props = { searchParams: Promise<{ service?: string }> };

export default async function BookingPage({ searchParams }: Props) {
  const [{ service }, settings] = await Promise.all([searchParams, getSettings()]);
  const selected = getService(service);

  return (
    <section className="relative pb-28 pt-36 sm:pt-44">
      <div aria-hidden className="absolute inset-x-0 top-0 h-[480px] bg-[radial-gradient(ellipse_at_top,rgba(197,165,114,0.10),transparent_70%)]" />
      <div className="container-x relative grid gap-16 lg:grid-cols-[0.9fr_1.3fr] lg:gap-24">
        <Reveal className="lg:sticky lg:top-32 lg:self-start">
          <div className="mb-6 flex items-center gap-4">
            <span className="rule-gold" aria-hidden />
            <p className="eyebrow">Booking</p>
          </div>
          <h1 className="text-5xl leading-[1.02] sm:text-7xl">Let&apos;s Plan Your Shoot.</h1>
          <p className="mt-6 text-lg leading-relaxed text-mist">
            Tell us a little about your event, and our team will get in touch to discuss your requirements.
          </p>
          {selected && (
            <p className="mt-8 border-l-2 border-gold pl-4 text-sm text-ivory">
              Selected service: <strong>{selected.name}</strong>
            </p>
          )}
          <ul className="mt-10 space-y-3 text-sm text-mist">
            <li>— No payment is needed to send an inquiry.</li>
            <li>— Packages and pricing are shared after we understand your needs.</li>
            <li>— Fields marked <span className="text-gold">*</span> are required.</li>
          </ul>
        </Reveal>
        <div>
          <BookingForm
            whatsappNumber={settings.whatsapp_number}
            budgetRanges={settings.budget_ranges}
            initialEventType={selected?.eventType}
            contactEmail={settings.email}
          />
        </div>
      </div>
    </section>
  );
}
