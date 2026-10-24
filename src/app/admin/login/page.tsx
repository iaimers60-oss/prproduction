import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./LoginForm";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "Admin Login" };

type Props = { searchParams: Promise<{ next?: string; denied?: string }> };

export default async function AdminLoginPage({ searchParams }: Props) {
  const { next = "/admin", denied } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-16">
      <div className="w-full max-w-md">
        <Link href="/" className="font-serif text-3xl text-ivory">PR Production</Link>
        <p className="eyebrow mt-2">Admin dashboard</p>
        <div className="mt-10 border border-white/10 bg-charcoal/70 p-8">
          <h1 className="text-3xl">Sign in</h1>
          {isSupabaseConfigured ? (
            <>
              {denied && <p role="alert" className="mt-4 text-sm text-red-200">This account is not authorised as an administrator.</p>}
              <div className="mt-8"><LoginForm next={next} /></div>
            </>
          ) : (
            <div className="mt-6 space-y-3 text-sm leading-relaxed text-mist">
              <p className="text-gold-soft">The admin dashboard needs Supabase.</p>
              <p>Set <code className="text-ivory">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="text-ivory">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, run the SQL migration, and create an admin user. Step-by-step instructions are in the README.</p>
            </div>
          )}
        </div>
        <Link href="/" className="mt-6 inline-block text-xs uppercase tracking-[0.2em] text-mist hover:text-gold">← Back to website</Link>
      </div>
    </main>
  );
}
