import type { Metadata } from "next";
import { Download, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { DevNotice } from "@/components/ui/DevNotice";
import { buttonClass } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { RazorpayCheckout } from "@/components/forms/RazorpayCheckout";
import { getSettings } from "@/lib/data/public";
import { isRazorpayConfigured, razorpayMode } from "@/lib/razorpay";
import { toDisplayImageUrl } from "@/lib/drive";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { IS_DEV } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "Payment Information",
  description: "Official payment instructions for confirming your booking with PR Production.",
  alternates: { canonical: "/payment" },
};

type Props = { searchParams: Promise<{ ref?: string }> };

export default async function PaymentPage({ searchParams }: Props) {
  const [{ ref }, s] = await Promise.all([searchParams, getSettings()]);
  const qr = toDisplayImageUrl(s.payment_qr_url, 1000);
  const supportNumber = s.support_whatsapp || s.whatsapp_number;
  const confirmUrl = buildWhatsAppUrl(supportNumber, "Hello PR Production! I have made a payment for my booking. Sharing the details for confirmation:\nName:\nAmount:\nTransaction ID / UTR:");
  const bankRows = [
    ["Account holder", s.account_holder],
    ["Bank", s.bank_name],
    ["Account number", s.account_number],
    ["IFSC", s.ifsc],
  ].filter(([, v]) => v) as [string, string][];
  const hasOffline = Boolean(qr || s.upi_id || bankRows.length);

  return (
    <>
      <PageHero eyebrow="Payments" title="Secure Your Booking." intro="Follow the payment instructions provided by PR Production to confirm your booking." />

      <section className="pb-28">
        <div className="container-x grid gap-10 lg:grid-cols-2">
          <Reveal className="border border-white/10 bg-charcoal/60 p-6 sm:p-10">
            <h2 className="text-3xl text-ivory">Pay by UPI or bank transfer</h2>
            {hasOffline ? (
              <>
                {qr && (
                  <figure className="mt-8">
                    <div className="mx-auto w-full max-w-[300px] bg-white p-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={qr} alt="Official PR Production payment QR code" className="h-auto w-full" />
                    </div>
                    <figcaption className="mt-4 text-center text-sm text-mist">Scan with any UPI app (Google Pay, PhonePe, Paytm, BHIM).</figcaption>
                    <div className="mt-4 text-center">
                      <a href={qr} download="PR-Production-payment-QR" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold hover:text-gold-soft">
                        <Download className="h-4 w-4" /> Download QR
                      </a>
                    </div>
                  </figure>
                )}
                <dl className="mt-8 divide-y divide-white/10 border-y border-white/10 text-sm">
                  {s.upi_id && (
                    <div className="flex justify-between gap-4 py-3"><dt className="text-mist">UPI ID</dt><dd className="select-all break-all text-right font-medium text-ivory">{s.upi_id}</dd></div>
                  )}
                  {bankRows.map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4 py-3"><dt className="text-mist">{k}</dt><dd className="select-all break-all text-right font-medium text-ivory">{v}</dd></div>
                  ))}
                </dl>
              </>
            ) : (
              <div className="mt-6 space-y-4">
                <p className="text-mist">Payment details are shared personally once your booking is confirmed. Please contact us for instructions.</p>
                {IS_DEV && <DevNotice>No payment details configured. Add UPI ID, QR code, and bank details in Admin → Settings. They stay hidden until added.</DevNotice>}
              </div>
            )}
            {s.payment_instructions && <p className="mt-8 whitespace-pre-line text-sm leading-relaxed text-mist">{s.payment_instructions}</p>}
            <div className="mt-8 flex items-start gap-3 text-xs text-mist">
              <ShieldCheck className="h-4 w-4 shrink-0 text-gold" />
              <p>Only pay to the details shown on this official page or confirmed directly by PR Production. Always verify the account holder name before paying.</p>
            </div>
            {confirmUrl && (
              <a href={confirmUrl} target="_blank" rel="noopener noreferrer" className={buttonClass("gold", "mt-8 w-full sm:w-auto")}>
                <WhatsAppIcon className="h-4 w-4" /> Confirm payment on WhatsApp
              </a>
            )}
          </Reveal>

          <Reveal delay={0.1} className="border border-white/10 p-6 sm:p-10">
            <h2 className="text-3xl text-ivory">Pay online</h2>
            {isRazorpayConfigured ? (
              <>
                <p className="mt-4 text-sm leading-relaxed text-mist">
                  If PR Production has shared a payment reference with you, enter it below to pay securely by card, UPI, or net banking through Razorpay.
                </p>
                {razorpayMode === "test" && IS_DEV && <div className="mt-4"><DevNotice>Razorpay is in test mode. No real money will move.</DevNotice></div>}
                <div className="mt-8"><RazorpayCheckout initialReference={ref ?? ""} /></div>
              </>
            ) : (
              <p className="mt-4 text-sm leading-relaxed text-mist">
                Online card and net-banking payments are not available yet. Please use the payment details provided by PR Production.
              </p>
            )}
          </Reveal>
        </div>
      </section>
    </>
  );
}
