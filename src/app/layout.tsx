import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { BRAND, DEFAULT_DESCRIPTION, DEFAULT_TITLE, SITE_URL } from "@/lib/config/site";
// @ts-expect-error Next.js handles CSS side-effect imports.
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: DEFAULT_TITLE, template: `%s | ${BRAND}` },
  description: DEFAULT_DESCRIPTION,
  applicationName: BRAND,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: BRAND,
    locale: "en_IN",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: "/",
  },
  twitter: { card: "summary_large_image", title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#080808",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${cormorant.variable} ${manrope.variable}`} suppressHydrationWarning>
      <head>
        {/* Marks JS as available before first paint so scroll reveals don't flash. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
