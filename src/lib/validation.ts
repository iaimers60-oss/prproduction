import { z } from "zod";
import { normalizeWhatsAppNumber } from "./whatsapp.ts";
import { validateDriveFolderFormat, validateImageUrlFormat } from "./drive.ts";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Please keep this under ${max} characters.`)
    .optional()
    .transform((v) => (v ? v : null));

export const bookingSchema = z.object({
  full_name: z.string().trim().min(2, "Please enter your full name.").max(100, "Name is too long."),
  whatsapp_number: z
    .string()
    .trim()
    .refine((v) => normalizeWhatsAppNumber(v) !== null, "Enter a valid WhatsApp number, e.g. 98765 43210 or +91 98765 43210."),
  email: z
    .string()
    .trim()
    .max(160)
    .optional()
    .refine((v) => !v || z.email().safeParse(v).success, "Enter a valid email address, or leave it empty.")
    .transform((v) => (v ? v : null)),
  event_type: z.string().trim().min(1, "Please choose an event type.").max(80),
  event_date: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), "Choose a valid date, or leave it empty if not decided.")
    .transform((v) => (v ? v : null)),
  event_city: z.string().trim().min(2, "Please enter the event city.").max(80),
  state: z.string().trim().min(2, "Please choose a state.").max(80),
  message: z.string().trim().min(10, "Please tell us a little more (at least 10 characters).").max(2000, "Please keep the message under 2000 characters."),
  venue: optionalText(160),
  budget_range: optionalText(80),
  shoot_duration: optionalText(80),
  preferred_contact_time: optionalText(80),
  consent: z.literal(true, { error: "Please agree so we can contact you about your inquiry." }),
});

export type BookingInput = z.input<typeof bookingSchema>;
export type BookingData = z.output<typeof bookingSchema>;

const imageUrl = z
  .string()
  .trim()
  .superRefine((v, ctx) => {
    if (!v) return;
    const r = validateImageUrlFormat(v);
    if (!r.ok) ctx.addIssue({ code: "custom", message: r.error });
  });

export const projectSchema = z.object({
  title: z.string().trim().min(2, "Title is required.").max(140),
  slug: z
    .string()
    .trim()
    .min(2, "Slug is required.")
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only."),
  category_id: z.string().uuid("Choose a category.").nullable(),
  location: optionalText(120),
  event_date: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), "Invalid date.")
    .transform((v) => (v ? v : null)),
  description: optionalText(4000),
  cover_image_url: imageUrl.transform((v) => (v ? v : null)),
  drive_folder_url: z
    .string()
    .trim()
    .superRefine((v, ctx) => {
      if (!v) return;
      const r = validateDriveFolderFormat(v);
      if (!r.ok) ctx.addIssue({ code: "custom", message: r.error });
    })
    .transform((v) => (v ? v : null)),
  video_url: z
    .string()
    .trim()
    .refine((v) => !v || /^https:\/\//.test(v), "Video links must start with https://.")
    .transform((v) => (v ? v : null)),
  film_type: z
    .enum(["wedding-highlight", "pre-wedding", "event", "brand", ""])
    .transform((v) => (v ? v : null)),
  is_featured: z.boolean(),
  is_published: z.boolean(),
  sort_order: z.coerce.number().int().min(0).max(100000),
  gallery: z.array(z.string()).max(300, "Up to 300 gallery images per project."),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Name is required.").max(80),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only."),
  description: optionalText(400),
  sort_order: z.coerce.number().int().min(0).max(100000),
  is_visible: z.boolean(),
});

export const paymentRequestSchema = z.object({
  client_name: z.string().trim().min(2, "Client name is required.").max(100),
  description: optionalText(200),
  amount_rupees: z.coerce
    .number({ error: "Enter an amount." })
    .min(1, "Amount must be at least ₹1.")
    .max(1000000, "Amount looks too large."),
  inquiry_id: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || z.uuid().safeParse(v).success, "Invalid inquiry.")
    .transform((v) => (v ? v : null)),
});
