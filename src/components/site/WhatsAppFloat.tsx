"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { cn } from "@/lib/utils";

/** Floating WhatsApp shortcut. Hidden when no number is configured. */
export function WhatsAppFloat({ href }: { href: string | null }) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The booking page already offers WhatsApp in the form flow.
  if (!href || pathname.startsWith("/booking")) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with PR Production on WhatsApp"
      className={cn(
        "group fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-4 z-40 flex items-center gap-3 transition-all duration-500 sm:right-6",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
      )}
    >
      <span className="pointer-events-none hidden whitespace-nowrap bg-charcoal/95 px-4 py-2 text-xs font-medium tracking-wide text-ivory opacity-0 shadow-lg ring-1 ring-white/10 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 sm:block">
        Chat with us on WhatsApp
      </span>
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-8px_rgba(37,211,102,0.55)] transition-transform duration-300 group-hover:scale-105">
        <WhatsAppIcon className="h-7 w-7" />
      </span>
    </a>
  );
}
