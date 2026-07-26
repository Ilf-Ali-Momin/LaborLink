import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Supabase origin for connect-src/img-src, derived from env so each
// environment points at its own project (preview never sees production).
const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

const csp = [
  "default-src 'self'",
  // Next.js injects inline styles for fonts and critical CSS.
  "style-src 'self' 'unsafe-inline'",
  // TODO(security): move to nonce-based script-src via middleware before launch.
  isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${supabaseOrigin}`.trim(),
  `connect-src 'self' ${supabaseOrigin}`.trim(),
  "font-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  ...(isDev
    ? []
    : [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]),
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
