import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { verifyWebhookSignature } from "@/lib/razorpay";

export const runtime = "nodejs";

/**
 * Razorpay webhook (payment.captured, order.paid, payment.failed).
 * Backs up the checkout verification, e.g. if the visitor closes the tab.
 */
export async function POST(request: Request) {
  const raw = await request.text();
  if (!verifyWebhookSignature(raw, request.headers.get("x-razorpay-signature"))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
  const db = createServiceClient();
  if (!db) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const event = JSON.parse(raw);
  const payment = event?.payload?.payment?.entity;
  const orderId: string | undefined = payment?.order_id ?? event?.payload?.order?.entity?.id;
  if (!orderId) return NextResponse.json({ ok: true });

  if (event.event === "payment.captured" || event.event === "order.paid") {
    await db
      .from("payment_records")
      .update({ status: "paid", razorpay_payment_id: payment?.id ?? null, paid_at: new Date().toISOString() })
      .eq("razorpay_order_id", orderId)
      .neq("status", "paid");
  } else if (event.event === "payment.failed") {
    await db.from("payment_records").update({ status: "failed" }).eq("razorpay_order_id", orderId).in("status", ["created", "pending"]);
  }
  return NextResponse.json({ ok: true });
}
