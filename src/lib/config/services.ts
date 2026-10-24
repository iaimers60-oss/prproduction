export interface Service {
  slug: string;
  name: string;
  short: string;
  description: string;
  /** Value preselected in the booking form's Event Type field. */
  eventType: string;
  /** Portfolio category whose latest cover image illustrates this service. */
  categorySlug: string;
  /** Prefilled WhatsApp message for this service. */
  whatsapp: string;
}

const msg = (s: string) => `Hello PR Production! ${s}`;

export const SERVICES: Service[] = [
  {
    slug: "wedding-photography",
    categorySlug: "wedding",
    name: "Wedding Photography",
    short: "Candid and traditional coverage of every ritual, glance, and celebration.",
    description:
      "From the first rituals to the final farewell, we document your wedding with a blend of candid storytelling and timeless traditional portraits, paying close attention to family, details, and emotion.",
    eventType: "Wedding Photography",
    whatsapp: msg("I am interested in Wedding Photography. Please share your packages and availability."),
  },
  {
    slug: "wedding-cinematography",
    categorySlug: "wedding-cinematography",
    name: "Wedding Cinematography",
    short: "Cinematic wedding films and highlight edits made to be rewatched.",
    description:
      "Highlight films, teasers, and full-length edits shaped with cinematic framing, natural sound, and music, so you can relive the day exactly as it felt.",
    eventType: "Wedding Cinematography",
    whatsapp: msg("I am interested in Wedding Cinematography. Please share your packages and availability."),
  },
  {
    slug: "pre-wedding-photography",
    categorySlug: "pre-wedding",
    name: "Pre-Wedding Photography",
    short: "Planned, styled portraits that tell the story of the two of you.",
    description:
      "We help you plan locations, looks, and moods for a relaxed pre-wedding shoot that reflects your personalities and your story together.",
    eventType: "Pre-Wedding",
    whatsapp: msg("I am interested in a Pre-Wedding Shoot. Please share the details."),
  },
  {
    slug: "pre-wedding-films",
    categorySlug: "pre-wedding",
    name: "Pre-Wedding Films",
    short: "Short cinematic films with a concept, a location, and a feeling.",
    description:
      "Concept-led pre-wedding films with storyboarding, location planning, and cinematic editing, ideal for sharing before the big day or playing at the venue.",
    eventType: "Pre-Wedding",
    whatsapp: msg("I am interested in a Pre-Wedding Film. Please share the details."),
  },
  {
    slug: "engagement-photography",
    categorySlug: "engagement",
    name: "Engagement Photography",
    short: "Ring ceremonies and roka moments, captured with warmth.",
    description:
      "Coverage of engagement ceremonies and celebrations with natural candids, couple portraits, and family moments.",
    eventType: "Engagement",
    whatsapp: msg("I am interested in Engagement Photography. Please share your packages and availability."),
  },
  {
    slug: "birthday-photography",
    categorySlug: "birthday",
    name: "Birthday Photography",
    short: "Joyful birthday coverage for every age.",
    description:
      "Lively, colourful coverage of birthday celebrations, from décor and cake moments to candid guest interactions.",
    eventType: "Birthday",
    whatsapp: msg("I am interested in Birthday Photography. Please share the available packages."),
  },
  {
    slug: "event-photography",
    categorySlug: "events",
    name: "Event Photography",
    short: "Functions, ceremonies, and celebrations documented end to end.",
    description:
      "Reliable, discreet coverage of social and cultural events, family functions, and celebrations of every size.",
    eventType: "Event",
    whatsapp: msg("I am interested in Event Photography. Please share your packages and availability."),
  },
  {
    slug: "corporate-photography",
    categorySlug: "corporate",
    name: "Corporate Photography",
    short: "Conferences, headshots, and workplace stories for your brand.",
    description:
      "Professional coverage of corporate events, conferences, offices, and team portraits that represent your organisation well.",
    eventType: "Corporate",
    whatsapp: msg("I need Corporate Photography services. Please contact me to discuss my requirements."),
  },
  {
    slug: "maternity-photography",
    categorySlug: "maternity",
    name: "Maternity Photography",
    short: "Gentle, elegant portraits celebrating a new beginning.",
    description:
      "Comfortable, guided maternity sessions, indoors or outdoors, with a focus on elegance, warmth, and the anticipation of a new chapter.",
    eventType: "Maternity",
    whatsapp: msg("I am interested in Maternity Photography. Please share the available packages."),
  },
  {
    slug: "baby-newborn-photography",
    categorySlug: "baby-and-newborn",
    name: "Baby and Newborn Photography",
    short: "Safe, patient sessions for the tiniest moments.",
    description:
      "Calm, unhurried newborn and baby sessions where comfort and safety come first, capturing the details that change so quickly.",
    eventType: "Baby and Newborn",
    whatsapp: msg("I am interested in Baby and Newborn Photography. Please share the available packages."),
  },
  {
    slug: "commercial-photography",
    categorySlug: "commercial-shoots",
    name: "Commercial Photography",
    short: "Product, food, and brand imagery that sells.",
    description:
      "Product, food, fashion, and lifestyle imagery planned around your brand guidelines and how the images will be used.",
    eventType: "Commercial Shoot",
    whatsapp: msg("I am interested in Commercial Photography. Please contact me to discuss my requirements."),
  },
  {
    slug: "brand-films",
    categorySlug: "brand-films",
    name: "Brand Films and Promotional Videos",
    short: "Brand stories, ads, and reels with a cinematic finish.",
    description:
      "Brand films, promotional videos, and cinematic reels, from concept and scripting through shooting and post-production.",
    eventType: "Brand Film",
    whatsapp: msg("I am interested in a Brand Film or Promotional Video. Please contact me to discuss my requirements."),
  },
  {
    slug: "drone-shoots",
    categorySlug: "wedding",
    name: "Drone Shoots",
    short: "Aerial photography and video, where legally permitted.",
    description:
      "Aerial photography and videography for weddings, venues, and brands. Drone coverage is offered only where it is legally permitted and the venue allows it.",
    eventType: "Other",
    whatsapp: msg("I am interested in a Drone Shoot. Please share the details and availability."),
  },
];

export function getService(slug: string | null | undefined) {
  return SERVICES.find((s) => s.slug === slug) ?? null;
}

export const DEFAULT_WHATSAPP_MESSAGE =
  "Hello PR Production! I visited your website and would like to know more about your photography and cinematography services.";
