import "server-only";
import Stripe from "stripe";

/**
 * Safe-to-log summary of a Stripe failure. Stripe's `message` is
 * human-readable prose that can embed a customer email or address, and
 * SECURITY.md forbids PII in logs — so only the machine-readable
 * classification is ever recorded.
 */
export function stripeErrorInfo(error: unknown): Record<string, string> {
  const e = error as { type?: string; code?: string; statusCode?: number };
  return {
    type: e?.type ?? "unknown",
    code: e?.code ?? "none",
    status: String(e?.statusCode ?? ""),
  };
}

/** Server-only Stripe client. Lazy so builds don't require the key. */
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return new Stripe(key);
}
