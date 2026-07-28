import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyEmployer } from "@/lib/employer";
import { startCheckout, openBillingPortal } from "@/app/actions/billing";
import { activeListingLimit, effectiveTier, isEntitled } from "@/lib/entitlements";

export const metadata = { title: "Billing" };

const tierNames: Record<string, string> = {
  free: "Free",
  starter: "Starter",
  growth: "Growth",
};

const plans = [
  {
    tier: "starter",
    name: "Starter",
    price: "€49/month",
    blurb: "5 active listings, applicant pipeline, team access.",
  },
  {
    tier: "growth",
    name: "Growth",
    price: "€99/month",
    blurb: "Unlimited active listings, priority support.",
  },
] as const;

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string; error?: string }>;
}) {
  const params = await searchParams;
  const employer = await getMyEmployer();
  if (!employer) redirect("/employer");
  const isOwner = employer.member_role === "owner";

  const supabase = await createClient();
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("tier, status, current_period_end, stripe_customer_id")
    .eq("employer_id", employer.id)
    .maybeSingle();

  const tier = effectiveTier(sub);
  const limit = activeListingLimit(tier);

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-display-m">Billing.</h1>

      {params.success ? (
        <p className="mt-6 border-l-2 border-signal-dk pl-4">
          Payment set up. Your plan activates as soon as Stripe confirms it —
          usually within seconds. Reload if you do not see it yet.
        </p>
      ) : null}
      {params.canceled ? (
        <p className="mt-6 border-l-2 border-near pl-4">
          Checkout was cancelled. Nothing was charged and nothing changed.
        </p>
      ) : null}
      {params.error === "owner" ? (
        <p className="mt-6 border-l-2 border-over pl-4">
          Only the account owner can change billing.
        </p>
      ) : params.error === "nocustomer" ? (
        <p className="mt-6 border-l-2 border-near pl-4">
          There is no billing account yet. Choose a plan first.
        </p>
      ) : params.error === "stripe" ? (
        <p className="mt-6 border-l-2 border-over pl-4">
          Talking to Stripe failed. Try again. If it fails twice, contact us.
        </p>
      ) : null}

      <section className="mt-8 border border-hairline p-6 rounded-r">
        <p className="eyebrow text-smoke">Current plan</p>
        <p className="mt-3 font-mono text-display-m font-medium">
          {tierNames[tier] ?? tier}
        </p>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-smoke">Active listings included</dt>
            <dd className="font-mono tabular-nums">
              {Number.isFinite(limit) ? limit : "Unlimited"}
            </dd>
          </div>
          {sub && isEntitled(sub.status) && sub.current_period_end ? (
            <div className="flex justify-between gap-4">
              <dt className="text-smoke">Renews</dt>
              <dd className="font-mono tabular-nums">
                {new Date(sub.current_period_end).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </dd>
            </div>
          ) : null}
        </dl>
        {sub?.stripe_customer_id && isOwner ? (
          <form action={openBillingPortal} className="mt-5 border-t border-hairline pt-5">
            <button
              type="submit"
              className="rounded-r border border-void px-5 py-2.5 font-medium transition-colors hover:bg-void hover:text-paper"
            >
              Manage billing in Stripe
            </button>
            <p className="mt-2 text-sm text-smoke">
              Change plan, update the card, download invoices, or cancel.
            </p>
          </form>
        ) : null}
      </section>

      {tier === "free" ? (
        <section className="mt-8">
          <h2 className="font-display text-xl font-semibold">Upgrade.</h2>
          {!isOwner ? (
            <p className="mt-3 text-smoke">
              Only the account owner can change billing.
            </p>
          ) : (
            <div className="mt-5 grid gap-6 sm:grid-cols-2">
              {plans.map((plan) => (
                <div key={plan.tier} className="flex flex-col border border-hairline p-6 rounded-r">
                  <h3 className="font-display text-lg font-semibold">{plan.name}</h3>
                  <p className="mt-2 font-mono tabular-nums">{plan.price}</p>
                  <p className="mt-3 flex-1 text-sm text-smoke">{plan.blurb}</p>
                  <form action={startCheckout} className="mt-5">
                    <input type="hidden" name="tier" value={plan.tier} />
                    <button
                      type="submit"
                      className="w-full rounded-r border border-void bg-signal px-5 py-2.5 font-medium text-void transition-colors duration-200 hover:bg-void hover:text-signal"
                    >
                      Choose {plan.name}
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
          <p className="mt-5 text-sm text-smoke">
            Payment runs through Stripe Checkout. Your plan activates when
            Stripe confirms the subscription — the confirmation page alone
            never grants access.
          </p>
        </section>
      ) : null}
    </div>
  );
}
