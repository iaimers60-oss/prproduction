import { requireAdmin } from "@/lib/admin/auth";
import { Sidebar } from "@/components/admin/Sidebar";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdmin();
  return (
    <div className="lg:flex">
      <Sidebar email={user.email ?? ""} />
      <main className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:px-12 lg:py-12">{children}</main>
    </div>
  );
}
