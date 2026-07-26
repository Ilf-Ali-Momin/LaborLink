/**
 * Product entitlements per subscription tier. These are business choices,
 * not legal thresholds — they do not belong in lib/compliance/config.ts.
 * The database (written by the Stripe webhook) is the source of truth for
 * which tier an employer is on; this maps tier → capability.
 */
export const ACTIVE_LISTING_LIMITS: Record<string, number> = {
  free: 1,
  starter: 5,
  growth: Number.POSITIVE_INFINITY,
};

export function activeListingLimit(tier: string | null | undefined): number {
  return ACTIVE_LISTING_LIMITS[tier ?? "free"] ?? ACTIVE_LISTING_LIMITS.free;
}
