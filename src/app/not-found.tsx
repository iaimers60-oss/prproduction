import Link from "next/link";
import { buttonClass } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <p className="eyebrow">404 · PR Production</p>
      <h1 className="mt-6 text-5xl sm:text-7xl">This frame is missing.</h1>
      <p className="mt-4 max-w-md text-mist">The page you were looking for has moved or no longer exists.</p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link href="/" className={buttonClass("gold")}>Go to homepage</Link>
        <Link href="/portfolio" className={buttonClass("outline")}>View portfolio</Link>
      </div>
    </main>
  );
}
