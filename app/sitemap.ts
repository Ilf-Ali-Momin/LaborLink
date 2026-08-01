import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { siteUrl } from "@/lib/site";

/**
 * Only publicly reachable pages. Active listings and company pages come
 * from the database, so a closed role drops out of the sitemap instead of
 * leaving Google with a dead entry.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/jobs`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/compliance`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/for-employers`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/companies`, changeFrequency: "daily", priority: 0.6 },
    { url: `${base}/pricing`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/impressum`, changeFrequency: "yearly", priority: 0.1 },
    { url: `${base}/datenschutz`, changeFrequency: "yearly", priority: 0.1 },
    { url: `${base}/agb`, changeFrequency: "yearly", priority: 0.1 },
  ];

  try {
    const supabase = await createClient();
    const [{ data: listings }, { data: employers }] = await Promise.all([
      supabase
        .from("listings")
        .select("slug, updated_at")
        .eq("status", "active")
        .limit(5000),
      supabase.from("employers").select("slug").limit(5000),
    ]);

    return [
      ...staticRoutes,
      ...(listings ?? []).map((l) => ({
        url: `${base}/jobs/${l.slug}`,
        lastModified: l.updated_at ? new Date(l.updated_at) : undefined,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
      ...(employers ?? []).map((e) => ({
        url: `${base}/companies/${e.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.5,
      })),
    ];
  } catch {
    // A database hiccup must not take the sitemap down entirely.
    return staticRoutes;
  }
}
