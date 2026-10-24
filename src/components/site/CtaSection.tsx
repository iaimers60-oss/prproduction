import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

interface Props {
  whatsappUrl: string | null;
  title?: string;
  text?: string;
}

export function CtaSection({
  whatsappUrl,
  title = "Let's Create Something Unforgettable.",
  text = "Share your date, your city, and your story. We will get back to you to talk through what you have in mind.",
}: Props) {
  return (
    <section className="relative overflow-hidden border-t border-white/5 bg-charcoal py-28 sm:py-36">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(197,165,114,0.12),transparent_65%)]" />
      <Reveal className="container-x relative text-center">
        <p className="eyebrow">Begin your story</p>
        <h2 className="mx-auto mt-6 max-w-4xl text-5xl leading-[1.02] sm:text-6xl lg:text-7xl">{title}</h2>
        <p className="mx-auto mt-6 max-w-xl text-mist">{text}</p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <ButtonLink href="/booking">Book Your Shoot</ButtonLink>
          {whatsappUrl ? (
            <ButtonLink href={whatsappUrl} external variant="outline">
              <WhatsAppIcon className="h-4 w-4" /> Chat on WhatsApp
            </ButtonLink>
          ) : (
            <ButtonLink href="/contact" variant="outline">Contact Us</ButtonLink>
          )}
        </div>
      </Reveal>
    </section>
  );
}
