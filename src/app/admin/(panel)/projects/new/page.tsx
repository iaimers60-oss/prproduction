import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { PageHeader } from "@/components/admin/PageHeader";
import { ProjectForm } from "@/components/admin/ProjectForm";
import type { Category } from "@/types";

export const metadata = { title: "Add project" };

export default async function NewProjectPage() {
  const { db } = await requireAdmin();
  const { data } = await db.from("portfolio_categories").select("*").order("sort_order");
  return (
    <>
      <PageHeader title="Add project" description="Store originals in Google Drive, then paste the cover, gallery, and folder links here." actions={<Link href="/admin/projects" className="text-xs uppercase tracking-[0.15em] text-mist hover:text-gold">← All projects</Link>} />
      <ProjectForm categories={(data ?? []) as Category[]} />
    </>
  );
}
