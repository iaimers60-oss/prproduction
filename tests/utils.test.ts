import { test } from "node:test";
import assert from "node:assert/strict";
import { buildWhatsAppUrl, normalizeWhatsAppNumber, buildInquiryMessage } from "../src/lib/whatsapp.ts";
import { toDisplayImageUrl, validateImageUrlFormat, validateDriveFolderFormat, extractDriveFileId } from "../src/lib/drive.ts";
import { parseVideoUrl } from "../src/lib/video.ts";
import { bookingSchema, projectSchema } from "../src/lib/validation.ts";

test("normalizes Indian WhatsApp numbers", () => {
  assert.equal(normalizeWhatsAppNumber("98765 43210"), "919876543210");
  assert.equal(normalizeWhatsAppNumber("+91 98765-43210"), "919876543210");
  assert.equal(normalizeWhatsAppNumber("098765 43210"), "919876543210");
  assert.equal(normalizeWhatsAppNumber("12345"), null);
  assert.equal(normalizeWhatsAppNumber(""), null);
  assert.equal(normalizeWhatsAppNumber(null), null);
});

test("builds encoded wa.me URLs and refuses missing numbers", () => {
  const url = buildWhatsAppUrl("9876543210", "Hello PR Production! Wedding & films?");
  assert.equal(url, "https://wa.me/918459034951?text=Hello%20PR%20Production!%20Wedding%20%26%20films%3F");
  assert.equal(buildWhatsAppUrl(null, "hi"), null);
});

test("inquiry message includes details and brand name", () => {
  const m = buildInquiryMessage({
    full_name: "Asha", whatsapp_number: "9876543210", event_type: "Wedding Photography",
    event_city: "Raipur", state: "Chhattisgarh", message: "Wedding in December",
  }, "abc123");
  assert.match(m, /^Hello PR Production!/);
  assert.match(m, /Location: Raipur, Chhattisgarh/);
  assert.match(m, /Inquiry reference: abc123/);
  assert.doesNotMatch(m, /BR Production/);
});

test("converts Drive file links to displayable URLs", () => {
  const id = "1AbCdEfGhIjKlMnOpQrStUvWxYz012345";
  assert.equal(extractDriveFileId(`https://drive.google.com/file/d/${id}/view?usp=sharing`), id);
  assert.equal(toDisplayImageUrl(`https://drive.google.com/open?id=${id}`, 800), `https://lh3.googleusercontent.com/d/${id}=w800`);
  assert.equal(toDisplayImageUrl("https://example.com/a.jpg"), "https://example.com/a.jpg");
  assert.equal(toDisplayImageUrl(""), null);
});

test("validates admin-entered links", () => {
  assert.equal(validateImageUrlFormat("http://x.com/a.jpg").ok, false);
  assert.equal(validateImageUrlFormat("https://drive.google.com/drive/folders/1AbCdEfGhIjKlMnOp").ok, false);
  assert.equal(validateImageUrlFormat("https://drive.google.com/file/d/1AbCdEfGhIjKlMnOp/view").ok, true);
  assert.equal(validateDriveFolderFormat("https://drive.google.com/drive/folders/1AbCdEfGhIjKlMnOp?usp=sharing").ok, true);
  assert.equal(validateDriveFolderFormat("https://drive.google.com/file/d/1AbCdEfGhIjKlMnOp/view").ok, false);
});

test("parses video URLs", () => {
  assert.equal(parseVideoUrl("https://youtu.be/dQw4w9WgXcQ")?.kind, "youtube");
  assert.equal(parseVideoUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")?.kind, "youtube");
  assert.equal(parseVideoUrl("https://vimeo.com/123456789")?.kind, "vimeo");
  assert.equal(parseVideoUrl("https://cdn.example.com/film.mp4")?.kind, "file");
  assert.equal(parseVideoUrl("not a url"), null);
});

test("booking schema accepts valid and rejects invalid input", () => {
  const ok = bookingSchema.safeParse({
    full_name: "Asha Verma", whatsapp_number: "98765 43210", event_type: "Wedding Photography",
    event_date: "", event_city: "Raipur", state: "Chhattisgarh", message: "Wedding on 12 Dec, 300 guests.",
    email: "", consent: true,
  });
  assert.equal(ok.success, true);
  if (ok.success) assert.equal(ok.data.email, null);
  const bad = bookingSchema.safeParse({ full_name: "A", whatsapp_number: "123", event_type: "", event_city: "", state: "", message: "hi", consent: false });
  assert.equal(bad.success, false);
  if (!bad.success) {
    const fields = new Set(bad.error.issues.map((i) => i.path[0]));
    for (const f of ["full_name", "whatsapp_number", "event_type", "event_city", "state", "message", "consent"]) assert.ok(fields.has(f), f);
  }
});

test("project schema rejects a folder link as a cover image", () => {
  const r = projectSchema.safeParse({
    title: "Test", slug: "test", category_id: null, cover_image_url: "https://drive.google.com/drive/folders/1AbCdEfGhIjKlMnOp",
    drive_folder_url: "", video_url: "", film_type: "", is_featured: false, is_published: true, sort_order: 0, gallery: [],
  });
  assert.equal(r.success, false);
});
