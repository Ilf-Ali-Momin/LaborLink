import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AGB",
};

/** Terms frame — requires drafting by a lawyer before launch. */
export default function AgbPage() {
  return (
    <div className="bg-paper text-void" data-ground="paper">
      <div className="mx-auto max-w-3xl px-6 py-20 lg:px-0">
        <h1 className="font-display text-display-l">AGB.</h1>

        <div className="mt-6 border-l-2 border-near pl-5 text-smoke">
          <p>
            These terms are a structural draft, not final legal text. They
            must be drafted properly by a lawyer before launch.
          </p>
        </div>

        <section className="mt-12 space-y-8 text-body-l leading-relaxed">
          <div>
            <h2 className="font-display text-xl font-semibold">1. What LaborLink is</h2>
            <p className="mt-3">
              LaborLink operates a marketplace connecting students and
              employers in Germany. LaborLink is not a staffing agency and
              is not a party to any employment contract concluded between
              users.
            </p>
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold">2. Accounts</h2>
            <p className="mt-3">
              One account per person or company. Student accounts are free.
              The role chosen at signup (student or employer) is permanent
              for that account.
            </p>
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold">3. Compliance information</h2>
            <p className="mt-3">
              Rule explanations and limit calculations are general
              information based on published thresholds. They are not legal
              advice, and they do not replace the employer&apos;s own legal
              obligations when concluding contracts.
            </p>
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold">4. Paid plans</h2>
            <p className="mt-3">
              Employer subscriptions bill monthly through Stripe and can be
              cancelled monthly. [Refund terms, liability, and termination
              clauses to be drafted by a lawyer.]
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
