"use client";

import Link from "next/link";
import { buttonClass } from "@/components/ui/Button";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center px-6 text-center">
      <p className="eyebrow">PR Production</p>
      <h1 className="mt-6 text-5xl">Something went wrong.</h1>
      <p className="mt-4 max-w-md text-mist">Please try again. If the problem continues, contact us.</p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={reset} className={buttonClass("gold")}>Try again</button>
        <Link href="/" className={buttonClass("outline")}>Go to homepage</Link>
      </div>
    </main>
  );
}
