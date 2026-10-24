"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article";
}

/**
 * Fade-and-rise when scrolled into view. Pure CSS + IntersectionObserver, so content
 * stays visible without JavaScript and for visitors who prefer reduced motion
 * (see .reveal rules in globals.css).
 */
export function Reveal({ children, delay = 0, className, as: Tag = "div" }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      el.classList.add("is-visible");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as React.Ref<never>}
      className={cn("reveal", className)}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </Tag>
  );
}
