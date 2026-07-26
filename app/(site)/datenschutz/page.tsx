import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
};

/**
 * Describes what the product actually does today — no copied boilerplate
 * about processing that does not exist. Requires legal review before
 * launch (SECURITY.md: DPIA, processing records, lawful bases).
 */
export default function DatenschutzPage() {
  return (
    <div className="bg-paper text-void" data-ground="paper">
      <div className="mx-auto max-w-3xl px-6 py-20 lg:px-0">
        <h1 className="font-display text-display-l">Datenschutz.</h1>
        <p className="mt-6 text-body-l text-smoke">
          Plain-language summary first, formal details after. This document
          describes what LaborLink actually does with data today. It needs
          review by a data protection professional before public launch.
        </p>

        <section className="mt-12 space-y-10 text-body-l leading-relaxed">
          <div>
            <h2 className="font-display text-xl font-semibold">The short version</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-void">
              <li>Your data is stored in Frankfurt, Germany (Supabase, EU region).</li>
              <li>We collect the minimum needed to run a job marketplace.</li>
              <li>
                Employers see only the profile fields you choose to share,
                per application. They never see your documents.
              </li>
              <li>We run no advertising trackers and no third-party analytics.</li>
              <li>Cookies are used for login sessions only.</li>
              <li>You can request export or deletion of your data at any time.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold">Verantwortlicher</h2>
            <p className="mt-3 text-smoke">
              [Operator name and address — same as Impressum, to be completed
              before launch]
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold">
              Welche Daten wir verarbeiten
            </h2>
            <p className="mt-3">
              Account data (email, role), profile data you enter (name,
              university, degree program, city, languages), applications you
              send including the message and shared fields, hours you log,
              and documents you upload to your private vault. Server logs
              contain technical request data without profile content.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold">Auftragsverarbeiter</h2>
            <p className="mt-3">
              Supabase (database and authentication, region Frankfurt) and
              Vercel (hosting). Data processing agreements are required with
              both before launch.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold">Ihre Rechte</h2>
            <p className="mt-3">
              Auskunft, Berichtigung, Löschung, Einschränkung,
              Datenübertragbarkeit, Widerspruch (Art. 15–21 DSGVO), und
              Beschwerde bei einer Aufsichtsbehörde. Kontakt: [contact
              email].
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
