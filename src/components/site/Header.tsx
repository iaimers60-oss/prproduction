"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/lib/config/site";
import { cn } from "@/lib/utils";
import { buttonClass } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { Logo } from "./Logo";

interface Props {
  logoUrl: string | null;
  whatsappUrl: string | null;
}

export function Header({ logoUrl, whatsappUrl }: Props) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const whatsappHref = whatsappUrl ?? "/contact";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-700 ease-cinematic",
        // No backdrop-filter while the menu is open: it would trap the fixed overlay inside the header.
        open
          ? "border-b border-white/5 bg-ink py-3"
          : scrolled
            ? "border-b border-white/5 bg-ink/90 py-3 backdrop-blur-md"
            : "bg-gradient-to-b from-ink/70 to-transparent py-5",
      )}
    >
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-gold focus:px-4 focus:py-2 focus:text-ink">
        Skip to content
      </a>
      <div className="container-x flex items-center justify-between gap-6">
        <Logo logoUrl={logoUrl} />

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-9">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={isActive(l.href) ? "page" : undefined}
                  className={cn(
                    "relative py-2 text-[0.72rem] font-semibold uppercase tracking-[0.22em] transition-colors duration-300 hover:text-gold",
                    "after:absolute after:-bottom-0.5 after:left-0 after:h-px after:bg-gold after:transition-all after:duration-500",
                    isActive(l.href) ? "text-gold after:w-full" : "text-ivory/85 after:w-0 hover:after:w-full",
                  )}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={whatsappHref}
            {...(whatsappUrl ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            aria-label={whatsappUrl ? "Chat with PR Production on WhatsApp" : "Contact PR Production"}
            className="hidden h-11 w-11 items-center justify-center border border-ivory/20 text-ivory transition-colors hover:border-gold hover:text-gold md:flex"
          >
            <WhatsAppIcon />
          </a>
          <span className="hidden sm:block">
            <Link href="/booking" className={buttonClass("gold", "px-5 py-3")}>
              Book Your Shoot
            </Link>
          </span>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex h-11 w-11 items-center justify-center text-ivory lg:hidden"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 -z-10 overflow-y-auto bg-ink pt-[68px] lg:hidden"
          >
            <nav aria-label="Mobile" className="container-x flex min-h-full flex-col py-10">
              <ul className="space-y-1">
                {NAV_LINKS.map((l, i) => (
                  <motion.li
                    key={l.href}
                    initial={reduce ? false : { opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i + 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      href={l.href}
                      onClick={() => setOpen(false)}
                      aria-current={isActive(l.href) ? "page" : undefined}
                      className={cn("block border-b border-white/5 py-4 font-serif text-4xl", isActive(l.href) ? "text-gold" : "text-ivory")}
                    >
                      {l.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <div className="mt-auto grid gap-3 pt-10">
                <Link href="/booking" onClick={() => setOpen(false)} className={buttonClass("gold", "w-full")}>
                  Book Your Shoot
                </Link>
                <a
                  href={whatsappHref}
                  {...(whatsappUrl ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className={buttonClass("outline", "w-full")}
                >
                  <WhatsAppIcon className="h-4 w-4" /> {whatsappUrl ? "Chat on WhatsApp" : "Contact Us"}
                </a>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
