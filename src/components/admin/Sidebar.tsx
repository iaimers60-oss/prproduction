"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Images, FolderTree, Inbox, CreditCard, Settings, MessageSquareQuote, ExternalLink, LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/admin/actions";

const LINKS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/projects", label: "Portfolio", icon: Images },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/inquiries", label: "Inquiries", icon: Inbox },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <>
      <div className="flex items-center justify-between border-b border-white/10 bg-charcoal px-4 py-3 lg:hidden">
        <span className="font-serif text-xl">PR Production <span className="text-xs text-gold">Admin</span></span>
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label="Toggle admin menu" className="p-2">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      <aside className={cn("border-r border-white/10 bg-charcoal lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:flex-col", open ? "block" : "hidden lg:flex")}>
        <div className="hidden px-6 py-7 lg:block">
          <p className="font-serif text-2xl text-ivory">PR Production</p>
          <p className="eyebrow mt-1 text-[0.6rem]">Admin dashboard</p>
        </div>
        <nav aria-label="Admin" className="flex-1 px-3 py-3">
          <ul className="space-y-1">
            {LINKS.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  aria-current={active(href) ? "page" : undefined}
                  className={cn("flex items-center gap-3 px-3 py-2.5 text-sm transition-colors", active(href) ? "bg-gold/10 text-gold" : "text-ivory/75 hover:bg-white/5 hover:text-ivory")}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.6} /> {label}
                </Link>
              </li>
            ))}
            <li>
              <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2.5 text-sm text-ivory/75 hover:bg-white/5 hover:text-ivory">
                <ExternalLink className="h-4 w-4" strokeWidth={1.6} /> View website
              </a>
            </li>
          </ul>
        </nav>
        <div className="border-t border-white/10 px-6 py-5">
          <p className="truncate text-xs text-mist" title={email}>{email}</p>
          <form action={signOut} className="mt-3">
            <button type="submit" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-ivory/70 hover:text-gold">
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
