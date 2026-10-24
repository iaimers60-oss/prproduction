import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { deleteInquiry } from "@/lib/admin/actions";
import { PageHeader } from "@/components/admin/PageHeader";
import { InquiryForm } from "@/components/admin/InquiryForm";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmSubmit } from "@/components/admin/ui";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { formatDate } from "@/lib/utils";
import type { BookingInquiry } from "@/types";

export const metadata = { title: "Inquiry" };

type Props = { params: Promise<{ id: string }> };

export default async function InquiryPage({ params }: Props) {
  const { db } = await requireAdmin();
  const { id } = await params;
  const { data } = await db.from("booking_inquiries").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const q = data as BookingInquiry;
  const reply = buildWhatsAppUrl(q.whatsapp_number, `Hello ${q.full_name}, thank you for contacting PR Production about your ${q.event_type.toLowerCase()} in ${q.event_city}.`);
  const rows: [string, string | null][] = [
    ["WhatsApp", q.whatsapp_number],
    ["Email", q.email],
    ["Event type", q.event_type],
    ["Event date", formatDate(q.event_date) ?? "Not decided"],
    ["City / State", `${q.event_city}, ${q.state}`],
    ["Venue", q.venue],
    ["Budget range", q.budget_range],
    ["Shoot duration", q.shoot_duration],
    ["Preferred contact time", q.preferred_contact_time],
    ["Received", formatDate(q.created_at, { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })],
    ["Reference", q.id.slice(0, 8).toUpperCase()],
  ];

  return (
    <>
      <PageHeader title={q.full_name} actions={<Link href="/admin/inquiries" className="text-xs uppercase tracking-[0.15em] text-mist hover:text-gold">← All inquiries</Link>} />
      <div className="grid gap-10 xl:grid-cols-[1.4fr_1fr]">
        <section>
          <div className="mb-4"><StatusBadge status={q.status} /></div>
          <dl className="divide-y divide-white/10 border-y border-white/10 text-sm">
            {rows.filter(([, v]) => v).map(([k, v]) => (
              <div key={k} className="grid grid-cols-[10rem_1fr] gap-4 py-3"><dt className="text-mist">{k}</dt><dd className="break-words text-ivory">{v}</dd></div>
            ))}
          </dl>
          <h2 className="mt-8 text-2xl">Message</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ivory/90">{q.message}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            {reply && <a href={reply} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#25D366] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-ink"><WhatsAppIcon className="h-4 w-4" /> Reply on WhatsApp</a>}
            {q.email && <a href={`mailto:${q.email}`} className="inline-flex items-center border border-white/20 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] hover:border-gold">Email</a>}
            <Link href={`/admin/payments?inquiry=${q.id}&name=${encodeURIComponent(q.full_name)}`} className="inline-flex items-center border border-white/20 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] hover:border-gold">Create payment request</Link>
          </div>
        </section>
        <section className="border border-white/10 bg-charcoal/60 p-6">
          <h2 className="mb-6 text-2xl">Manage</h2>
          <InquiryForm inquiry={q} />
          <form action={deleteInquiry} className="mt-8 border-t border-white/10 pt-4">
            <input type="hidden" name="id" value={q.id} />
            <ConfirmSubmit message="Delete this inquiry permanently?">Delete inquiry</ConfirmSubmit>
          </form>
        </section>
      </div>
    </>
  );
}
