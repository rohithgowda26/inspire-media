import type { Metadata, Viewport } from "next";
import { Anton, JetBrains_Mono, Manrope } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

/** Geometric sans used for everything (headlines, UI, body). */
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

/** Condensed display face for the outlined footer wordmark. */
const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton", display: "swap" });

/** Monospace for small uppercase labels (footer, popup eyebrow). */
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-jbmono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Performance Marketing for Brands & D2C`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  keywords: [
    "performance marketing agency",
    "D2C marketing",
    "SEO agency Hubli",
    "Meta ads",
    "Google ads",
    "creative content strategy",
    "Inspire Media",
  ],
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#020306",
  colorScheme: "dark",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: site.name,
  description: site.description,
  url: site.url,
  email: site.contact.email,
  telephone: site.contact.phones.map((p) => p.tel),
  address: {
    "@type": "PostalAddress",
    streetAddress: site.contact.address.line1,
    addressLocality: site.contact.address.city,
    postalCode: site.contact.address.postalCode,
    addressRegion: site.contact.address.region,
    addressCountry: site.contact.address.country,
  },
  sameAs: [site.contact.instagram.url],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" className={`${manrope.variable} ${anton.variable} ${mono.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-ink"
        >
          Skip to content
        </a>
        {children}
        <script
          type="application/ld+json"
          // Static, trusted object defined above — safe to serialise.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </body>
    </html>
  );
}
