import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

const KEY_ID = process.env.RAZORPAY_KEY_ID ?? "";
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET ?? "";
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET ?? "";

export const isRazorpayConfigured = Boolean(KEY_ID && KEY_SECRET && process.env.SUPABASE_SERVICE_ROLE_KEY);
export const razorpayKeyId = KEY_ID;
export const razorpayMode = KEY_ID.startsWith("rzp_live_") ? "live" : "test";

function safeEqualHex(a: string, b: string) {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

/** Checkout signature: HMAC_SHA256(order_id + "|" + payment_id, key_secret). */
export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string) {
  if (!KEY_SECRET) return false;
  const expected = createHmac("sha256", KEY_SECRET).update(`${orderId}|${paymentId}`).digest("hex");
  return safeEqualHex(expected, signature);
}

/** Webhook signature: HMAC_SHA256(raw_body, webhook_secret). */
export function verifyWebhookSignature(rawBody: string, signature: string | null) {
  if (!WEBHOOK_SECRET || !signature) return false;
  const expected = createHmac("sha256", WEBHOOK_SECRET).update(rawBody).digest("hex");
  return safeEqualHex(expected, signature);
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
}

/** Create an order through the Razorpay Orders API. Amount is in paise and always comes from our database. */
export async function createRazorpayOrder(amountPaise: number, receipt: string, notes: Record<string, string>): Promise<RazorpayOrder> {
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString("base64")}`,
    },
    body: JSON.stringify({ amount: amountPaise, currency: "INR", receipt, notes }),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Razorpay order failed (${res.status}): ${text.slice(0, 200)}`);
  }
  return res.json();
}
