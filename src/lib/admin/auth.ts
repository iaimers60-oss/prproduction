import "server-only";
import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/server";

/**
 * Ensures the current request comes from a signed-in administrator.
 * Redirects to the login page otherwise. Use at the top of every admin page and action.
 */
export async function requireAdmin() {
  const db = await createSessionClient();
  if (!db) redirect("/admin/login?setup=1");
  const { data: auth } = await db.auth.getUser();
  if (!auth.user) redirect("/admin/login");
  const { data: isAdmin } = await db.rpc("is_admin");
  if (!isAdmin) redirect("/admin/login?denied=1");
  return { db, user: auth.user };
}
