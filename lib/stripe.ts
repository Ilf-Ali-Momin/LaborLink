import "server-only";
import Stripe from "stripe";

/** Server-only Stripe client. Lazy so builds don't require the key. */
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return new Stripe(key);
}
