"use server";

import { redirect } from "next/navigation";
import { requireEmployer, getMyEmployer } from "@/lib/employer";
import { getStripe, stripeErrorInfo } from "@/lib/stripe";
import { priceForTier, type PaidTier } from "@/lib/billing";

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

/**
 * Starts a Stripe Checkout session for a paid tier.
 * Entitlement is NEVER granted here — only the webhook writes
 * subscription state, after Stripe confirms payment.
 */
export async function startCheckout(formData: FormData) {
  const { supabase } = await requireEmployer();
  const employer = await getMyEmployer();
  if (!employer) redirect("/employer");
  if (employer.member_role !== "owner") {
    redirect("/employer/billing?error=owner");
  }

  const tierRaw = String(formData.get("tier") ?? "");
  if (tierRaw !== "starter" && tierRaw !== "growth") {
    redirect("/employer/billing");
  }
  const tier = tierRaw as PaidTier;

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("employer_id", employer.id)
    .maybeSingle();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let checkoutUrl: string | null = null;
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceForTier(tier), quantity: 1 }],
      // Reuse the Stripe customer if this employer already has one, so
      // upgrades don't create duplicates.
      ...(sub?.stripe_customer_id
        ? { customer: sub.stripe_customer_id }
        : { customer_email: user?.email }),
      client_reference_id: employer.id,
      metadata: { employer_id: employer.id, tier },
      // Carried onto the subscription object so later webhook events
      // (renewals, cancellations) still know which employer they belong to.
      subscription_data: { metadata: { employer_id: employer.id } },
      success_url: `${siteUrl()}/employer/billing?success=1`,
      cancel_url: `${siteUrl()}/employer/billing?canceled=1`,
    });
    checkoutUrl = session.url;
  } catch (error) {
    console.error("startCheckout failed", stripeErrorInfo(error));
    redirect("/employer/billing?error=stripe");
  }

  if (!checkoutUrl) redirect("/employer/billing?error=stripe");
  redirect(checkoutUrl);
}

/** Opens the Stripe Customer Portal for plan changes and cancellation. */
export async function openBillingPortal() {
  const { supabase } = await requireEmployer();
  const employer = await getMyEmployer();
  if (!employer) redirect("/employer");
  if (employer.member_role !== "owner") {
    redirect("/employer/billing?error=owner");
  }

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("employer_id", employer.id)
    .maybeSingle();

  if (!sub?.stripe_customer_id) {
    redirect("/employer/billing?error=nocustomer");
  }

  let portalUrl: string | null = null;
  try {
    const stripe = getStripe();
    const portal = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${siteUrl()}/employer/billing`,
    });
    portalUrl = portal.url;
  } catch (error) {
    console.error("openBillingPortal failed", stripeErrorInfo(error));
    redirect("/employer/billing?error=stripe");
  }

  if (!portalUrl) redirect("/employer/billing?error=stripe");
  redirect(portalUrl);
}
