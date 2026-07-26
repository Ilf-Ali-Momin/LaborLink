import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Employers pay for reach and tooling. Students never pay anything.",
};

// NOTE: tier prices are a launch proposal pending final sign-off; the
// entitlement logic reads tiers from the database, not from this page.
const tiers = [
  {
    name: "Free",
    price: "€0",
    period: "",
    description: "Post your first role and see how applications arrive.",
    features: ["1 active listing", "Applicant inbox", "Listing compliance check"],
    cta: "Start free",
    highlighted: false,
  },
  {
    name: "Starter",
    price: "€49",
    period: "/month",
    description: "For teams that hire students every semester.",
    features: [
      "5 active listings",
      "Applicant pipeline with statuses",
      "Team access",
      "Listing compliance check",
    ],
    cta: "Choose Starter",
    highlighted: true,
  },
  {
    name: "Growth",
    price: "€99",
    period: "/month",
    description: "For companies where student staff is core capacity.",
    features: [
      "Unlimited active listings",
      "Everything in Starter",
      "Priority support",
      "First access to compliance tooling (phase 2)",
    ],
    cta: "Choose Growth",
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="bg-paper text-void" data-ground="paper">
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <p className="eyebrow text-signal-dk">Pricing</p>
        <h1 className="mt-4 font-display text-display-l sm:text-display-xl">
          Employers pay. Students never do.
        </h1>
        <p className="mt-6 max-w-[60ch] text-body-l text-smoke">
          A student paying to reach work is the exact dynamic this product
          exists to end. Every student feature is free, permanently. Billing
          runs through Stripe; you can cancel from your billing page at any
          time.
        </p>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`card-lift flex flex-col border p-8 rounded-r ${
                tier.highlighted
                  ? "border-void bg-void text-paper"
                  : "border-hairline bg-paper"
              }`}
            >
              <h2 className="font-display text-xl font-semibold">{tier.name}</h2>
              <p className="mt-4 font-mono text-display-m font-medium tabular-nums">
                {tier.price}
                <span className={`text-base ${tier.highlighted ? "text-paper/60" : "text-smoke"}`}>
                  {tier.period}
                </span>
              </p>
              <p className={`mt-3 ${tier.highlighted ? "text-paper/70" : "text-smoke"}`}>
                {tier.description}
              </p>
              <ul className={`mt-6 flex-1 space-y-3 border-t pt-6 ${tier.highlighted ? "border-ash" : "border-hairline"}`}>
                {tier.features.map((f) => (
                  <li key={f} className="flex gap-3">
                    <span
                      aria-hidden
                      className={`mt-2 size-1.5 shrink-0 ${tier.highlighted ? "bg-signal" : "bg-signal-dk"}`}
                    />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <ButtonLink
                  href="/signup?role=employer"
                  variant={tier.highlighted ? "signal" : "outline-paper"}
                  className="w-full"
                >
                  {tier.cta}
                </ButtonLink>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 max-w-[70ch] space-y-4 border-t border-hairline pt-10 text-smoke">
          <p>
            All prices net, plus VAT. Paid tiers bill monthly and cancel
            monthly — no annual lock-in while we are new.
          </p>
          <p>
            A student?{" "}
            <Link href="/signup" className="link-grow font-medium text-void">
              Create your free account
            </Link>
            . There is no paid version of you.
          </p>
        </div>
      </section>
    </div>
  );
}
