/**
 * Every visible string on the page lives here, keyed by language.
 * Components never hardcode copy; they read from this object via useI18n().
 * Project rule: no hyphens anywhere in visible copy.
 */

export type Lang = 'en' | 'de'

export interface NavContent {
  links: { label: string; href: string }[]
  signIn: string
  getStarted: string
  account: string
  openMenu: string
  closeMenu: string
  themeLight: string
  themeDark: string
  langSwitch: string
}

export interface HeroContent {
  pill: string
  h1Before: string
  h1Accent: string
  h1After: string
  subhead: string
  ctaStudent: string
  ctaStudentSub: string
  ctaEmployer: string
  ctaEmployerSub: string
  search: {
    roleLabel: string
    rolePlaceholder: string
    cityLabel: string
    cityPlaceholder: string
    typeLabel: string
    types: string[]
    button: string
  }
}

export interface StepContent {
  title: string
  body: string
}

export interface JobListing {
  title: string
  employer: string
  city: string
  pay: string
  type: string
}

export interface AudienceContent {
  kicker: string
  title: string
  points: { title: string; body: string }[]
  mock: {
    header: string
    rows: { lead: string; detail: string; trail: string }[]
    footer: string
  }
}

export interface Testimonial {
  quote: string
  name: string
  role: string
  stat?: string
}

export interface PricingTier {
  name: string
  price: string
  cadence: string
  desc: string
  features: { text: string; compliance?: boolean }[]
  cta: string
  highlighted?: boolean
  badge?: string
}

export interface Content {
  nav: NavContent
  hero: HeroContent
  trust: {
    headline: string
    logos: string[]
    chips: string[]
  }
  how: {
    kicker: string
    title: string
    sub: string
    steps: StepContent[]
  }
  jobs: {
    kicker: string
    title: string
    sub: string
    perHour: string
    verified: string
    view: string
    browseAll: string
    listings: JobListing[]
  }
  compliance: {
    kicker: string
    title: string
    body: string
    bullets: string[]
    panel: {
      header: string
      status: string
      statusNote: string
      worker: string
      workerSub: string
      hoursLabel: string
      hoursValue: string
      hoursPct: number
      contractLabel: string
      contractValue: string
      payrollHeader: string
      lineItems: string[]
      floatChip: string
    }
  }
  audiences: {
    students: AudienceContent
    employers: AudienceContent
  }
  testimonials: {
    kicker: string
    title: string
    sub: string
    featured: Testimonial
    others: Testimonial[]
  }
  pricing: {
    kicker: string
    title: string
    sub: string
    tiers: PricingTier[]
  }
  faq: {
    kicker: string
    title: string
    sub: string
    items: { q: string; a: string }[]
  }
  cta: {
    title: string
    sub: string
    student: string
    employer: string
  }
  footer: {
    tagline: string
    madeIn: string
    columns: { title: string; links: { label: string; href: string }[] }[]
    languageTitle: string
    copyright: string
  }
}

export const content: Record<Lang, Content> = {
  en: {
    nav: {
      links: [
        { label: 'Home', href: '#home' },
        { label: 'For Students', href: '#students' },
        { label: 'For Employers', href: '#employers' },
        { label: 'Pricing', href: '#pricing' },
      ],
      signIn: 'Sign in',
      getStarted: 'Get started',
      account: 'My account',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
      themeLight: 'Switch to light mode',
      themeDark: 'Switch to dark mode',
      langSwitch: 'Auf Deutsch wechseln',
    },
    hero: {
      pill: 'Compliant student work in Germany',
      h1Before: 'Flexible work, done ',
      h1Accent: 'properly',
      h1After: '.',
      subhead:
        'LaborLink matches students with vetted employers and handles Minijob rules, Werkstudent limits, contracts and payroll in the background.',
      ctaStudent: 'I am looking for work',
      ctaStudentSub: 'Browse verified roles near you',
      ctaEmployer: 'I am hiring students',
      ctaEmployerSub: 'Post a role in minutes',
      search: {
        roleLabel: 'Role',
        rolePlaceholder: 'Try barista or frontend',
        cityLabel: 'City',
        cityPlaceholder: 'Berlin',
        typeLabel: 'Job type',
        types: ['Minijob', 'Werkstudent', 'One off'],
        button: 'Search',
      },
    },
    trust: {
      headline: '2,400+ student jobs filled compliantly across Germany',
      logos: ['nordwerk', 'campusfy', 'stadtlogistik', 'datafeld', 'kaffeewerk'],
      chips: [
        'Minijob compliant',
        'Werkstudent rules built in',
        'GDPR safe',
        'Payroll ready',
      ],
    },
    how: {
      kicker: 'How it works',
      title: 'From search to paycheck in three steps',
      sub: 'One flow for students and employers, with compliance checks at every step.',
      steps: [
        {
          title: 'Search and match',
          body: 'Set your hours, city and skills. We surface roles that fit your schedule and your student status.',
        },
        {
          title: 'Verify and comply',
          body: 'Identity, enrollment and hour limits are checked automatically before any contract is signed.',
        },
        {
          title: 'Work and get paid',
          body: 'Hours flow straight into payroll. Legal pay, on time, with contributions handled.',
        },
      ],
    },
    jobs: {
      kicker: 'Open roles',
      title: 'Live in Berlin right now',
      sub: 'A snapshot of verified listings on the marketplace today.',
      perHour: 'per hour',
      verified: 'Verified employer',
      view: 'View job',
      browseAll: 'Browse all roles',
      listings: [
        {
          title: 'Barista, weekend shifts',
          employer: 'Kaffeewerk Mitte',
          city: 'Berlin Mitte',
          pay: '€14.50',
          type: 'Minijob',
        },
        {
          title: 'Working student, frontend',
          employer: 'Novabank',
          city: 'Berlin Kreuzberg',
          pay: '€17.00',
          type: 'Werkstudent',
        },
        {
          title: 'Warehouse assistant',
          employer: 'Stadtlogistik',
          city: 'Berlin Lichtenberg',
          pay: '€14.00',
          type: 'Minijob',
        },
        {
          title: 'Working student, marketing',
          employer: 'Studio Brandt',
          city: 'Prenzlauer Berg',
          pay: '€15.50',
          type: 'Werkstudent',
        },
        {
          title: 'Event staff, trade fair',
          employer: 'Messe Crew Berlin',
          city: 'Charlottenburg',
          pay: '€15.00',
          type: 'One off',
        },
        {
          title: 'Math tutor',
          employer: 'LernRaum',
          city: 'Berlin Neukölln',
          pay: '€18.00',
          type: 'Minijob',
        },
      ],
    },
    compliance: {
      kicker: 'The compliance layer',
      title: 'Compliance is not a feature. It is the product.',
      body: 'Every match runs through German labor rules before anyone signs. Hour limits, contract templates, tax and social contributions are handled in the background and visible at a glance, for both sides.',
      bullets: [
        'Werkstudent hour limits tracked live',
        'Contracts generated, signed and stored',
        'Tax and social contributions calculated automatically',
        'Payroll ready exports for your accountant',
      ],
      panel: {
        header: 'Compliance overview',
        status: 'Compliant',
        statusNote: 'All checks passed 2 minutes ago',
        worker: 'Lena M.',
        workerSub: 'Werkstudentin · HU Berlin',
        hoursLabel: 'Hours this week',
        hoursValue: '18.5 of 20',
        hoursPct: 92.5,
        contractLabel: 'Contract status',
        contractValue: 'Active · signed 12 May 2026',
        payrollHeader: 'Payroll preview, June',
        lineItems: [
          'Gross pay',
          'Income tax',
          'Health insurance',
          'Pension contribution',
        ],
        floatChip: 'Werkstudent limit safe',
      },
    },
    audiences: {
      students: {
        kicker: 'For students',
        title: 'Work that fits around your degree',
        points: [
          {
            title: 'Flexible hours',
            body: 'Shifts that fit your timetable, not the other way around.',
          },
          {
            title: 'Guaranteed legal pay',
            body: 'Every role pays at or above the legal minimum wage, written into your contract.',
          },
          {
            title: 'Work near campus',
            body: 'Roles close to your university or fully remote.',
          },
        ],
        mock: {
          header: 'Your week',
          rows: [
            { lead: 'Tue', detail: 'Kaffeewerk Mitte', trail: '4 h' },
            { lead: 'Thu', detail: 'LernRaum', trail: '3 h' },
            { lead: 'Sat', detail: 'Messe Crew Berlin', trail: '6 h' },
          ],
          footer: '13 of 20 hours planned',
        },
      },
      employers: {
        kicker: 'For employers',
        title: 'Hire students without the legal headache',
        points: [
          {
            title: 'Vetted talent',
            body: 'Every student is identity checked and enrollment verified.',
          },
          {
            title: 'Automatic compliance',
            body: 'Hour limits, contract templates and status checks run on their own.',
          },
          {
            title: 'Hours and payroll in one place',
            body: 'Time tracking flows straight into payroll ready exports.',
          },
        ],
        mock: {
          header: 'Applicants',
          rows: [
            { lead: 'Jonas W.', detail: 'TU Berlin', trail: 'Verified' },
            { lead: 'Aylin D.', detail: 'FU Berlin', trail: 'Verified' },
            { lead: 'Marco P.', detail: 'HTW Berlin', trail: 'Verified' },
          ],
          footer: '3 candidates ready to interview',
        },
      },
    },
    testimonials: {
      kicker: 'Testimonials',
      title: 'What our users say',
      sub: 'Students and HR teams on what changed when they switched to LaborLink.',
      featured: {
        quote:
          'We filled 12 Werkstudent roles in six weeks. Contracts and hour tracking that used to take our HR team days now run in the background.',
        name: 'Miriam Kessler',
        role: 'HR Lead, Stadtlogistik',
        stat: '12 roles filled in 6 weeks',
      },
      others: [
        {
          quote:
            'I earn around €640 a month next to my Master and the app warns me before I get close to the 20 hour limit.',
          name: 'Jonas Weber',
          role: 'Student, TU Berlin',
        },
        {
          quote:
            'Onboarding a student worker went from two weeks of paperwork to one afternoon.',
          name: 'Aylin Demir',
          role: 'Head of Operations, Kaffeewerk',
        },
      ],
    },
    pricing: {
      kicker: 'Pricing',
      title: 'Simple, transparent pricing',
      sub: 'No hidden fees and no sales call required. What you see is what you pay.',
      tiers: [
        {
          name: 'Students',
          price: '€0',
          cadence: 'free forever',
          desc: 'Everything you need to find compliant work.',
          features: [
            { text: 'Unlimited applications' },
            { text: 'Verified employers only', compliance: true },
            { text: 'Live hour limit tracking', compliance: true },
            { text: 'Contracts stored in one place' },
          ],
          cta: 'Create a free profile',
        },
        {
          name: 'Employer Starter',
          price: '€89',
          cadence: 'per hire',
          desc: 'Pay only when you actually hire.',
          features: [
            { text: 'Unlimited job posts' },
            { text: 'Compliance checks included', compliance: true },
            { text: 'Contract templates' },
            { text: 'Applicant verification', compliance: true },
          ],
          cta: 'Start hiring',
        },
        {
          name: 'Employer Scale',
          price: '€249',
          cadence: 'per month',
          desc: 'For teams hiring students all year round.',
          features: [
            { text: 'Unlimited hires' },
            { text: 'Payroll ready exports' },
            { text: 'Hours and payroll dashboard' },
            { text: 'Automatic compliance monitoring', compliance: true },
            { text: 'Priority support' },
          ],
          cta: 'Start a free trial',
          highlighted: true,
          badge: 'Most popular',
        },
      ],
    },
    faq: {
      kicker: 'FAQ',
      title: 'Frequently asked questions',
      sub: 'Everything about legality, pay and your data.',
      items: [
        {
          q: 'Is hiring students through LaborLink legal?',
          a: 'Yes. Every contract follows German labor law. We check enrollment status, hour limits and insurance obligations before a contract is signed, and we keep checking while the job runs.',
        },
        {
          q: 'What is the difference between a Minijob and a Werkstudent role?',
          a: 'A Minijob is capped at €603 per month in 2026 and stays almost free of social contributions. A Werkstudent role allows up to 20 hours per week during the lecture period with reduced contributions. LaborLink shows you which model fits and enforces the limits automatically.',
        },
        {
          q: 'How does pay work?',
          a: 'Employers pay through their regular payroll. LaborLink tracks hours, applies the correct wage floor and generates payroll ready exports. Students see their expected pay before they accept a shift.',
        },
        {
          q: 'What happens to my data?',
          a: 'Your data is stored on servers in the EU, protected under the GDPR, and never sold. You can export or delete your personal data at any time from your account settings.',
        },
      ],
    },
    cta: {
      title: 'Find your next shift. Or your next hire.',
      sub: 'Join LaborLink today. Free for students, transparent for employers.',
      student: 'Find your next shift',
      employer: 'Start hiring compliantly',
    },
    footer: {
      tagline: 'The compliant marketplace for student work in Germany.',
      madeIn: 'Made in Berlin',
      columns: [
        {
          title: 'Product',
          links: [
            { label: 'How it works', href: '#how' },
            { label: 'Open roles', href: '#jobs' },
            { label: 'Pricing', href: '#pricing' },
            { label: 'FAQ', href: '#faq' },
          ],
        },
        {
          title: 'Company',
          links: [
            { label: 'About', href: '#' },
            { label: 'Careers', href: '#' },
            { label: 'Press', href: '#' },
            { label: 'Contact', href: '#' },
          ],
        },
        {
          title: 'Legal',
          links: [
            { label: 'Impressum', href: '/impressum' },
            { label: 'Datenschutzerklärung', href: '/datenschutz' },
            { label: 'AGB', href: '/agb' },
          ],
        },
      ],
      languageTitle: 'Language',
      copyright: '© 2026 LaborLink. All rights reserved.',
    },
  },

  de: {
    nav: {
      links: [
        { label: 'Start', href: '#home' },
        { label: 'Für Studierende', href: '#students' },
        { label: 'Für Arbeitgeber', href: '#employers' },
        { label: 'Preise', href: '#pricing' },
      ],
      signIn: 'Anmelden',
      getStarted: 'Loslegen',
      account: 'Mein Konto',
      openMenu: 'Menü öffnen',
      closeMenu: 'Menü schließen',
      themeLight: 'Zum hellen Modus wechseln',
      themeDark: 'Zum dunklen Modus wechseln',
      langSwitch: 'Switch to English',
    },
    hero: {
      pill: 'Konforme studentische Arbeit in Deutschland',
      h1Before: 'Flexible Arbeit, ',
      h1Accent: 'richtig',
      h1After: ' gemacht.',
      subhead:
        'LaborLink verbindet Studierende mit geprüften Arbeitgebern und übernimmt Minijobregeln, Werkstudentenlimits, Verträge und Lohnabrechnung im Hintergrund.',
      ctaStudent: 'Ich suche Arbeit',
      ctaStudentSub: 'Geprüfte Jobs in deiner Nähe',
      ctaEmployer: 'Ich stelle Studierende ein',
      ctaEmployerSub: 'Stelle in Minuten ausschreiben',
      search: {
        roleLabel: 'Rolle',
        rolePlaceholder: 'Zum Beispiel Barista oder Frontend',
        cityLabel: 'Stadt',
        cityPlaceholder: 'Berlin',
        typeLabel: 'Jobart',
        types: ['Minijob', 'Werkstudent', 'Einmalig'],
        button: 'Suchen',
      },
    },
    trust: {
      headline: '2.400+ Studentenjobs konform besetzt in ganz Deutschland',
      logos: ['nordwerk', 'campusfy', 'stadtlogistik', 'datafeld', 'kaffeewerk'],
      chips: [
        'Minijob konform',
        'Werkstudentenregeln integriert',
        'DSGVO konform',
        'Bereit für die Lohnabrechnung',
      ],
    },
    how: {
      kicker: 'So funktioniert es',
      title: 'Von der Suche zum Gehalt in drei Schritten',
      sub: 'Ein Ablauf für Studierende und Arbeitgeber, mit Compliance Prüfungen bei jedem Schritt.',
      steps: [
        {
          title: 'Suchen und matchen',
          body: 'Gib Stunden, Stadt und Skills an. Wir zeigen Jobs, die zu Stundenplan und Studierendenstatus passen.',
        },
        {
          title: 'Prüfen und absichern',
          body: 'Identität, Immatrikulation und Stundenlimits werden automatisch geprüft, bevor ein Vertrag unterschrieben wird.',
        },
        {
          title: 'Arbeiten und Geld erhalten',
          body: 'Stunden fließen direkt in die Lohnabrechnung. Legale Bezahlung, pünktlich, mit allen Abgaben.',
        },
      ],
    },
    jobs: {
      kicker: 'Offene Jobs',
      title: 'Jetzt live in Berlin',
      sub: 'Ein Ausschnitt der geprüften Anzeigen auf dem Marktplatz heute.',
      perHour: 'pro Stunde',
      verified: 'Geprüfter Arbeitgeber',
      view: 'Job ansehen',
      browseAll: 'Alle Jobs ansehen',
      listings: [
        {
          title: 'Barista am Wochenende',
          employer: 'Kaffeewerk Mitte',
          city: 'Berlin Mitte',
          pay: '14,50 €',
          type: 'Minijob',
        },
        {
          title: 'Werkstudent Frontend',
          employer: 'Novabank',
          city: 'Berlin Kreuzberg',
          pay: '17,00 €',
          type: 'Werkstudent',
        },
        {
          title: 'Lagerhelfer',
          employer: 'Stadtlogistik',
          city: 'Berlin Lichtenberg',
          pay: '14,00 €',
          type: 'Minijob',
        },
        {
          title: 'Werkstudentin Marketing',
          employer: 'Studio Brandt',
          city: 'Prenzlauer Berg',
          pay: '15,50 €',
          type: 'Werkstudent',
        },
        {
          title: 'Eventpersonal Messe',
          employer: 'Messe Crew Berlin',
          city: 'Charlottenburg',
          pay: '15,00 €',
          type: 'Einmalig',
        },
        {
          title: 'Nachhilfe Mathe',
          employer: 'LernRaum',
          city: 'Berlin Neukölln',
          pay: '18,00 €',
          type: 'Minijob',
        },
      ],
    },
    compliance: {
      kicker: 'Die Compliance Ebene',
      title: 'Compliance ist kein Feature. Es ist das Produkt.',
      body: 'Jedes Match läuft durch deutsches Arbeitsrecht, bevor jemand unterschreibt. Stundenlimits, Vertragsvorlagen, Steuern und Sozialabgaben werden im Hintergrund erledigt und sind für beide Seiten auf einen Blick sichtbar.',
      bullets: [
        'Werkstudentenlimits live überwacht',
        'Verträge erstellt, signiert und abgelegt',
        'Steuern und Sozialabgaben automatisch berechnet',
        'Fertige Exporte für die Lohnabrechnung',
      ],
      panel: {
        header: 'Compliance Übersicht',
        status: 'Konform',
        statusNote: 'Alle Prüfungen vor 2 Minuten bestanden',
        worker: 'Lena M.',
        workerSub: 'Werkstudentin · HU Berlin',
        hoursLabel: 'Stunden diese Woche',
        hoursValue: '18,5 von 20',
        hoursPct: 92.5,
        contractLabel: 'Vertragsstatus',
        contractValue: 'Aktiv · unterzeichnet 12. Mai 2026',
        payrollHeader: 'Lohnvorschau Juni',
        lineItems: [
          'Bruttolohn',
          'Lohnsteuer',
          'Krankenversicherung',
          'Rentenbeitrag',
        ],
        floatChip: 'Werkstudentenlimit sicher',
      },
    },
    audiences: {
      students: {
        kicker: 'Für Studierende',
        title: 'Arbeit, die zu deinem Studium passt',
        points: [
          {
            title: 'Flexible Stunden',
            body: 'Schichten, die in deinen Stundenplan passen, nicht umgekehrt.',
          },
          {
            title: 'Garantiert legale Bezahlung',
            body: 'Jeder Job zahlt mindestens den gesetzlichen Mindestlohn, festgehalten im Vertrag.',
          },
          {
            title: 'Arbeit in Uninähe',
            body: 'Jobs nahe deiner Hochschule oder komplett remote.',
          },
        ],
        mock: {
          header: 'Deine Woche',
          rows: [
            { lead: 'Di', detail: 'Kaffeewerk Mitte', trail: '4 Std' },
            { lead: 'Do', detail: 'LernRaum', trail: '3 Std' },
            { lead: 'Sa', detail: 'Messe Crew Berlin', trail: '6 Std' },
          ],
          footer: '13 von 20 Stunden geplant',
        },
      },
      employers: {
        kicker: 'Für Arbeitgeber',
        title: 'Studierende einstellen ohne juristische Kopfschmerzen',
        points: [
          {
            title: 'Geprüfte Talente',
            body: 'Alle Studierenden sind identitätsgeprüft und nachweislich immatrikuliert.',
          },
          {
            title: 'Automatische Compliance',
            body: 'Stundenlimits, Vertragsvorlagen und Statusprüfungen laufen von selbst.',
          },
          {
            title: 'Stunden und Lohn an einem Ort',
            body: 'Zeiterfassung fließt direkt in fertige Lohnexporte.',
          },
        ],
        mock: {
          header: 'Bewerbungen',
          rows: [
            { lead: 'Jonas W.', detail: 'TU Berlin', trail: 'Verifiziert' },
            { lead: 'Aylin D.', detail: 'FU Berlin', trail: 'Verifiziert' },
            { lead: 'Marco P.', detail: 'HTW Berlin', trail: 'Verifiziert' },
          ],
          footer: '3 Kandidaten bereit zum Gespräch',
        },
      },
    },
    testimonials: {
      kicker: 'Stimmen',
      title: 'Was unsere Nutzer sagen',
      sub: 'Studierende und HR Teams darüber, was sich mit LaborLink geändert hat.',
      featured: {
        quote:
          'Wir haben 12 Werkstudentenstellen in sechs Wochen besetzt. Verträge und Stundenerfassung, die unser HR Team früher Tage gekostet haben, laufen jetzt im Hintergrund.',
        name: 'Miriam Kessler',
        role: 'HR Leitung, Stadtlogistik',
        stat: '12 Stellen in 6 Wochen besetzt',
      },
      others: [
        {
          quote:
            'Ich verdiene neben dem Master rund 640 € im Monat, und die App warnt mich, bevor ich an das Limit von 20 Stunden komme.',
          name: 'Jonas Weber',
          role: 'Student, TU Berlin',
        },
        {
          quote:
            'Das Onboarding einer studentischen Aushilfe hat früher zwei Wochen Papierkram gebraucht. Jetzt einen Nachmittag.',
          name: 'Aylin Demir',
          role: 'Head of Operations, Kaffeewerk',
        },
      ],
    },
    pricing: {
      kicker: 'Preise',
      title: 'Einfache, transparente Preise',
      sub: 'Keine versteckten Gebühren, kein Verkaufsgespräch nötig. Du zahlst, was du siehst.',
      tiers: [
        {
          name: 'Studierende',
          price: '0 €',
          cadence: 'für immer kostenlos',
          desc: 'Alles, was du für konforme Arbeit brauchst.',
          features: [
            { text: 'Unbegrenzte Bewerbungen' },
            { text: 'Nur geprüfte Arbeitgeber', compliance: true },
            { text: 'Stundenlimits live im Blick', compliance: true },
            { text: 'Verträge an einem Ort' },
          ],
          cta: 'Kostenloses Profil erstellen',
        },
        {
          name: 'Arbeitgeber Starter',
          price: '89 €',
          cadence: 'pro Einstellung',
          desc: 'Du zahlst nur, wenn du wirklich einstellst.',
          features: [
            { text: 'Unbegrenzte Stellenanzeigen' },
            { text: 'Compliance Prüfungen inklusive', compliance: true },
            { text: 'Vertragsvorlagen' },
            { text: 'Verifizierte Bewerber', compliance: true },
          ],
          cta: 'Jetzt einstellen',
        },
        {
          name: 'Arbeitgeber Scale',
          price: '249 €',
          cadence: 'pro Monat',
          desc: 'Für Teams, die das ganze Jahr Studierende einstellen.',
          features: [
            { text: 'Unbegrenzte Einstellungen' },
            { text: 'Fertige Lohnexporte' },
            { text: 'Stunden und Lohn Dashboard' },
            { text: 'Automatisches Compliance Monitoring', compliance: true },
            { text: 'Bevorzugter Support' },
          ],
          cta: 'Kostenlos testen',
          highlighted: true,
          badge: 'Am beliebtesten',
        },
      ],
    },
    faq: {
      kicker: 'FAQ',
      title: 'Häufige Fragen',
      sub: 'Alles zu Legalität, Bezahlung und deinen Daten.',
      items: [
        {
          q: 'Ist die Einstellung über LaborLink legal?',
          a: 'Ja. Jeder Vertrag folgt deutschem Arbeitsrecht. Wir prüfen Immatrikulation, Stundenlimits und Versicherungspflichten vor der Unterschrift und laufend während des Jobs.',
        },
        {
          q: 'Was ist der Unterschied zwischen Minijob und Werkstudent?',
          a: 'Ein Minijob ist 2026 auf 603 € im Monat begrenzt und bleibt fast frei von Sozialabgaben. Als Werkstudent darfst du in der Vorlesungszeit bis zu 20 Stunden pro Woche arbeiten, mit reduzierten Abgaben. LaborLink zeigt dir das passende Modell und hält die Grenzen automatisch ein.',
        },
        {
          q: 'Wie funktioniert die Bezahlung?',
          a: 'Arbeitgeber zahlen über ihre normale Lohnabrechnung. LaborLink erfasst Stunden, wendet den korrekten Mindestlohn an und erstellt fertige Exporte. Studierende sehen ihre erwartete Bezahlung, bevor sie eine Schicht annehmen.',
        },
        {
          q: 'Was passiert mit meinen Daten?',
          a: 'Deine Daten liegen auf Servern in der EU, sind durch die DSGVO geschützt und werden nie verkauft. Du kannst deine persönlichen Daten jederzeit in den Kontoeinstellungen exportieren oder löschen.',
        },
      ],
    },
    cta: {
      title: 'Finde deine nächste Schicht. Oder deine nächste Verstärkung.',
      sub: 'Starte heute mit LaborLink. Kostenlos für Studierende, transparent für Arbeitgeber.',
      student: 'Nächste Schicht finden',
      employer: 'Konform einstellen',
    },
    footer: {
      tagline: 'Der konforme Marktplatz für studentische Arbeit in Deutschland.',
      madeIn: 'Aus Berlin',
      columns: [
        {
          title: 'Produkt',
          links: [
            { label: 'So funktioniert es', href: '#how' },
            { label: 'Offene Jobs', href: '#jobs' },
            { label: 'Preise', href: '#pricing' },
            { label: 'FAQ', href: '#faq' },
          ],
        },
        {
          title: 'Unternehmen',
          links: [
            { label: 'Über uns', href: '#' },
            { label: 'Karriere', href: '#' },
            { label: 'Presse', href: '#' },
            { label: 'Kontakt', href: '#' },
          ],
        },
        {
          title: 'Rechtliches',
          links: [
            { label: 'Impressum', href: '/impressum' },
            { label: 'Datenschutzerklärung', href: '/datenschutz' },
            { label: 'AGB', href: '/agb' },
          ],
        },
      ],
      languageTitle: 'Sprache',
      copyright: '© 2026 LaborLink. Alle Rechte vorbehalten.',
    },
  },
}
