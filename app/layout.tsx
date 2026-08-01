import type { Metadata } from "next";
import { clash, switzer, jetbrains } from "./fonts";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const DESCRIPTION =
  "Find Werkstudent and Minijob roles in Germany and track your hours against the legal limits. For employers: hire students without breaking labor law.";

export const metadata: Metadata = {
  // Makes every relative canonical/OG URL resolve absolutely.
  metadataBase: new URL(siteUrl()),
  title: {
    default: "LaborLink — student jobs that keep you legal",
    template: "%s — LaborLink",
  },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "LaborLink",
    title: "LaborLink — student jobs that keep you legal",
    description: DESCRIPTION,
    locale: "en_DE",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "LaborLink — student jobs that keep you legal",
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
  },
  applicationName: "LaborLink",
  category: "employment",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${clash.variable} ${switzer.variable} ${jetbrains.variable}`}
    >
      <body className="font-body antialiased">
        <script
          type="application/ld+json"
          // Static, developer-authored JSON-LD. No user input reaches this.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "LaborLink",
              url: siteUrl(),
              description: DESCRIPTION,
              areaServed: { "@type": "Country", name: "Germany" },
            }),
          }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-signal focus:px-4 focus:py-2 focus:text-void"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
