import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { tierForPrice } from "@/lib/billing";

/**
 * Signature verification needs only STRIPE_WEBHOOK_SECRET, not the API
 * key — so it must not fail just because the API key is absent.
 */
function webhookVerifier(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY || "sk_unset_verify_only");
}

/**
 * Stripe webhook — the ONLY writer of subscription state (KICKOFF.md:
 * entitlement is server-side and webhook-driven; never a success page,
 * never a client response, never a URL parameter).
 *
 * - Signature is verified before the payload is touched.
 * - Handlers are idempotent: everything is an upsert keyed by
 *   employer_id, so Stripe redeliveries and out-of-order events are safe.
 * - Logs carry event type and id only — no customer data.
 */
export async function POST(req: Request) {
  const payload = await req.text();
  const signature = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !secret) {
    return Response.json({ error: "missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = webhookVerifier().webhooks.constructEvent(payload, signature, secret);
  } catch {
    return Response.json({ error: "invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const employerId =
          session.metadata?.employer_id ?? session.client_reference_id;
        if (!employerId || session.mode !== "subscription") break;

        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;
        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id;
        if (!subscriptionId || !customerId) break;

        const subscription =
          await getStripe().subscriptions.retrieve(subscriptionId);
        await upsertFromSubscription(employerId, customerId, subscription);
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const employerId = subscription.metadata?.employer_id;
        if (!employerId) break;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id;
        await upsertFromSubscription(employerId, customerId, subscription);
        break;
      }

      default:
        // Unhandled event types are acknowledged so Stripe stops retrying.
        break;
    }
  } catch (error) {
    console.error("stripe webhook handler failed", {
      type: event.type,
      id: event.id,
      message: error instanceof Error ? error.message.slice(0, 200) : "unknown",
    });
    // 500 → Stripe redelivers; handlers are idempotent so that is safe.
    return Response.json({ error: "handler failed" }, { status: 500 });
  }

  return Response.json({ received: true });
}

async function upsertFromSubscription(
  employerId: string,
  customerId: string,
  subscription: Stripe.Subscription,
) {
  const priceId = subscription.items.data[0]?.price.id ?? "";
  const canceled =
    subscription.status === "canceled" ||
    subscription.status === "incomplete_expired";
  const tier = canceled ? "free" : (tierForPrice(priceId) ?? "free");

  // Newer Stripe API versions moved current_period_end onto the item.
  const periodEnd =
    subscription.items.data[0]?.current_period_end ??
    (subscription as unknown as { current_period_end?: number })
      .current_period_end;

  const admin = createAdminClient();
  const { error } = await admin.from("subscriptions").upsert({
    employer_id: employerId,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    tier,
    status: subscription.status,
    current_period_end: periodEnd
      ? new Date(periodEnd * 1000).toISOString()
      : null,
    updated_at: new Date().toISOString(),
  });
  if (error) {
    throw new Error(`subscriptions upsert failed: ${error.code}`);
  }
}
