import localFont from "next/font/local";
import { JetBrains_Mono } from "next/font/google";

// Self-hosted (GDPR: no runtime requests to font CDNs).
export const clash = localFont({
  src: [
    { path: "./fonts/clash-display-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/clash-display-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-clash",
  display: "swap",
});

export const switzer = localFont({
  src: [
    { path: "./fonts/switzer-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/switzer-500.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-switzer",
  display: "swap",
});

// next/font/google downloads at build time and self-hosts; no client request to Google.
export const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});
