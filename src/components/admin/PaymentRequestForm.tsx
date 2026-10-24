"use client";

import { useActionState, useState } from "react";
import { Copy, Check } from "lucide-react";
import { createPaymentRequest, type ActionState } from "@/lib/admin/actions";
import { AdminField, FormMessage, SubmitButton } from "./ui";

export function PaymentRequestForm({ siteUrl, inquiryId, name }: { siteUrl: string; inquiryId?: string; name?: string }) {
  const [state, action] = useActionState<ActionState, FormData>(createPaymentRequest, {});
  const [copied, setCopied] = useState(false);
  const link = state.ok && state.message ? `${siteUrl}/payment?ref=${state.message}` : null;

  return (
    <form action={action} className="grid gap-5 md:grid-cols-2">
      {inquiryId && <input type="hidden" name="inquiry_id" value={inquiryId} />}
      <AdminField name="client_name" label="Client name" state={state} defaultValue={name} required />
      <AdminField name="amount_rupees" label="Amount (₹)" type="number" state={state} required hint="The exact amount you have agreed with the client." />
      <AdminField name="description" label="Description" state={state} className="md:col-span-2" placeholder="e.g. Booking advance — wedding, 12 Dec" />
      <div className="md:col-span-2 space-y-4">
        {state.error && <FormMessage state={state} />}
        {link && (
          <div role="status" className="border border-gold/40 bg-gold/5 p-4 text-sm">
            <p className="text-gold-soft">Payment request created. Reference <strong>{state.message}</strong>. Share this link with the client:</p>
            <div className="mt-3 flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate bg-ink px-3 py-2 text-xs text-ivory">{link}</code>
              <button type="button" onClick={() => { navigator.clipboard.writeText(link); setCopied(true); }} className="inline-flex items-center gap-1 border border-white/20 px-3 py-2 text-xs uppercase tracking-[0.12em] hover:border-gold">
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        )}
        <SubmitButton>Create payment request</SubmitButton>
      </div>
    </form>
  );
}
