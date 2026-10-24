import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/site/PageHero";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "Terms for using the PR Production website and booking our services.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Terms and Conditions" intro="Last updated: please review and update this date before launch." />
      <section className="pb-28">
        <div className="container-x prose-legal max-w-3xl">
          <p>
            These terms apply to the use of this website and to inquiries made through it. They are a general template; the specific
            terms of each booking (deliverables, schedule, pricing, advance, cancellation, and usage rights) are confirmed in writing by PR Production for every client.
          </p>
          <h2>Inquiries and bookings</h2>
          <ul>
            <li>Sending an inquiry does not reserve a date. A booking is confirmed only after PR Production confirms it in writing and any agreed advance is received.</li>
            <li>Budget ranges on the booking form are indicative only and are not quotations.</li>
          </ul>
          <h2>Payments</h2>
          <ul>
            <li>Pay only using the details on our official <Link href="/payment">payment page</Link> or details confirmed directly by PR Production.</li>
            <li>Online payments are processed by Razorpay. A payment is considered complete only when it has been verified.</li>
            <li>Refunds and cancellations follow the terms agreed for your booking.</li>
          </ul>
          <h2>Intellectual property</h2>
          <p>
            All photographs, films, and content on this website belong to PR Production or are used with permission. They may not be copied, downloaded for reuse,
            or published elsewhere without written consent.
          </p>
          <h2>Drone coverage</h2>
          <p>Drone photography and videography are offered only where legally permitted and where the venue and local authorities allow it.</p>
          <h2>Limitation of liability</h2>
          <p>We work to keep this website accurate and available but do not guarantee it will always be error-free or uninterrupted.</p>
          <h2>Contact</h2>
          <p>Questions about these terms? Please visit our <Link href="/contact">contact page</Link>.</p>
        </div>
      </section>
    </>
  );
}
