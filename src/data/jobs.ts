import type { Lang } from '../content'

export type JobType = 'minijob' | 'werkstudent' | 'oneoff'

export interface JobRecord {
  id: string
  employer: string
  city: string
  payEUR: number
  hoursPerWeek: string
  type: JobType
  postedDaysAgo: number
  title: Record<Lang, string>
  blurb: Record<Lang, string>
  tasks: Record<Lang, string[]>
}

/** Format an hourly wage for the active language: €14.50 vs 14,50 €. */
export function formatPay(payEUR: number, lang: Lang): string {
  const amount = payEUR.toFixed(2)
  return lang === 'de' ? `${amount.replace('.', ',')} €` : `€${amount}`
}

export const jobs: JobRecord[] = [
  {
    id: 'barista-kaffeewerk',
    employer: 'Kaffeewerk Mitte',
    city: 'Berlin Mitte',
    payEUR: 14.5,
    hoursPerWeek: '8 – 10',
    type: 'minijob',
    postedDaysAgo: 1,
    title: {
      en: 'Barista, weekend shifts',
      de: 'Barista am Wochenende',
    },
    blurb: {
      en: 'Specialty coffee shop near Hackescher Markt looking for a weekend barista. Latte art appreciated, reliability required.',
      de: 'Specialty Coffee Shop am Hackeschen Markt sucht Verstärkung fürs Wochenende. Latte Art ist ein Plus, Zuverlässigkeit ein Muss.',
    },
    tasks: {
      en: [
        'Prepare espresso drinks and filter coffee',
        'Run the counter and card payments',
        'Keep the bar area clean and stocked',
      ],
      de: [
        'Espressogetränke und Filterkaffee zubereiten',
        'Theke und Kartenzahlungen übernehmen',
        'Bar sauber und aufgefüllt halten',
      ],
    },
  },
  {
    id: 'frontend-novabank',
    employer: 'Novabank',
    city: 'Berlin Kreuzberg',
    payEUR: 17,
    hoursPerWeek: '16 – 20',
    type: 'werkstudent',
    postedDaysAgo: 2,
    title: {
      en: 'Working student, frontend',
      de: 'Werkstudent Frontend',
    },
    blurb: {
      en: 'Fintech team building customer onboarding in React and TypeScript. You ship real features with code review from senior engineers.',
      de: 'Fintech Team baut das Kunden Onboarding mit React und TypeScript. Du lieferst echte Features mit Code Review von Senior Engineers.',
    },
    tasks: {
      en: [
        'Build UI components in React and TypeScript',
        'Write tests alongside your features',
        'Join weekly planning and reviews',
      ],
      de: [
        'UI Komponenten mit React und TypeScript bauen',
        'Tests zu deinen Features schreiben',
        'An Planning und Reviews teilnehmen',
      ],
    },
  },
  {
    id: 'warehouse-stadtlogistik',
    employer: 'Stadtlogistik',
    city: 'Berlin Lichtenberg',
    payEUR: 14,
    hoursPerWeek: '6 – 12',
    type: 'minijob',
    postedDaysAgo: 3,
    title: {
      en: 'Warehouse assistant',
      de: 'Lagerhelfer',
    },
    blurb: {
      en: 'Sustainable delivery startup needs help with evening sorting shifts. Flexible days, near the Ringbahn.',
      de: 'Nachhaltiges Lieferstartup braucht Unterstützung bei Sortierschichten am Abend. Flexible Tage, direkt an der Ringbahn.',
    },
    tasks: {
      en: [
        'Sort incoming parcels by route',
        'Scan and log packages',
        'Load cargo bikes for the morning tours',
      ],
      de: [
        'Eingehende Pakete nach Route sortieren',
        'Pakete scannen und erfassen',
        'Lastenräder für die Morgentouren beladen',
      ],
    },
  },
  {
    id: 'marketing-brandt',
    employer: 'Studio Brandt',
    city: 'Prenzlauer Berg',
    payEUR: 15.5,
    hoursPerWeek: '15 – 20',
    type: 'werkstudent',
    postedDaysAgo: 4,
    title: {
      en: 'Working student, marketing',
      de: 'Werkstudentin Marketing',
    },
    blurb: {
      en: 'Design studio looking for support with social content and client newsletters. Portfolio over grades.',
      de: 'Designstudio sucht Unterstützung für Social Content und Kunden Newsletter. Portfolio zählt mehr als Noten.',
    },
    tasks: {
      en: [
        'Plan and schedule social media posts',
        'Draft newsletters and case study texts',
        'Track basic campaign metrics',
      ],
      de: [
        'Social Media Posts planen und einstellen',
        'Newsletter und Case Study Texte entwerfen',
        'Einfache Kampagnenkennzahlen auswerten',
      ],
    },
  },
  {
    id: 'event-messecrew',
    employer: 'Messe Crew Berlin',
    city: 'Charlottenburg',
    payEUR: 15,
    hoursPerWeek: '2 days',
    type: 'oneoff',
    postedDaysAgo: 1,
    title: {
      en: 'Event staff, trade fair',
      de: 'Eventpersonal Messe',
    },
    blurb: {
      en: 'Two day tech trade fair at Messe Berlin. Badge checks, guest guidance and booth support. Paid out through payroll, not cash.',
      de: 'Zweitägige Tech Messe in der Messe Berlin. Einlasskontrolle, Gästebetreuung und Standunterstützung. Auszahlung über die Lohnabrechnung, nicht bar.',
    },
    tasks: {
      en: [
        'Check badges at the hall entrance',
        'Guide guests to stages and booths',
        'Support exhibitors with materials',
      ],
      de: [
        'Badges am Halleneingang prüfen',
        'Gäste zu Bühnen und Ständen führen',
        'Aussteller mit Material unterstützen',
      ],
    },
  },
  {
    id: 'tutor-lernraum',
    employer: 'LernRaum',
    city: 'Berlin Neukölln',
    payEUR: 18,
    hoursPerWeek: '4 – 8',
    type: 'minijob',
    postedDaysAgo: 5,
    title: {
      en: 'Math tutor',
      de: 'Nachhilfe Mathe',
    },
    blurb: {
      en: 'Tutoring center for grades 7 to 13. Small groups of two to four students, materials provided, afternoons only.',
      de: 'Nachhilfeinstitut für die Klassen 7 bis 13. Kleine Gruppen mit zwei bis vier Schülern, Material wird gestellt, nur nachmittags.',
    },
    tasks: {
      en: [
        'Teach small groups in math',
        'Prepare short practice sets',
        'Give feedback to parents once a month',
      ],
      de: [
        'Kleingruppen in Mathe unterrichten',
        'Kurze Übungssets vorbereiten',
        'Einmal im Monat Feedback an Eltern geben',
      ],
    },
  },
  {
    id: 'support-campusfy',
    employer: 'Campusfy',
    city: 'Berlin Friedrichshain',
    payEUR: 16,
    hoursPerWeek: '12 – 20',
    type: 'werkstudent',
    postedDaysAgo: 2,
    title: {
      en: 'Working student, customer support',
      de: 'Werkstudent Customer Support',
    },
    blurb: {
      en: 'Edtech platform needs German and English support for student users. Remote friendly after onboarding.',
      de: 'Edtech Plattform sucht Support auf Deutsch und Englisch für studentische Nutzer. Nach der Einarbeitung remote möglich.',
    },
    tasks: {
      en: [
        'Answer user questions via chat and mail',
        'Document common issues for the FAQ',
        'Escalate bugs to the product team',
      ],
      de: [
        'Nutzerfragen per Chat und Mail beantworten',
        'Häufige Probleme für die FAQ dokumentieren',
        'Bugs an das Produktteam weitergeben',
      ],
    },
  },
  {
    id: 'delivery-gruenkorb',
    employer: 'Grünkorb',
    city: 'Berlin Schöneberg',
    payEUR: 14.8,
    hoursPerWeek: '6 – 10',
    type: 'minijob',
    postedDaysAgo: 6,
    title: {
      en: 'Bike courier, organic boxes',
      de: 'Fahrradkurier Biokisten',
    },
    blurb: {
      en: 'Deliver organic vegetable boxes by cargo bike in the city west. Fixed routes, tips are yours, gear provided.',
      de: 'Biokisten mit dem Lastenrad im Berliner Westen ausliefern. Feste Routen, Trinkgeld bleibt bei dir, Ausrüstung wird gestellt.',
    },
    tasks: {
      en: [
        'Ride fixed delivery routes by cargo bike',
        'Hand over boxes and collect empties',
        'Report route issues in the app',
      ],
      de: [
        'Feste Routen mit dem Lastenrad fahren',
        'Kisten übergeben und Leergut mitnehmen',
        'Routenprobleme in der App melden',
      ],
    },
  },
]

export function getJob(id: string): JobRecord | undefined {
  return jobs.find((job) => job.id === id)
}
