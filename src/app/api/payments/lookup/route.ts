import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { isRazorpayConfigured } from "@/lib/razorpay";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

/** Look up a payment request by its reference (shared privately by PR Production). */
export async function POST(request: Request) {
  if (!rateLimit(`pay-lookup:${clientIp(request.headers)}`, 20, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  }
  if (!isRazorpayConfigured) return NextResponse.json({ error: "Online payment is not configured yet." }, { status: 503 });
  const db = createServiceClient()!;
  const { reference } = await request.json().catch(() => ({}));
  const ref = String(reference ?? "").trim().toUpperCase();
  if (!/^[A-Z0-9-]{6,20}$/.test(ref)) return NextResponse.json({ error: "Please enter the payment reference exactly as shared with you." }, { status: 400 });

  const { data } = await db
    .from("payment_records")
    .select("reference, client_name, description, amount_paise, currency, status")
    .eq("reference", ref)
    .maybeSingle();
  if (!data) return NextResponse.json({ error: "No payment request was found for this reference." }, { status: 404 });
  return NextResponse.json({ payment: data });
}
