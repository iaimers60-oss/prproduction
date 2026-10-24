-- PR Production — database schema, security policies and storage.
-- Run once in Supabase → SQL Editor (or `supabase db push`).

create extension if not exists pgcrypto;

-- ───────────────────────── Administrators ─────────────────────────
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

-- ───────────────────────── Portfolio ─────────────────────────
create table if not exists public.portfolio_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text,
  sort_order int not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 2 and 140),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  -- RESTRICT: a category with projects cannot be deleted until they are reassigned.
  category_id uuid references public.portfolio_categories(id) on delete restrict,
  location text,
  event_date date,
  description text,
  cover_image_url text,
  drive_folder_url text,
  video_url text,
  film_type text check (film_type in ('wedding-highlight','pre-wedding','event','brand')),
  is_featured boolean not null default false,
  is_published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists portfolio_projects_published_idx on public.portfolio_projects (is_published, sort_order);
create index if not exists portfolio_projects_category_idx on public.portfolio_projects (category_id);

create table if not exists public.portfolio_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.portfolio_projects(id) on delete cascade,
  url text not null,
  alt text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists portfolio_images_project_idx on public.portfolio_images (project_id, sort_order);

-- ───────────────────────── Bookings & payments ─────────────────────────
create table if not exists public.booking_inquiries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 2 and 100),
  whatsapp_number text not null check (char_length(whatsapp_number) between 7 and 20),
  email text check (email is null or char_length(email) <= 160),
  event_type text not null check (char_length(event_type) <= 80),
  event_date date,
  event_city text not null check (char_length(event_city) <= 80),
  state text not null check (char_length(state) <= 80),
  venue text check (venue is null or char_length(venue) <= 160),
  budget_range text check (budget_range is null or char_length(budget_range) <= 80),
  shoot_duration text check (shoot_duration is null or char_length(shoot_duration) <= 80),
  preferred_contact_time text check (preferred_contact_time is null or char_length(preferred_contact_time) <= 80),
  message text not null check (char_length(message) between 10 and 2000),
  status text not null default 'new'
    check (status in ('new','contacted','discussion','quotation_sent','confirmed','completed','cancelled')),
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists booking_inquiries_created_idx on public.booking_inquiries (created_at desc);
create index if not exists booking_inquiries_status_idx on public.booking_inquiries (status);

create table if not exists public.payment_records (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  inquiry_id uuid references public.booking_inquiries(id) on delete set null,
  client_name text,
  description text,
  amount_paise int not null check (amount_paise >= 100),
  currency text not null default 'INR',
  status text not null default 'created' check (status in ('created','pending','paid','failed','cancelled')),
  razorpay_order_id text unique,
  razorpay_payment_id text unique,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ───────────────────────── Content ─────────────────────────
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  event_type text,
  review text not null,
  photo_url text,
  is_published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.website_settings (
  id int primary key default 1 check (id = 1),
  tagline text, brand_statement text, location_statement text,
  intro_heading text, intro_text text,
  logo_url text, hero_image_url text, hero_video_url text, intro_image_url text,
  whatsapp_number text, email text, instagram_url text, youtube_url text, address text,
  service_regions text[], service_cities text[], footer_text text, budget_ranges text[],
  account_holder text, upi_id text, bank_name text, account_number text, ifsc text,
  payment_instructions text, payment_qr_url text, support_whatsapp text,
  updated_at timestamptz not null default now()
);
insert into public.website_settings (id) values (1) on conflict (id) do nothing;

-- updated_at triggers
do $$
declare t text;
begin
  foreach t in array array['portfolio_categories','portfolio_projects','booking_inquiries','payment_records','testimonials','website_settings'] loop
    execute format('drop trigger if exists touch_%1$s on public.%1$s', t);
    execute format('create trigger touch_%1$s before update on public.%1$s for each row execute function public.touch_updated_at()', t);
  end loop;
end $$;

-- ───────────────────────── Row Level Security ─────────────────────────
alter table public.admins enable row level security;
alter table public.portfolio_categories enable row level security;
alter table public.portfolio_projects enable row level security;
alter table public.portfolio_images enable row level security;
alter table public.booking_inquiries enable row level security;
alter table public.payment_records enable row level security;
alter table public.testimonials enable row level security;
alter table public.website_settings enable row level security;

-- admins: an admin can see the admin list; nobody can change it through the API.
drop policy if exists "admins read" on public.admins;
create policy "admins read" on public.admins for select to authenticated using (public.is_admin());

-- categories: public sees visible ones; admins manage all.
drop policy if exists "categories public read" on public.portfolio_categories;
create policy "categories public read" on public.portfolio_categories for select using (is_visible or public.is_admin());
drop policy if exists "categories admin write" on public.portfolio_categories;
create policy "categories admin write" on public.portfolio_categories for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- projects: public sees published ones; admins manage all.
drop policy if exists "projects public read" on public.portfolio_projects;
create policy "projects public read" on public.portfolio_projects for select using (is_published or public.is_admin());
drop policy if exists "projects admin write" on public.portfolio_projects;
create policy "projects admin write" on public.portfolio_projects for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- images: visible when their project is.
drop policy if exists "images public read" on public.portfolio_images;
create policy "images public read" on public.portfolio_images for select using (
  public.is_admin() or exists (select 1 from public.portfolio_projects p where p.id = project_id and p.is_published)
);
drop policy if exists "images admin write" on public.portfolio_images;
create policy "images admin write" on public.portfolio_images for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- inquiries: anyone may submit (insert only, status must be 'new', no notes); only admins read/update/delete.
drop policy if exists "inquiries public insert" on public.booking_inquiries;
create policy "inquiries public insert" on public.booking_inquiries for insert to anon, authenticated
  with check (status = 'new' and internal_notes is null);
drop policy if exists "inquiries admin read" on public.booking_inquiries;
create policy "inquiries admin read" on public.booking_inquiries for select to authenticated using (public.is_admin());
drop policy if exists "inquiries admin update" on public.booking_inquiries;
create policy "inquiries admin update" on public.booking_inquiries for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "inquiries admin delete" on public.booking_inquiries;
create policy "inquiries admin delete" on public.booking_inquiries for delete to authenticated using (public.is_admin());

-- payments: admins only. Visitors' checkout goes through server routes using the service role.
drop policy if exists "payments admin all" on public.payment_records;
create policy "payments admin all" on public.payment_records for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- testimonials
drop policy if exists "testimonials public read" on public.testimonials;
create policy "testimonials public read" on public.testimonials for select using (is_published or public.is_admin());
drop policy if exists "testimonials admin write" on public.testimonials;
create policy "testimonials admin write" on public.testimonials for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- settings: everything stored here is shown on the public site, so it is publicly readable; only admins edit.
drop policy if exists "settings public read" on public.website_settings;
create policy "settings public read" on public.website_settings for select using (true);
drop policy if exists "settings admin update" on public.website_settings;
create policy "settings admin update" on public.website_settings for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- The anon role must not be able to read inquiries even by RETURNING after insert.
revoke select on public.booking_inquiries from anon;
grant insert on public.booking_inquiries to anon;

-- ───────────────────────── Storage (logo, QR, covers) ─────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 10485760, array['image/jpeg','image/png','image/webp','image/avif','image/gif'])
on conflict (id) do nothing;

drop policy if exists "media admin insert" on storage.objects;
create policy "media admin insert" on storage.objects for insert to authenticated with check (bucket_id = 'media' and public.is_admin());
drop policy if exists "media admin update" on storage.objects;
create policy "media admin update" on storage.objects for update to authenticated using (bucket_id = 'media' and public.is_admin());
drop policy if exists "media admin delete" on storage.objects;
create policy "media admin delete" on storage.objects for delete to authenticated using (bucket_id = 'media' and public.is_admin());

-- ───────────────────────── Default categories ─────────────────────────
insert into public.portfolio_categories (name, slug, sort_order) values
  ('Wedding','wedding',1), ('Traditional Wedding','traditional-wedding',2), ('Candid Wedding','candid-wedding',3),
  ('Pre-Wedding','pre-wedding',4), ('Engagement','engagement',5), ('Haldi','haldi',6), ('Mehendi','mehendi',7),
  ('Sangeet','sangeet',8), ('Reception','reception',9), ('Wedding Cinematography','wedding-cinematography',10),
  ('Birthday','birthday',11), ('Maternity','maternity',12), ('Baby and Newborn','baby-and-newborn',13),
  ('Corporate','corporate',14), ('Events','events',15), ('Commercial Shoots','commercial-shoots',16),
  ('Brand Films','brand-films',17)
on conflict (slug) do nothing;

-- ───────────────────────── Make yourself an admin ─────────────────────────
-- 1. Supabase → Authentication → Users → Add user (email + strong password).
-- 2. Run (with your email):
--    insert into public.admins (user_id, email)
--    select id, email from auth.users where email = 'you@example.com';
