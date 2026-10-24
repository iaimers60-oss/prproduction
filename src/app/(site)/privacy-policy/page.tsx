import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/site/PageHero";
import { getSettings } from "@/lib/data/public";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How PR Production collects, uses, and protects your personal information.",
  alternates: { canonical: "/privacy-policy" },
};

export default async function PrivacyPage() {
  const s = await getSettings();
  return (
    <>
      <PageHero eyebrow="Legal" title="Privacy Policy" intro="Last updated: please review and update this date before launch." />
      <section className="pb-28">
        <div className="container-x prose-legal max-w-3xl">
          <p>
            This policy explains how PR Production (&ldquo;we&rdquo;, &ldquo;us&rdquo;) handles personal information shared through this website.
            It is a starting template; please have it reviewed for your specific business before publishing.
          </p>
          <h2>Information we collect</h2>
          <ul>
            <li>Details you submit in the booking form: name, WhatsApp number, email (optional), event type, date, city, state, venue, budget range, and your message.</li>
            <li>Messages you send us on WhatsApp, email, or social media.</li>
            <li>For online payments: payment reference, amount, and status. Card, UPI, and bank details are processed by Razorpay and are not stored by us.</li>
            <li>Basic technical information (such as IP address) used to protect the website from spam and abuse.</li>
          </ul>
          <h2>How we use it</h2>
          <ul>
            <li>To respond to your inquiry and discuss, plan, and deliver your shoot.</li>
            <li>To confirm bookings and payments.</li>
            <li>To keep the website secure.</li>
          </ul>
          <p>We do not sell your personal information or use it for unrelated marketing without your consent.</p>
          <h2>Photographs and films</h2>
          <p>
            We only publish client photographs or films on this website or social media with the client&apos;s permission.
            Private galleries are shared only with the people you authorise. To request removal of an image, contact us.
          </p>
          <h2>Storage and sharing</h2>
          <p>
            Inquiry data is stored securely with our database provider (Supabase) and is accessible only to authorised PR Production staff.
            We share data only with service providers needed to run our business (for example hosting, database, and payment processing), or when required by law.
          </p>
          <h2>Retention</h2>
          <p>We keep inquiry and booking records only as long as needed for the purposes above and for legal or accounting requirements.</p>
          <h2>Your choices</h2>
          <p>You can ask us to access, correct, or delete your personal information at any time.</p>
          <h2>Contact</h2>
          <p>
            For privacy questions, {s.email ? <>email <a href={`mailto:${s.email}`}>{s.email}</a></> : <>reach us via our <Link href="/contact">contact page</Link></>}.
          </p>
        </div>
      </section>
    </>
  );
}
