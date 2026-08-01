import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Signed-in areas hold personal data and have no business being
        // crawled. They are behind auth anyway; this stops crawlers wasting
        // budget on redirect chains.
        disallow: ["/dashboard/", "/employer/", "/login", "/signup", "/api/"],
      },
    ],
    sitemap: `${siteUrl()}/sitemap.xml`,
    host: siteUrl(),
  };
}
