import { requireAdmin } from "@/lib/admin/auth";
import { cancelPayment } from "@/lib/admin/actions";
import { PageHeader } from "@/components/admin/PageHeader";
import { PaymentRequestForm } from "@/components/admin/PaymentRequestForm";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmSubmit } from "@/components/admin/ui";
import { isRazorpayConfigured, razorpayMode } from "@/lib/razorpay";
import { SITE_URL } from "@/lib/config/site";
import { formatDate, formatINR } from "@/lib/utils";
import type { PaymentRecord } from "@/types";

export const metadata = { title: "Payments" };

type Props = { searchParams: Promise<{ inquiry?: string; name?: string }> };

export default async function PaymentsPage({ searchParams }: Props) {
  const { db } = await requireAdmin();
  const { inquiry, name } = await searchParams;
  const { data } = await db.from("payment_records").select("*").order("created_at", { ascending: false }).limit(300);
  const rows = (data ?? []) as PaymentRecord[];

  return (
    <>
      <PageHeader
        title="Payments"
        description="Create a payment request for an agreed amount, then share its link. Status changes to Paid only after Razorpay verifies the payment on the server. UPI/bank transfers made outside Razorpay are not tracked here — confirm those in your bank statement."
      />
      <section className="mb-12 border border-white/10 bg-charcoal/60 p-6">
        <h2 className="text-2xl">New payment request</h2>
        {isRazorpayConfigured ? (
          <>
            <p className="mb-6 mt-1 text-xs text-mist">Razorpay mode: <strong className={razorpayMode === "live" ? "text-emerald-300" : "text-amber-300"}>{razorpayMode}</strong></p>
            <PaymentRequestForm siteUrl={SITE_URL} inquiryId={inquiry} name={name} />
          </>
        ) : (
          <p className="mt-3 text-sm text-mist">
            Online payments are not configured. Add <code className="text-ivory">RAZORPAY_KEY_ID</code>, <code className="text-ivory">RAZORPAY_KEY_SECRET</code>,{" "}
            <code className="text-ivory">RAZORPAY_WEBHOOK_SECRET</code> and <code className="text-ivory">SUPABASE_SERVICE_ROLE_KEY</code> to the environment (see README), then redeploy.
          </p>
        )}
      </section>

      {rows.length === 0 ? (
        <p className="border border-dashed border-white/15 p-12 text-center text-mist">No payment records yet.</p>
      ) : (
        <div className="overflow-x-auto border border-white/10">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-charcoal text-xs uppercase tracking-[0.15em] text-mist">
              <tr>
                <th scope="col" className="px-4 py-3">Reference</th>
                <th scope="col" className="px-4 py-3">Client</th>
                <th scope="col" className="px-4 py-3">Amount</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3">Transaction</th>
                <th scope="col" className="px-4 py-3">Paid on</th>
                <th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-mono text-xs text-ivory">{r.reference}</td>
                  <td className="px-4 py-3 text-mist">{r.client_name ?? "—"}<span className="block text-xs text-mist/60">{r.description}</span></td>
                  <td className="px-4 py-3 text-ivory">{formatINR(r.amount_paise)}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3 font-mono text-xs text-mist">{r.razorpay_payment_id ?? "—"}</td>
                  <td className="px-4 py-3 text-mist">{formatDate(r.paid_at, { day: "numeric", month: "short", year: "numeric" }) ?? "—"}</td>
                  <td className="px-4 py-3 text-right">
                    {["created", "pending", "failed"].includes(r.status) && (
                      <form action={cancelPayment}>
                        <input type="hidden" name="id" value={r.id} />
                        <ConfirmSubmit message={`Cancel payment request ${r.reference}?`}>Cancel</ConfirmSubmit>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
