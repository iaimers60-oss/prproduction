import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { createRazorpayOrder, isRazorpayConfigured, razorpayKeyId } from "@/lib/razorpay";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { BRAND } from "@/lib/config/site";

export const runtime = "nodejs";

/**
 * Create (or reuse) a Razorpay order for a payment request.
 * The amount is read from the database, never from the browser.
 */
export async function POST(request: Request) {
  if (!rateLimit(`pay-order:${clientIp(request.headers)}`, 10, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  }
  if (!isRazorpayConfigured) return NextResponse.json({ error: "Online payment is not configured yet." }, { status: 503 });
  const db = createServiceClient()!;
  const { reference } = await request.json().catch(() => ({}));
  const ref = String(reference ?? "").trim().toUpperCase();

  const { data: record } = await db.from("payment_records").select("*").eq("reference", ref).maybeSingle();
  if (!record) return NextResponse.json({ error: "Payment request not found." }, { status: 404 });
  if (record.status === "paid") return NextResponse.json({ error: "This payment has already been completed." }, { status: 409 });
  if (record.status === "cancelled") return NextResponse.json({ error: "This payment request has been cancelled. Please contact PR Production." }, { status: 409 });

  let orderId: string = record.razorpay_order_id;
  if (!orderId) {
    try {
      const order = await createRazorpayOrder(record.amount_paise, record.reference, { reference: record.reference, brand: BRAND });
      orderId = order.id;
    } catch (e) {
      console.error(e);
      return NextResponse.json({ error: "Could not start the payment. Please try again shortly." }, { status: 502 });
    }
    // Only attach the order if no other request attached one first (prevents duplicate orders).
    const { data: updated } = await db
      .from("payment_records")
      .update({ razorpay_order_id: orderId, status: "pending" })
      .eq("id", record.id)
      .is("razorpay_order_id", null)
      .select("razorpay_order_id")
      .maybeSingle();
    if (!updated) {
      const { data: fresh } = await db.from("payment_records").select("razorpay_order_id").eq("id", record.id).single();
      orderId = fresh!.razorpay_order_id;
    }
  }

  return NextResponse.json({
    keyId: razorpayKeyId,
    orderId,
    amount: record.amount_paise,
    currency: record.currency,
    name: BRAND,
    description: record.description ?? `Payment ${record.reference}`,
    prefillName: record.client_name ?? "",
  });
}
