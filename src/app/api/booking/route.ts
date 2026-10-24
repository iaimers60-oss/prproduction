import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { bookingSchema } from "@/lib/validation";
import { createPublicClient } from "@/lib/supabase/public";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const MIN_FILL_MS = 3000;

export async function POST(request: Request) {
  if (!rateLimit(`booking:${clientIp(request.headers)}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many inquiries from this connection. Please try again later or contact us on WhatsApp." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Spam protection: hidden honeypot field must be empty, and the form must not be submitted instantly.
  const startedAt = Number(body._t);
  if (body.company || !Number.isFinite(startedAt) || Date.now() - startedAt < MIN_FILL_MS) {
    return NextResponse.json({ error: "Your submission could not be verified. Please try again." }, { status: 400 });
  }

  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const k = String(issue.path[0] ?? "form");
      fieldErrors[k] ??= issue.message;
    }
    return NextResponse.json({ error: "Please correct the highlighted fields.", fieldErrors }, { status: 422 });
  }

  const db = createPublicClient();
  if (!db) {
    return NextResponse.json({ saved: false, reason: "not_configured" });
  }

  const { consent: _consent, ...data } = parsed.data;
  const id = randomUUID();
  // RLS allows anonymous inserts only (no reads), so the id is generated here.
  const { error } = await db.from("booking_inquiries").insert({ id, ...data, status: "new" });
  if (error) {
    console.error("booking insert failed", error.message);
    return NextResponse.json({ saved: false, reason: "error", error: "We could not save your inquiry right now. Please send it on WhatsApp instead." }, { status: 502 });
  }
  return NextResponse.json({ saved: true, reference: id.slice(0, 8).toUpperCase() });
}
