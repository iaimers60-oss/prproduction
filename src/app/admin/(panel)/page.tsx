import Link from "next/link";
import { Plus, Settings, CreditCard, Inbox } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatDate } from "@/lib/utils";
import type { BookingInquiry, Project } from "@/types";

export const metadata = { title: "Overview" };

export default async function AdminOverview() {
  const { db } = await requireAdmin();
  const [published, categories, inquiries, newInquiries, recentInquiries, recentProjects] = await Promise.all([
    db.from("portfolio_projects").select("id", { count: "exact", head: true }).eq("is_published", true),
    db.from("portfolio_categories").select("id", { count: "exact", head: true }),
    db.from("booking_inquiries").select("id", { count: "exact", head: true }),
    db.from("booking_inquiries").select("id", { count: "exact", head: true }).eq("status", "new"),
    db.from("booking_inquiries").select("id, full_name, event_type, event_city, event_date, status, created_at").order("created_at", { ascending: false }).limit(6),
    db.from("portfolio_projects").select("id, title, is_published, created_at").order("created_at", { ascending: false }).limit(6),
  ]);

  const stats = [
    { label: "Published projects", value: published.count ?? 0, href: "/admin/projects" },
    { label: "Categories", value: categories.count ?? 0, href: "/admin/categories" },
    { label: "Booking inquiries", value: inquiries.count ?? 0, href: "/admin/inquiries" },
    { label: "New inquiries", value: newInquiries.count ?? 0, href: "/admin/inquiries?status=new" },
  ];

  return (
    <>
      <PageHeader title="Overview" description="Welcome to the PR Production admin dashboard." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="border border-white/10 bg-charcoal/60 p-6 transition-colors hover:border-gold/40">
            <p className="text-xs uppercase tracking-[0.2em] text-mist">{s.label}</p>
            <p className="mt-3 font-serif text-5xl text-ivory">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/admin/projects/new" className="inline-flex items-center gap-2 bg-gold px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-ink"><Plus className="h-4 w-4" /> Add project</Link>
        <Link href="/admin/inquiries" className="inline-flex items-center gap-2 border border-white/20 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] hover:border-gold"><Inbox className="h-4 w-4" /> Inquiries</Link>
        <Link href="/admin/payments" className="inline-flex items-center gap-2 border border-white/20 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] hover:border-gold"><CreditCard className="h-4 w-4" /> Payment request</Link>
        <Link href="/admin/settings" className="inline-flex items-center gap-2 border border-white/20 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] hover:border-gold"><Settings className="h-4 w-4" /> Settings</Link>
      </div>

      <div className="mt-12 grid gap-10 xl:grid-cols-2">
        <section>
          <h2 className="text-2xl">Recent inquiries</h2>
          <ul className="mt-4 divide-y divide-white/10 border-y border-white/10">
            {((recentInquiries.data ?? []) as BookingInquiry[]).map((q) => (
              <li key={q.id}>
                <Link href={`/admin/inquiries/${q.id}`} className="flex items-center justify-between gap-4 py-3 hover:text-gold">
                  <span>
                    <span className="block text-sm text-ivory">{q.full_name}</span>
                    <span className="block text-xs text-mist">{q.event_type} · {q.event_city} · {formatDate(q.created_at, { day: "numeric", month: "short" })}</span>
                  </span>
                  <StatusBadge status={q.status} />
                </Link>
              </li>
            ))}
            {!recentInquiries.data?.length && <li className="py-6 text-sm text-mist">No inquiries yet.</li>}
          </ul>
        </section>
        <section>
          <h2 className="text-2xl">Recently added projects</h2>
          <ul className="mt-4 divide-y divide-white/10 border-y border-white/10">
            {((recentProjects.data ?? []) as Project[]).map((p) => (
              <li key={p.id}>
                <Link href={`/admin/projects/${p.id}`} className="flex items-center justify-between gap-4 py-3 hover:text-gold">
                  <span className="text-sm text-ivory">{p.title}</span>
                  <span className={p.is_published ? "text-xs text-gold" : "text-xs text-mist"}>{p.is_published ? "Published" : "Draft"}</span>
                </Link>
              </li>
            ))}
            {!recentProjects.data?.length && <li className="py-6 text-sm text-mist">No projects yet. <Link className="text-gold underline" href="/admin/projects/new">Add your first project</Link>.</li>}
          </ul>
        </section>
      </div>
    </>
  );
}
