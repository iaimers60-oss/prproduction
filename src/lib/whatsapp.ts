/**
 * Normalise a phone number for wa.me links: digits only, with country code.
 * Indian 10-digit mobile numbers get the 91 prefix. Returns null when the
 * number is not usable.
 */
export function normalizeWhatsAppNumber(input: string | null | undefined): string | null {
  if (!input) return null;
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  if (digits.length === 10 && /^[6-9]/.test(digits)) digits = `91${digits}`;
  if (digits.length < 11 || digits.length > 15) return null;
  return digits;
}

/** Build a click-to-chat URL. Returns null when no valid number is configured. */
export function buildWhatsAppUrl(number: string | null | undefined, message: string): string | null {
  const n = normalizeWhatsAppNumber(number);
  if (!n) return null;
  return `https://wa.me/${n}?text=${encodeURIComponent(message)}`;
}

export interface InquiryMessageInput {
  full_name: string;
  whatsapp_number: string;
  email?: string | null;
  event_type: string;
  event_date?: string | null;
  event_city: string;
  state: string;
  venue?: string | null;
  budget_range?: string | null;
  shoot_duration?: string | null;
  preferred_contact_time?: string | null;
  message: string;
}

/** Compose the WhatsApp message sent after a booking inquiry. */
export function buildInquiryMessage(d: InquiryMessageInput, reference?: string | null): string {
  const lines = [
    `Hello PR Production! I would like to book a shoot.`,
    ``,
    `Name: ${d.full_name}`,
    `WhatsApp: ${d.whatsapp_number}`,
    d.email ? `Email: ${d.email}` : null,
    `Event type: ${d.event_type}`,
    `Event date: ${d.event_date || "Not decided yet"}`,
    `Location: ${d.event_city}, ${d.state}`,
    d.venue ? `Venue: ${d.venue}` : null,
    d.budget_range ? `Budget range: ${d.budget_range}` : null,
    d.shoot_duration ? `Shoot duration: ${d.shoot_duration}` : null,
    d.preferred_contact_time ? `Preferred contact time: ${d.preferred_contact_time}` : null,
    ``,
    `Message: ${d.message}`,
    reference ? `` : null,
    reference ? `Inquiry reference: ${reference}` : null,
  ];
  return lines.filter((l) => l !== null).join("\n");
}
