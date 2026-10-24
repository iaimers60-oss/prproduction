"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
import { bookingSchema } from "@/lib/validation";
import { buildInquiryMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { EVENT_TYPES, INDIAN_STATES } from "@/lib/config/site";
import { buttonClass } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { Field, fieldProps } from "./Field";

interface Props {
  whatsappNumber: string | null;
  budgetRanges: string[];
  initialEventType?: string;
  contactEmail: string | null;
}

type Values = Record<string, string>;
type Result =
  | { kind: "saved"; reference: string; message: string }
  | { kind: "whatsapp"; message: string; reason: "not_configured" | "error" | "chosen" };

const EMPTY: Values = {
  full_name: "", whatsapp_number: "", email: "", event_type: "", event_date: "", event_city: "", state: "",
  message: "", venue: "", budget_range: "", shoot_duration: "", preferred_contact_time: "",
};

export function BookingForm({ whatsappNumber, budgetRanges, initialEventType, contactEmail }: Props) {
  const [values, setValues] = useState<Values>({ ...EMPTY, event_type: initialEventType ?? "" });
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [editable, setEditable] = useState("");
  const startedAt = useRef(Date.now());
  const honeypot = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const hasWhatsApp = Boolean(buildWhatsAppUrl(whatsappNumber, "x"));

  useEffect(() => {
    if (result) {
      setEditable(result.message);
      resultRef.current?.focus();
    }
  }, [result]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    if (errors[k]) setErrors(({ [k]: _, ...rest }) => rest);
  };

  function validate() {
    const parsed = bookingSchema.safeParse({ ...values, consent });
    if (parsed.success) {
      setErrors({});
      return parsed.data;
    }
    const next: Record<string, string> = {};
    for (const i of parsed.error.issues) next[String(i.path[0])] ??= i.message;
    setErrors(next);
    setFormError("Please correct the highlighted fields.");
    const first = Object.keys(EMPTY).concat("consent").find((k) => next[k]);
    if (first) document.getElementById(first)?.focus();
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const data = validate();
    if (!data) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, consent, company: honeypot.current?.value ?? "", _t: startedAt.current }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.saved) {
        setResult({ kind: "saved", reference: json.reference, message: buildInquiryMessage(data, json.reference) });
      } else if (json.fieldErrors) {
        setErrors(json.fieldErrors);
        setFormError(json.error ?? "Please correct the highlighted fields.");
      } else if (json.reason === "not_configured" || json.reason === "error") {
        setResult({ kind: "whatsapp", reason: json.reason, message: buildInquiryMessage(data) });
      } else {
        setFormError(json.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setFormError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function sendViaWhatsApp() {
    setFormError(null);
    const data = validate();
    if (data) setResult({ kind: "whatsapp", reason: "chosen", message: buildInquiryMessage(data) });
  }

  const waUrl = useMemo(() => buildWhatsAppUrl(whatsappNumber, editable), [whatsappNumber, editable]);

  if (result) {
    return (
      <div ref={resultRef} tabIndex={-1} className="border border-gold/30 bg-charcoal/70 p-6 outline-none sm:p-10" role="status" aria-live="polite">
        {result.kind === "saved" ? (
          <>
            <CheckCircle2 className="h-10 w-10 text-gold" strokeWidth={1.3} />
            <h2 className="mt-6 text-4xl text-ivory">Thank you. Your inquiry has been received.</h2>
            <p className="mt-4 text-mist">
              Reference <strong className="text-ivory">{result.reference}</strong>. Our team will get in touch with you soon.
              {hasWhatsApp && " For a faster reply, you can also send these details on WhatsApp."}
            </p>
          </>
        ) : (
          <>
            <h2 className="text-4xl text-ivory">
              {result.reason === "chosen" ? "Send your inquiry on WhatsApp" : "One more step: send it on WhatsApp"}
            </h2>
            <p className="mt-4 text-mist">
              {result.reason === "chosen"
                ? "Review the message below, then open WhatsApp to send it."
                : result.reason === "error"
                  ? "We could not save your inquiry online just now, so it has not been received yet. Please send it on WhatsApp below."
                  : "Online inquiries are not stored yet, so your inquiry has not been received. Please send it on WhatsApp below."}
            </p>
          </>
        )}

        {hasWhatsApp ? (
          <div className="mt-8">
            <label htmlFor="wa-message" className="field-label">Your WhatsApp message (you can edit it)</label>
            <textarea id="wa-message" value={editable} onChange={(e) => setEditable(e.target.value)} rows={10} className="field font-mono text-sm leading-relaxed" />
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a href={waUrl ?? "#"} target="_blank" rel="noopener noreferrer" className={buttonClass("gold")}>
                <WhatsAppIcon className="h-4 w-4" /> Open WhatsApp
              </a>
              <Link href="/" className={buttonClass("outline")}>Back to home</Link>
            </div>
          </div>
        ) : (
          result.kind !== "saved" && (
            <p className="mt-6 text-sm text-mist">
              WhatsApp is not set up yet.{" "}
              {contactEmail ? (
                <>Please email your details to <a className="text-gold underline" href={`mailto:${contactEmail}?subject=${encodeURIComponent("Booking inquiry — PR Production")}&body=${encodeURIComponent(editable)}`}>{contactEmail}</a>.</>
              ) : (
                <>Please visit our <Link href="/contact" className="text-gold underline">contact page</Link>.</>
              )}
            </p>
          )
        )}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-8" aria-describedby={formError ? "form-error" : undefined}>
      {/* Honeypot: hidden from people, often filled by bots */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="company">Company</label>
        <input ref={honeypot} id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <fieldset className="grid gap-6 sm:grid-cols-2">
        <legend className="eyebrow mb-6">About you</legend>
        <Field id="full_name" label="Full Name" required error={errors.full_name}>
          <input {...fieldProps("full_name", errors.full_name)} value={values.full_name} onChange={set("full_name")} autoComplete="name" required />
        </Field>
        <Field id="whatsapp_number" label="WhatsApp Number" required error={errors.whatsapp_number} hint="Indian numbers can be entered without +91.">
          <input {...fieldProps("whatsapp_number", errors.whatsapp_number, "x")} value={values.whatsapp_number} onChange={set("whatsapp_number")} type="tel" inputMode="tel" autoComplete="tel" required />
        </Field>
        <Field id="email" label="Email" error={errors.email} className="sm:col-span-2">
          <input {...fieldProps("email", errors.email)} value={values.email} onChange={set("email")} type="email" autoComplete="email" inputMode="email" />
        </Field>
      </fieldset>

      <fieldset className="grid gap-6 sm:grid-cols-2">
        <legend className="eyebrow mb-6">Your event</legend>
        <Field id="event_type" label="Event Type" required error={errors.event_type}>
          <select {...fieldProps("event_type", errors.event_type)} value={values.event_type} onChange={set("event_type")} required>
            <option value="">Select an event type</option>
            {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <Field id="event_date" label="Event Date, if known" error={errors.event_date} hint="Leave empty if not decided yet.">
          <input {...fieldProps("event_date", errors.event_date, "x")} value={values.event_date} onChange={set("event_date")} type="date" className="field [color-scheme:dark]" />
        </Field>
        <Field id="event_city" label="Event City" required error={errors.event_city}>
          <input {...fieldProps("event_city", errors.event_city)} value={values.event_city} onChange={set("event_city")} autoComplete="address-level2" required />
        </Field>
        <Field id="state" label="State" required error={errors.state}>
          <select {...fieldProps("state", errors.state)} value={values.state} onChange={set("state")} required>
            <option value="">Select a state</option>
            {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field id="venue" label="Venue" error={errors.venue}>
          <input {...fieldProps("venue", errors.venue)} value={values.venue} onChange={set("venue")} />
        </Field>
        <Field id="shoot_duration" label="Shoot Duration" error={errors.shoot_duration}>
          <input {...fieldProps("shoot_duration", errors.shoot_duration)} value={values.shoot_duration} onChange={set("shoot_duration")} placeholder="e.g. 2 days, half day" />
        </Field>
        <Field id="budget_range" label="Budget Range" error={errors.budget_range} hint="Indicative only. Final pricing is shared after we discuss your requirements.">
          <select {...fieldProps("budget_range", errors.budget_range, "x")} value={values.budget_range} onChange={set("budget_range")}>
            <option value="">Prefer not to say</option>
            {budgetRanges.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </Field>
        <Field id="preferred_contact_time" label="Preferred Contact Time" error={errors.preferred_contact_time}>
          <select {...fieldProps("preferred_contact_time", errors.preferred_contact_time)} value={values.preferred_contact_time} onChange={set("preferred_contact_time")}>
            <option value="">Any time</option>
            <option>Morning (9am – 12pm)</option>
            <option>Afternoon (12pm – 4pm)</option>
            <option>Evening (4pm – 8pm)</option>
          </select>
        </Field>
        <Field id="message" label="Message" required error={errors.message} className="sm:col-span-2">
          <textarea {...fieldProps("message", errors.message)} value={values.message} onChange={set("message")} rows={5} required placeholder="Tell us about your event, the functions you need covered, and anything special you have in mind." />
        </Field>
      </fieldset>

      <div>
        <label className="flex items-start gap-3 text-sm leading-relaxed text-mist">
          <input
            id="consent"
            type="checkbox"
            checked={consent}
            onChange={(e) => { setConsent(e.target.checked); if (errors.consent) setErrors(({ consent: _, ...r }) => r); }}
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? "consent-error" : undefined}
            className="mt-1 h-4 w-4 shrink-0 accent-[#C5A572]"
          />
          <span>
            I agree that PR Production may use these details to contact me about my inquiry, as described in the{" "}
            <Link href="/privacy-policy" className="text-gold underline underline-offset-4">Privacy Policy</Link>.
          </span>
        </label>
        {errors.consent && <p id="consent-error" role="alert" className="mt-2 text-xs text-red-300">{errors.consent}</p>}
      </div>

      {formError && <p id="form-error" role="alert" className="border border-red-400/40 bg-red-400/5 px-4 py-3 text-sm text-red-200">{formError}</p>}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="submit" disabled={submitting} className={buttonClass("gold")}>
          {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : "Send Inquiry"}
        </button>
        {hasWhatsApp && (
          <button type="button" onClick={sendViaWhatsApp} disabled={submitting} className={buttonClass("outline")}>
            <WhatsAppIcon className="h-4 w-4" /> Send via WhatsApp instead
          </button>
        )}
      </div>
    </form>
  );
}
