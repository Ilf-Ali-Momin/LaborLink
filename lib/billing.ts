/**
 * Tier ↔ Stripe price mapping. Price IDs are environment config (they
 * differ between test and live mode); tiers and their limits live in
 * lib/entitlements.ts.
 */

export type PaidTier = "starter" | "growth";

export function priceForTier(tier: PaidTier): string {
  const id =
    tier === "starter"
      ? process.env.STRIPE_PRICE_STARTER
      : process.env.STRIPE_PRICE_GROWTH;
  if (!id) throw new Error(`No Stripe price configured for tier ${tier}`);
  return id;
}

export function tierForPrice(priceId: string): PaidTier | null {
  if (priceId === process.env.STRIPE_PRICE_STARTER) return "starter";
  if (priceId === process.env.STRIPE_PRICE_GROWTH) return "growth";
  return null;
}
