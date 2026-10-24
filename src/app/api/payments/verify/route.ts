import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { isRazorpayConfigured, verifyPaymentSignature } from "@/lib/razorpay";

export const runtime = "nodejs";

/** Verify the checkout signature on the server before recording a payment as paid. */
export async function POST(request: Request) {
  if (!isRazorpayConfigured) return NextResponse.json({ error: "Online payment is not configured." }, { status: 503 });
  const body = await request.json().catch(() => ({}));
  const orderId = String(body.razorpay_order_id ?? "");
  const paymentId = String(body.razorpay_payment_id ?? "");
  const signature = String(body.razorpay_signature ?? "");
  if (!orderId || !paymentId || !signature || !verifyPaymentSignature(orderId, paymentId, signature)) {
    return NextResponse.json({ verified: false, error: "Payment could not be verified." }, { status: 400 });
  }

  const db = createServiceClient()!;
  const { data: record } = await db.from("payment_records").select("id, reference, status").eq("razorpay_order_id", orderId).maybeSingle();
  if (!record) return NextResponse.json({ verified: false, error: "Payment record not found." }, { status: 404 });

  if (record.status !== "paid") {
    await db
      .from("payment_records")
      .update({ status: "paid", razorpay_payment_id: paymentId, paid_at: new Date().toISOString() })
      .eq("id", record.id)
      .neq("status", "paid");
  }
  return NextResponse.json({ verified: true, reference: record.reference });
}
