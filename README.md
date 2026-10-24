# PR Production — Website

Premium photography and cinematic production website for **PR Production**
(Chhattisgarh · Maharashtra · Odisha · Across India).

Built with Next.js 15 (App Router), TypeScript, Tailwind CSS 4, Supabase, WhatsApp click-to-chat
and optional Razorpay. Designed for Vercel.

---

## Contents

1. [What's included](#whats-included)
2. [Status: what works now, what needs your accounts](#status)
3. [Run it locally](#run-it-locally)
4. [Environment variables](#environment-variables)
5. [Supabase setup](#supabase-setup)
6. [Adding portfolio projects with Google Drive](#google-drive-workflow)
7. [Razorpay setup (optional)](#razorpay-setup-optional)
8. [Deploy to Vercel](#deploy-to-vercel)
9. [Connect your domain](#connect-your-domain)
10. [Launch checklist](#launch-checklist)
11. [Troubleshooting](#troubleshooting)
12. [Project structure](#project-structure)
13. [Testing](#testing)

---

## What's included

**Public pages**

| Route | Page |
| --- | --- |
| `/` | Home: cinematic hero, introduction, featured portfolio, services, featured films, values, process, testimonials (only when real ones exist), locations, CTA |
| `/about` | About Us |
| `/portfolio` | Portfolio with category filters, search, and load-more |
| `/portfolio/category/[slug]` | One category |
| `/portfolio/[slug]` | Project: cover, gallery with keyboard/touch lightbox, film, "View Full Gallery" (Drive), related projects, WhatsApp enquiry |
| `/services` | All 13 services with "Book This Service" (preselects the booking form) and WhatsApp |
| `/films` | Films grouped by type; YouTube/Vimeo load only when played |
| `/booking` | Booking form: client + server validation, spam protection, saves to the database, then WhatsApp follow-up with an editable message |
| `/contact` | WhatsApp message composer per service, contact channels |
| `/payment` | Official UPI/QR/bank details and optional Razorpay checkout |
| `/privacy-policy`, `/terms` | Legal templates (review before launch) |

**Admin dashboard** (`/admin`, sign-in at `/admin/login`)

- Overview: published projects, categories, inquiries, new inquiries, recent items, quick actions
- Portfolio: add / edit / delete, publish / unpublish, ★ feature, reorder, preview drafts, cover upload or URL, gallery URLs, Drive folder link, film link, link validation
- Categories: add / rename / reorder / hide / delete (blocked while a category still has projects)
- Inquiries: list, filter by status, status updates (New → Contacted → Discussion → Quotation Sent → Confirmed → Completed / Cancelled), private internal notes, reply on WhatsApp
- Payments: create a payment request for an agreed amount, share the link, see verified status
- Testimonials: add only genuine reviews; homepage section stays hidden until one is published
- Settings: tagline and copy, logo, hero image/video, intro photo, WhatsApp, email, Instagram, YouTube, address, regions, cities, budget ranges, UPI ID, QR code, bank details, payment instructions

**Also:** SEO metadata per page, canonical URLs, Open Graph image, `sitemap.xml`, `robots.txt`,
JSON-LD structured data, skip link, visible focus states, reduced-motion support, security headers.

### Content rules built into the site

- The brand name is **PR Production** everywhere.
- No phone numbers, emails, social links, payment details, reviews, awards or client counts are invented.
  Each appears only after you add it in **Admin → Settings**.
- Before Supabase is connected, the site shows **sample projects** with a visible "Sample" badge and
  placeholder artwork instead of photographs. They are excluded from the sitemap and marked `noindex`.
  Once Supabase is connected, only your real projects are shown.
- No QR code is generated. Only the official QR image you upload is shown.

---

## Status

| Feature | Status |
| --- | --- |
| All public pages, navigation, responsive layouts | ✅ Built and checked at 360 px and 1440 px (no horizontal overflow on any route) |
| WhatsApp links (all buttons, service messages, booking message) | ✅ Built and tested with a test number. Needs your number in Settings |
| Booking form | ✅ Tested end to end against a local Supabase-compatible stack: validation, honeypot, too-fast submissions, saving, WhatsApp follow-up |
| Database schema + Row Level Security | ✅ Migration applied to PostgreSQL 16 and checked with `supabase/tests/rls_test.sql` (anon, signed-in non-admin, admin) |
| Admin login + dashboard | ✅ Tested end to end (sign-in, non-admin rejection, projects, categories, inquiries, payments, settings). Needs your Supabase project |
| Image uploads (logo, QR, covers) | ⚙️ Implemented with Supabase Storage. Not exercised locally (Storage service was not available in testing) — try one upload after setup |
| Google Drive images | ⚙️ Implemented (file links are converted for display; folder links power "View Full Gallery"). Live Google access could not be tested from the build environment — add one project after setup and check it displays |
| Razorpay | ⚙️ Order creation, signature verification, webhook and duplicate protection implemented. Signature verification, webhook and "already paid" logic tested locally; creating a real order needs your Razorpay **test** keys |
| Automatic Google Drive folder sync | ❌ Not implemented (see [Google Drive](#google-drive-workflow) for why and what it would take) |
| Deployment | ❌ Not deployed yet — follow [Deploy to Vercel](#deploy-to-vercel) |

---

## Run it locally

Requirements: **Node.js 20.9+** and npm.

```bash
npm install
cp .env.example .env.local      # then fill in values, or leave Supabase empty to preview with samples
npm run dev                      # http://localhost:3000
```

Without any environment variables the site runs in preview mode with sample content, and the admin
login page explains what to configure.

Other commands:

```bash
npm run build     # production build
npm start         # run the production build
npm run typecheck # TypeScript
npm test          # unit tests (WhatsApp links, Drive links, video URLs, validation)
```

---

## Environment variables

See `.env.example`. Never commit `.env.local`.

| Variable | Where it's used | Secret? |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical URLs, sitemap, Open Graph, payment links | No |
| `NEXT_PUBLIC_SUPABASE_URL` | Database, admin login | No |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public reads and booking inserts (protected by RLS) | No (public by design) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only**: payment API routes | **Yes** |
| `RAZORPAY_KEY_ID` | Checkout | No |
| `RAZORPAY_KEY_SECRET` | **Server only**: order creation, signature verification | **Yes** |
| `RAZORPAY_WEBHOOK_SECRET` | **Server only**: webhook verification | **Yes** |

Secrets are only read in server files (`server-only` imports). Nothing secret is prefixed with `NEXT_PUBLIC_`.
Google Drive needs no API key for the link-based workflow.

---

## Supabase setup

1. Create a free project at [supabase.com](https://supabase.com) (choose the Mumbai region for India).
2. **SQL Editor → New query**, paste the contents of `supabase/migrations/0001_init.sql`, and run it.
   It creates the tables, security policies, the `media` storage bucket, and the default categories.
   It is safe to run again.
3. **Authentication → Users → Add user**: create your admin login with a strong password
   (tick "Auto confirm user").
4. Make that user an administrator (SQL Editor):
   ```sql
   insert into public.admins (user_id, email)
   select id, email from auth.users where email = 'you@yourdomain.com';
   ```
5. **Authentication → Sign In / Providers**: turn off "Allow new users to sign up" so nobody else can
   create accounts. (Even if someone signs up, they cannot access the admin without being in `admins`.)
6. **Project Settings → API**: copy the Project URL, `anon` key, and `service_role` key into your
   environment variables.
7. Restart `npm run dev`, open `/admin/login`, sign in, and fill in **Settings**.

### What the security policies enforce

- Visitors can read only **published** projects, their images, visible categories, published
  testimonials, and the website settings.
- Visitors can **create** a booking inquiry but cannot read, change or delete any inquiry, and cannot set
  its status or internal notes.
- Payment records are not readable by visitors at all; the payment API routes use the service role on
  the server and only ever return the reference, name, description, amount and status for a reference
  the client already has.
- Only users listed in `admins` can change anything. The `admins` table itself cannot be changed through
  the API.
- Categories that still have projects cannot be deleted (database foreign key).

---

## Google Drive workflow

The site stores **links**, not files. Originals stay in your Google Drive.

1. In Google Drive, create folders like `PR Production / Weddings / Aarav & Meera — Raipur`.
2. Upload web-sized copies of your best images (about 2000 px on the long edge, under ~1 MB each)
   for display. Keep full-resolution originals wherever you like.
3. For each image you want on the website: right-click → **Share** → General access:
   **Anyone with the link · Viewer** → **Copy link**.
4. Open **Admin → Portfolio → Add project**, enter the title and category, and paste:
   - one image link as the **Cover image URL** (or upload a cover file),
   - image links into **Gallery image URLs**, one per line, in display order,
   - optionally, the **folder** link as **Google Drive folder URL** — this becomes the
     "View Full Gallery" button. Only add folders the client is happy to make public.
5. Tick **Published** (and ★ **Featured** for the homepage) and save. The website updates within a minute.

How it works and its limits:

- A Drive *file* link (`drive.google.com/file/d/<ID>/view`) is an HTML page, not an image.
  The site converts it to `https://lh3.googleusercontent.com/d/<ID>` for display, which works only when
  the file is shared as "Anyone with the link". This is a widely used approach but it is not an official,
  documented Google API, so Google could change it. If images ever stop appearing, upload covers through
  the admin (Supabase Storage) or use any other https image host — every image field accepts normal URLs.
- A *folder* link can't be shown as images; it is only used as a link.
- When you save, the admin checks every link: it rejects folder links used as images, Drive links
  without a file ID, private files ("not public — set Anyone with the link"), 404s, and links that open a
  web page instead of an image. If Google is slow, tick "Skip link check".
- Private client galleries should **not** be added as public folder links.

**Automatic folder scanning** (adding a folder and having every photo appear automatically) is *not*
implemented. It would need the Google Drive API with a service account or OAuth, a server job to list
folder contents, and a decision about which files are public. It can be added later without changing
the database layout (it would fill `portfolio_images`).

---

## Razorpay setup (optional)

Online payments are off until all of these are set: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`,
`RAZORPAY_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`. Until then, `/payment` shows only your
UPI/bank details and says online checkout is not available.

1. Create a Razorpay account and complete KYC. Start in **Test mode**.
2. **Settings → API Keys → Generate Test Key**. Put the Key ID and Key Secret in your environment.
3. **Settings → Webhooks → Add new webhook**
   - URL: `https://your-domain.com/api/payments/webhook`
   - Secret: any long random string → `RAZORPAY_WEBHOOK_SECRET`
   - Events: `payment.captured`, `order.paid`, `payment.failed`
4. Redeploy. In **Admin → Payments**, create a payment request (client name + agreed amount).
   Share the link it gives you (`/payment?ref=PR-XXXXXXXX`).
5. Pay with a [Razorpay test card](https://razorpay.com/docs/payments/payments/test-card-details/)
   and confirm the status changes to **Paid** in the admin.
6. Switch to Live keys when ready (the admin shows which mode is active).

How it stays safe:

- The amount always comes from the payment record in the database, never from the browser.
- Orders are created on the server; one order per request is reused to avoid duplicates.
- Success is shown only after the server verifies Razorpay's HMAC signature. The webhook (also
  signature-verified) records payments even if the visitor closes the tab.
- A paid request can't be paid again; cancelled requests can't be paid.
- UPI/bank transfers made outside Razorpay aren't tracked automatically — confirm them in your bank app.

---

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. On [vercel.com](https://vercel.com): **Add New → Project → Import** the repository. Framework:
   Next.js (auto-detected). No build settings need changing.
3. Add the environment variables from `.env.example` (Production and Preview).
   Set `NEXT_PUBLIC_SITE_URL` to your final domain.
4. Deploy. After the first deploy, open `/admin/login` on the live site and sign in.
5. If you use Razorpay, update the webhook URL to the live domain.

---

## Connect your domain

1. Vercel → Project → **Settings → Domains → Add** `yourdomain.com` and `www.yourdomain.com`.
2. At your domain registrar, add the DNS records Vercel shows (usually an `A` record to `76.76.21.21`
   for the root and a `CNAME` to `cname.vercel-dns.com` for `www`).
3. Wait for verification (minutes to a few hours). HTTPS is automatic.
4. Update `NEXT_PUBLIC_SITE_URL` to the final domain and redeploy.
5. Submit `https://yourdomain.com/sitemap.xml` in Google Search Console. If you have a verified
   Google Business Profile, link it from your website settings/footer once it exists.

---

## Launch checklist

- [ ] Real assets added (see `docs/ASSET_CHECKLIST.md`)
- [ ] Supabase migration run, admin user created, public sign-ups disabled
- [ ] WhatsApp number, email and social links set in Admin → Settings; test a WhatsApp button on a phone
- [ ] At least 6 real projects published, 4–5 featured
- [ ] One test booking submitted and visible in Admin → Inquiries
- [ ] Payment details and official QR checked by the account holder
- [ ] Razorpay tested in test mode (if used), then switched to live
- [ ] Privacy Policy and Terms reviewed and dated
- [ ] `NEXT_PUBLIC_SITE_URL` set to the real domain
- [ ] Test on an Android phone and an iPhone

---

## Troubleshooting

| Problem | Fix |
| --- | --- |
| Admin login says Supabase is not configured | Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, then restart/redeploy |
| "This account is not authorised" | Run the `insert into public.admins …` SQL for that email |
| Booking form says inquiries are not stored | Supabase env vars missing, or the migration was not run |
| Drive image shows a placeholder / broken image | The file isn't shared as "Anyone with the link", or a folder link was used. Re-copy the file's share link |
| "Could not reach this link" when saving a project | Google was slow or blocked; tick "Skip link check" if you're sure the link is public |
| WhatsApp buttons missing | No valid WhatsApp number in Settings (must include the country code or be a 10-digit Indian mobile) |
| Changes don't appear immediately | Public pages refresh within 60 seconds; admin saves refresh them immediately |
| Payment stays "Pending" | Check the Razorpay webhook URL/secret and that the events are enabled |
| Upload fails | Check the `media` bucket exists (re-run the migration) and the file is an image under 10 MB |
| Build error about fonts | The build downloads Google Fonts; make sure the build machine has internet access |

---

## Project structure

```
src/
  app/
    (site)/            public pages (shared header, footer, WhatsApp button)
    admin/             login + protected dashboard ((panel) route group)
    api/booking        booking inquiries
    api/payments       lookup, order, verify, webhook
    sitemap.ts, robots.ts, opengraph-image.tsx
  components/
    site/              header, footer, hero, CTA, service card, logo
    portfolio/         project card, explorer (filters/search), gallery, lightbox, video, project view
    forms/             booking form, WhatsApp composer, Razorpay checkout
    admin/             sidebar, forms, tables, status badges
    ui/                buttons, reveal animation, images, placeholders, icons
  lib/
    config/            brand constants, services, default settings
    data/              public data access + sample content
    admin/             auth guard, server actions, link checks
    supabase/          clients (public, session, service role)
    whatsapp.ts, drive.ts, video.ts, validation.ts, razorpay.ts, rate-limit.ts, utils.ts
  types/
supabase/
  migrations/0001_init.sql
  tests/rls_test.sql
docs/ASSET_CHECKLIST.md
tests/                 unit tests
```

---

## Testing

- `npm test` — unit tests for WhatsApp number/URL building, inquiry messages, Drive link conversion and
  validation, video URL parsing, and the booking/project validation schemas.
- `supabase/tests/rls_test.sql` — run in a **non-production** database after the migration to check
  the security policies (it inserts test rows).
- Before launch, repeat by hand on the live site: one booking, one admin edit, one WhatsApp click on a
  phone, and (if used) one Razorpay test payment.
