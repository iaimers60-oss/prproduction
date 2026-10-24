import type { InquiryStatus, SiteSettings } from "@/types";

/** The official and only brand name. Never change to anything else. */
export const BRAND = "PR Production";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export const IS_DEV = process.env.NODE_ENV !== "production";

export const DEFAULT_TITLE = `${BRAND} | Wedding Photography & Cinematic Films`;
export const DEFAULT_DESCRIPTION =
  "Discover wedding photography, pre-wedding films, event photography, corporate shoots, and cinematic production by PR Production across Chhattisgarh, Maharashtra, Odisha, and India.";

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/services", label: "Services" },
  { href: "/films", label: "Films" },
  { href: "/contact", label: "Contact" },
] as const;

/**
 * Defaults used until the owner saves settings in the admin dashboard.
 * Contact and payment fields are intentionally empty: nothing is invented.
 */
export const DEFAULT_SETTINGS: SiteSettings = {
  tagline: "Your Stories. Our Cinematic Vision.",
  brand_statement: "Capturing Emotions. Creating Timeless Stories.",
  location_statement: "Based in Chhattisgarh. Creating Cinematic Stories Across India.",
  intro_heading: "More Than Photographs. Memories That Stay.",
  intro_text:
    "At PR Production, we capture the emotions, details, and unforgettable moments that make every story unique. From weddings and pre-wedding films to corporate and commercial productions, our approach combines creativity, cinematic visuals, and thoughtful storytelling.",
  logo_url: null,
  hero_image_url: null,
  hero_video_url: null,
  intro_image_url: null,
  whatsapp_number: null,
  email: null,
  instagram_url: null,
  youtube_url: null,
  address: null,
  service_regions: ["Chhattisgarh", "Maharashtra", "Odisha"],
  service_cities: [],
  footer_text:
    "Wedding photography, cinematic films, and creative production crafted around your most meaningful moments.",
  budget_ranges: [
    "Under ₹50,000",
    "₹50,000 – ₹1,00,000",
    "₹1,00,000 – ₹2,00,000",
    "₹2,00,000 – ₹5,00,000",
    "Above ₹5,00,000",
    "Not sure yet",
  ],
  account_holder: null,
  upi_id: null,
  bank_name: null,
  account_number: null,
  ifsc: null,
  payment_instructions: null,
  payment_qr_url: null,
  support_whatsapp: null,
};

export const EVENT_TYPES = [
  "Wedding Photography",
  "Wedding Cinematography",
  "Pre-Wedding",
  "Engagement",
  "Birthday",
  "Corporate",
  "Event",
  "Maternity",
  "Baby and Newborn",
  "Commercial Shoot",
  "Brand Film",
  "Other",
] as const;

export const INDIAN_STATES = [
  "Chhattisgarh", "Maharashtra", "Odisha", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands",
  "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh",
  "Lakshadweep", "Puducherry", "Outside India",
] as const;

export const INQUIRY_STATUSES: { value: InquiryStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "discussion", label: "Discussion" },
  { value: "quotation_sent", label: "Quotation Sent" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export const FILM_TYPES = [
  { value: "wedding-highlight", label: "Wedding Highlight Films" },
  { value: "pre-wedding", label: "Pre-Wedding Films" },
  { value: "event", label: "Event Films" },
  { value: "brand", label: "Brand Films" },
] as const;
