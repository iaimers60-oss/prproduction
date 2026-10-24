"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { buttonClass } from "@/components/ui/Button";
import { formatINR } from "@/lib/utils";

interface PaymentInfo {
  reference: string;
  client_name: string | null;
  description: string | null;
  amount_paise: number;
  status: string;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void; on: (e: string, cb: (r: unknown) => void) => void };
  }
}

function loadCheckout(): Promise<boolean> {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

type Stage =
  | { kind: "idle" }
  | { kind: "found"; payment: PaymentInfo }
  | { kind: "success"; reference: string }
  | { kind: "pending"; reference: string };

export function RazorpayCheckout({ initialReference = "" }: { initialReference?: string }) {
  const [reference, setReference] = useState(initialReference);
  const [stage, setStage] = useState<Stage>({ kind: "idle" });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setBusy(true);
    try {
      const res = await fetch("/api/payments/lookup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reference }) });
      const json = await res.json();
      if (!res.ok) setMessage(json.error ?? "Could not find this payment.");
      else setStage({ kind: "found", payment: json.payment });
    } catch {
      setMessage("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function pay(p: PaymentInfo) {
    setMessage(null);
    setBusy(true);
    try {
      const [ok, res] = await Promise.all([
        loadCheckout(),
        fetch("/api/payments/order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reference: p.reference }) }),
      ]);
      const order = await res.json();
      if (!res.ok) throw new Error(order.error ?? "Could not start payment.");
      if (!ok || !window.Razorpay) throw new Error("Could not load the payment window. Please check your connection.");

      const rzp = new window.Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: order.name,
        description: order.description,
        prefill: { name: order.prefillName },
        theme: { color: "#C5A572" },
        modal: {
          ondismiss: () => {
            setBusy(false);
            setMessage("Payment was cancelled. No money has been taken. You can try again whenever you are ready.");
          },
        },
        handler: async (response: Record<string, string>) => {
          // Success is shown only after our server verifies the signature.
          const v = await fetch("/api/payments/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(response) });
          const vj = await v.json().catch(() => ({}));
          setBusy(false);
          if (v.ok && vj.verified) setStage({ kind: "success", reference: p.reference });
          else setStage({ kind: "pending", reference: p.reference });
        },
      });
      rzp.on("payment.failed", () => {
        setBusy(false);
        setMessage("The payment failed. If money was deducted, it will be refunded by your bank automatically. Please try again or contact us.");
      });
      rzp.open();
    } catch (err) {
      setBusy(false);
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (stage.kind === "success") {
    return (
      <div role="status" className="border border-gold/30 p-8">
        <CheckCircle2 className="h-10 w-10 text-gold" strokeWidth={1.3} />
        <p className="mt-4 font-serif text-3xl text-ivory">Payment verified. Thank you!</p>
        <p className="mt-2 text-sm text-mist">Reference {stage.reference}. PR Production has been notified.</p>
      </div>
    );
  }
  if (stage.kind === "pending") {
    return (
      <div role="status" className="border border-white/15 p-8">
        <p className="font-serif text-3xl text-ivory">Payment received, confirmation pending.</p>
        <p className="mt-2 text-sm text-mist">We could not confirm it instantly. It will be confirmed automatically, or contact us with reference {stage.reference}.</p>
      </div>
    );
  }

  return (
    <div>
      {stage.kind === "idle" ? (
        <form onSubmit={lookup} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="pay-ref" className="field-label">Payment reference</label>
            <input id="pay-ref" className="field uppercase" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g. PR-7K2M9QX" autoComplete="off" required />
          </div>
          <button type="submit" disabled={busy || !reference.trim()} className={buttonClass("outline")}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue"}
          </button>
        </form>
      ) : (
        <div className="border border-white/10 p-6">
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
            <dt className="text-mist">Reference</dt><dd className="text-ivory">{stage.payment.reference}</dd>
            {stage.payment.client_name && (<><dt className="text-mist">Name</dt><dd className="text-ivory">{stage.payment.client_name}</dd></>)}
            {stage.payment.description && (<><dt className="text-mist">For</dt><dd className="text-ivory">{stage.payment.description}</dd></>)}
            <dt className="text-mist">Amount</dt><dd className="font-serif text-2xl text-gold">{formatINR(stage.payment.amount_paise)}</dd>
          </dl>
          {stage.payment.status === "paid" ? (
            <p className="mt-6 text-sm text-gold">This payment has already been completed.</p>
          ) : (
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={() => pay(stage.payment)} disabled={busy} className={buttonClass("gold")}>
                {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Opening…</> : `Pay ${formatINR(stage.payment.amount_paise)}`}
              </button>
              <button type="button" onClick={() => setStage({ kind: "idle" })} className={buttonClass("ghost")}>Use a different reference</button>
            </div>
          )}
        </div>
      )}
      {message && <p role="alert" className="mt-4 text-sm text-red-200">{message}</p>}
    </div>
  );
}
