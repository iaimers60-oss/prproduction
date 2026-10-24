export type FilmType = "wedding-highlight" | "pre-wedding" | "event" | "brand";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_visible: boolean;
}

export interface ProjectImage {
  id: string;
  project_id: string;
  url: string;
  alt: string | null;
  sort_order: number;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  category_id: string | null;
  location: string | null;
  event_date: string | null;
  description: string | null;
  cover_image_url: string | null;
  drive_folder_url: string | null;
  video_url: string | null;
  film_type: FilmType | null;
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  /** True only for built-in sample content shown before real projects exist. */
  is_sample?: boolean;
}

export interface ProjectWithRelations extends Project {
  category: Category | null;
  images: ProjectImage[];
}

export interface Testimonial {
  id: string;
  client_name: string;
  event_type: string | null;
  review: string;
  photo_url: string | null;
  is_published: boolean;
  sort_order: number;
}

export type InquiryStatus =
  | "new"
  | "contacted"
  | "discussion"
  | "quotation_sent"
  | "confirmed"
  | "completed"
  | "cancelled";

export interface BookingInquiry {
  id: string;
  full_name: string;
  whatsapp_number: string;
  email: string | null;
  event_type: string;
  event_date: string | null;
  event_city: string;
  state: string;
  venue: string | null;
  budget_range: string | null;
  shoot_duration: string | null;
  preferred_contact_time: string | null;
  message: string;
  status: InquiryStatus;
  internal_notes: string | null;
  created_at: string;
}

export type PaymentStatus = "created" | "pending" | "paid" | "failed" | "cancelled";

export interface PaymentRecord {
  id: string;
  reference: string;
  inquiry_id: string | null;
  client_name: string | null;
  description: string | null;
  amount_paise: number;
  currency: string;
  status: PaymentStatus;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  paid_at: string | null;
  created_at: string;
}

export interface SiteSettings {
  tagline: string;
  brand_statement: string;
  location_statement: string;
  intro_heading: string;
  intro_text: string;
  logo_url: string | null;
  hero_image_url: string | null;
  hero_video_url: string | null;
  intro_image_url: string | null;
  whatsapp_number: string | null;
  email: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  address: string | null;
  service_regions: string[];
  service_cities: string[];
  footer_text: string;
  budget_ranges: string[];
  account_holder: string | null;
  upi_id: string | null;
  bank_name: string | null;
  account_number: string | null;
  ifsc: string | null;
  payment_instructions: string | null;
  payment_qr_url: string | null;
  support_whatsapp: string | null;
}
