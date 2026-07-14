import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useI18n } from '../../lib/i18n'
import type { Lang } from '../../content'
import { Logo } from '../../components/ui/Logo'
import { LangToggle } from '../../components/ui/LangToggle'

type LegalKey = 'impressum' | 'datenschutz' | 'agb'

interface LegalText {
  title: string
  intro: string
  sections: { heading: string; body: string }[]
}

/**
 * Placeholder legal content. Before a real launch this must be completed
 * with the actual company details and reviewed by a lawyer.
 */
const legal: Record<Lang, Record<LegalKey, LegalText>> = {
  en: {
    impressum: {
      title: 'Impressum',
      intro: 'Information according to § 5 DDG (placeholder until incorporation).',
      sections: [
        {
          heading: 'Provider',
          body: 'LaborLink (company in formation) · Sample street 1 · 10115 Berlin · Germany',
        },
        {
          heading: 'Contact',
          body: 'Mail: hello@laborlink.example · Responsible for content: the founding team.',
        },
        {
          heading: 'Note',
          body: 'This page is a placeholder. Registered company name, register number and represented persons will be added before launch.',
        },
      ],
    },
    datenschutz: {
      title: 'Datenschutzerklärung',
      intro: 'How LaborLink handles personal data under the GDPR.',
      sections: [
        {
          heading: 'Data we process',
          body: 'Account data (name, mail address), application data you submit, and usage data needed to run the platform. Nothing is sold, ever.',
        },
        {
          heading: 'Where data lives',
          body: 'Personal data is stored on servers in the EU. Fonts and all assets are served from our own infrastructure; no third party CDNs receive your IP address.',
        },
        {
          heading: 'Your rights',
          body: 'You can export or delete your personal data at any time in your profile, and you can contact us for access, correction or erasure requests.',
        },
        {
          heading: 'Cookies',
          body: 'We set no tracking cookies. Language and theme preferences are stored locally in your browser only.',
        },
      ],
    },
    agb: {
      title: 'AGB',
      intro: 'General terms and conditions (placeholder summary).',
      sections: [
        {
          heading: 'Scope',
          body: 'These terms govern the use of the LaborLink platform by students and employers.',
        },
        {
          heading: 'Contracts',
          body: 'Employment contracts are concluded directly between student and employer. LaborLink provides compliant templates, verification and hour tracking.',
        },
        {
          heading: 'Pricing',
          body: 'The platform is free for students. Employer pricing is shown transparently on the pricing page.',
        },
      ],
    },
  },
  de: {
    impressum: {
      title: 'Impressum',
      intro: 'Angaben gemäß § 5 DDG (Platzhalter bis zur Gründung).',
      sections: [
        {
          heading: 'Anbieter',
          body: 'LaborLink (Gesellschaft in Gründung) · Musterstraße 1 · 10115 Berlin · Deutschland',
        },
        {
          heading: 'Kontakt',
          body: 'Mail: hello@laborlink.example · Verantwortlich für den Inhalt: das Gründungsteam.',
        },
        {
          heading: 'Hinweis',
          body: 'Diese Seite ist ein Platzhalter. Firmierung, Registernummer und vertretungsberechtigte Personen werden vor dem Start ergänzt.',
        },
      ],
    },
    datenschutz: {
      title: 'Datenschutzerklärung',
      intro: 'So geht LaborLink mit personenbezogenen Daten nach DSGVO um.',
      sections: [
        {
          heading: 'Verarbeitete Daten',
          body: 'Kontodaten (Name, Mail Adresse), Bewerbungsdaten, die du einreichst, und Nutzungsdaten für den Betrieb der Plattform. Nichts wird verkauft, niemals.',
        },
        {
          heading: 'Speicherort',
          body: 'Personenbezogene Daten liegen auf Servern in der EU. Schriften und alle Assets kommen von unserer eigenen Infrastruktur; keine dritten CDNs erhalten deine IP Adresse.',
        },
        {
          heading: 'Deine Rechte',
          body: 'Du kannst deine persönlichen Daten jederzeit im Profil exportieren oder löschen und uns für Auskunft, Berichtigung oder Löschung kontaktieren.',
        },
        {
          heading: 'Cookies',
          body: 'Wir setzen keine Tracking Cookies. Sprache und Design werden nur lokal in deinem Browser gespeichert.',
        },
      ],
    },
    agb: {
      title: 'AGB',
      intro: 'Allgemeine Geschäftsbedingungen (Platzhalter Zusammenfassung).',
      sections: [
        {
          heading: 'Geltungsbereich',
          body: 'Diese Bedingungen regeln die Nutzung der LaborLink Plattform durch Studierende und Arbeitgeber.',
        },
        {
          heading: 'Verträge',
          body: 'Arbeitsverträge kommen direkt zwischen Studierenden und Arbeitgebern zustande. LaborLink stellt konforme Vorlagen, Verifizierung und Stundenerfassung bereit.',
        },
        {
          heading: 'Preise',
          body: 'Die Plattform ist für Studierende kostenlos. Preise für Arbeitgeber stehen transparent auf der Preisseite.',
        },
      ],
    },
  },
}

export function LegalPage({ page }: { page: LegalKey }) {
  const { lang, ta } = useI18n()
  const text = legal[lang][page]

  return (
    <div className="min-h-screen bg-bg">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-4 py-6 sm:px-6">
        <Logo />
        <LangToggle />
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition hover:text-primary"
        >
          <ArrowLeft size={15} aria-hidden="true" />
          {ta.common.backToSite}
        </Link>

        <h1 className="mt-6 text-3xl font-bold tracking-tight">{text.title}</h1>
        <p className="mt-3 text-ink-muted">{text.intro}</p>

        <div className="mt-8 space-y-6">
          {text.sections.map((section) => (
            <section key={section.heading} className="glass rounded-card p-6 shadow-card">
              <h2 className="font-semibold">{section.heading}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {section.body}
              </p>
            </section>
          ))}
        </div>
      </main>
    </div>
  )
}
