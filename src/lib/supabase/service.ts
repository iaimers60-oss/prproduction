import "server-only";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, isSupabaseConfigured } from "./env";

/**
 * Service-role client. SERVER ONLY: bypasses Row Level Security.
 * Used solely by the payment API routes, which must read and update
 * payment records on behalf of a visitor who is not logged in.
 */
export function createServiceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!isSupabaseConfigured || !key) return null;
  return createClient(SUPABASE_URL, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
