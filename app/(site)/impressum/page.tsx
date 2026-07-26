import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum",
};

/**
 * Legally required for a German commercial site (§ 5 TMG / § 18 MStV).
 * The operator fields below MUST be completed with real details before
 * launch — they are intentionally marked, not invented.
 */
export default function ImpressumPage() {
  return (
    <div className="bg-paper text-void" data-ground="paper">
      <div className="mx-auto max-w-3xl px-6 py-20 lg:px-0">
        <h1 className="font-display text-display-l">Impressum.</h1>

        <div className="mt-6 border-l-2 border-near pl-5 text-smoke">
          <p>
            This page is a prepared frame. The operator details must be
            completed before the site goes public — German law requires
            them, and they cannot be invented.
          </p>
        </div>

        <section className="mt-12 space-y-8 text-body-l leading-relaxed">
          <div>
            <h2 className="font-display text-xl font-semibold">Angaben gemäß § 5 TMG</h2>
            <p className="mt-3 text-smoke">
              [Operator name / company name]
              <br />
              [Street and number]
              <br />
              [Postal code, city]
              <br />
              Germany
            </p>
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold">Kontakt</h2>
            <p className="mt-3 text-smoke">
              E-Mail: [contact email]
              <br />
              Telefon: [phone number]
            </p>
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold">
              Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
            </h2>
            <p className="mt-3 text-smoke">[Responsible person, address]</p>
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold">Streitschlichtung</h2>
            <p className="mt-3 text-smoke">
              Wir sind nicht bereit oder verpflichtet, an
              Streitbeilegungsverfahren vor einer
              Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
