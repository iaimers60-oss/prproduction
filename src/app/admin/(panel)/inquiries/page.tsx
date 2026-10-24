import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { INQUIRY_STATUSES } from "@/lib/config/site";
import { cn, formatDate } from "@/lib/utils";
import type { BookingInquiry } from "@/types";

export const metadata = { title: "Inquiries" };

type Props = { searchParams: Promise<{ status?: string; deleted?: string }> };

export default async function InquiriesPage({ searchParams }: Props) {
  const { db } = await requireAdmin();
  const { status, deleted } = await searchParams;
  let q = db.from("booking_inquiries").select("*").order("created_at", { ascending: false }).limit(500);
  if (status && INQUIRY_STATUSES.some((s) => s.value === status)) q = q.eq("status", status);
  const { data } = await q;
  const rows = (data ?? []) as BookingInquiry[];

  return (
    <>
      <PageHeader title="Booking inquiries" description="Inquiries submitted through the website booking form. Internal notes are private and never shown on the website." />
      {deleted && <p role="status" className="mb-6 border border-gold/40 bg-gold/5 px-4 py-3 text-sm text-gold-soft">Inquiry deleted.</p>}
      <nav aria-label="Filter by status" className="mb-6 flex flex-wrap gap-2">
        <Link href="/admin/inquiries" className={cn("border px-3 py-1.5 text-xs uppercase tracking-[0.12em]", !status ? "border-gold bg-gold text-ink" : "border-white/15 hover:border-gold")}>All</Link>
        {INQUIRY_STATUSES.map((s) => (
          <Link key={s.value} href={`/admin/inquiries?status=${s.value}`} className={cn("border px-3 py-1.5 text-xs uppercase tracking-[0.12em]", status === s.value ? "border-gold bg-gold text-ink" : "border-white/15 hover:border-gold")}>{s.label}</Link>
        ))}
      </nav>
      {rows.length === 0 ? (
        <p className="border border-dashed border-white/15 p-12 text-center text-mist">No inquiries {status ? "with this status" : "yet"}.</p>
      ) : (
        <div className="overflow-x-auto border border-white/10">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-charcoal text-xs uppercase tracking-[0.15em] text-mist">
              <tr>
                <th scope="col" className="px-4 py-3">Client</th>
                <th scope="col" className="px-4 py-3">Phone</th>
                <th scope="col" className="px-4 py-3">Service</th>
                <th scope="col" className="px-4 py-3">Event date</th>
                <th scope="col" className="px-4 py-3">City</th>
                <th scope="col" className="px-4 py-3">Received</th>
                <th scope="col" className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3"><Link href={`/admin/inquiries/${r.id}`} className="font-medium text-ivory hover:text-gold">{r.full_name}</Link></td>
                  <td className="px-4 py-3 text-mist">{r.whatsapp_number}</td>
                  <td className="px-4 py-3 text-mist">{r.event_type}</td>
                  <td className="px-4 py-3 text-mist">{formatDate(r.event_date, { day: "numeric", month: "short", year: "numeric" }) ?? "—"}</td>
                  <td className="px-4 py-3 text-mist">{r.event_city}, {r.state}</td>
                  <td className="px-4 py-3 text-mist">{formatDate(r.created_at, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
