/**
 * Strings for the app screens (everything behind /login), keyed by language.
 * Same rule as content.ts: no hyphens in visible copy, components never
 * hardcode text.
 */

import type { Lang } from './content'
import type { JobType } from './data/jobs'

export interface AppContent {
  common: {
    back: string
    cancel: string
    demoBadge: string
    backToSite: string
    perHour: string
    hoursPerWeek: string
    verified: string
    loading: string
    genericError: string
  }
  jobTypes: Record<JobType, string>
  login: {
    title: string
    sub: string
    nameLabel: string
    namePlaceholder: string
    emailLabel: string
    emailPlaceholder: string
    passwordLabel: string
    passwordPlaceholder: string
    signInTab: string
    signUpTab: string
    continueBtn: string
    demoNote: string
    liveNote: string
    confirmNotice: string
    errorName: string
    errorEmail: string
    errorPassword: string
  }
  onboarding: {
    kicker: string
    title: string
    sub: string
    student: { title: string; sub: string; points: string[] }
    employer: { title: string; sub: string; points: string[] }
    continueBtn: string
  }
  tabs: {
    jobs: string
    proposals: string
    contracts: string
    messages: string
    profile: string
    hiring: string
    candidates: string
    alerts: string
  }
  jobs: {
    title: string
    sub: string
    searchPlaceholder: string
    filterAll: string
    empty: string
    postedToday: string
    postedYesterday: string
    postedDays: string
  }
  jobDetail: {
    about: string
    tasks: string
    pay: string
    hours: string
    type: string
    complianceTitle: string
    complianceBody: string
    apply: string
    applied: string
    notFound: string
    backToJobs: string
  }
  proposal: {
    title: string
    sub: string
    messageLabel: string
    messagePlaceholder: string
    hoursLabel: string
    hoursPlaceholder: string
    submit: string
    errorMessage: string
    errorHours: string
  }
  bravo: {
    title: string
    body: string
    viewProposals: string
    backToJobs: string
  }
  proposals: {
    title: string
    sub: string
    empty: string
    emptyCta: string
    statusPending: string
    statusAccepted: string
    statusDeclined: string
    statusWithdrawn: string
    submitted: string
  }
  contracts: {
    title: string
    sub: string
    activeBadge: string
    draftBadge: string
    hoursThisWeek: string
    limitSafe: string
    signedOn: string
    awaitingSignature: string
    signNow: string
    payLabel: string
  }
  messages: {
    title: string
    sub: string
    inputPlaceholder: string
    send: string
    emptyThread: string
    emptyList: string
  }
  alerts: {
    title: string
    sub: string
    markRead: string
    allRead: string
  }
  profile: {
    title: string
    earnings: string
    hoursMonth: string
    proposalsSent: string
    complianceTitle: string
    complianceOk: string
    complianceSub: string
    settingsTitle: string
    language: string
    theme: string
    themeLight: string
    themeDark: string
    dataTitle: string
    dataExport: string
    dataDelete: string
    dataNote: string
    deletePrompt: string
    deletePhrase: string
    deleteConfirm: string
    deleteDone: string
    signOut: string
    roleStudent: string
    roleEmployer: string
    switchRole: string
  }
  hiring: {
    title: string
    sub: string
    titleLabel: string
    titlePlaceholder: string
    cityLabel: string
    cityPlaceholder: string
    payLabel: string
    hoursLabel: string
    hoursPlaceholder: string
    typeLabel: string
    descLabel: string
    descPlaceholder: string
    companyLabel: string
    companyPlaceholder: string
    publish: string
    complianceNote: string
    errorRequired: string
    errorPay: string
    yourPostings: string
    liveBadge: string
    pendingReviewBadge: string
    noPostings: string
    applicantsTitle: string
    noApplicants: string
    accept: string
    decline: string
  }
  candidates: {
    title: string
    sub: string
    availability: string
    message: string
    empty: string
  }
  notFound: {
    title: string
    body: string
    home: string
  }
}

export const appContent: Record<Lang, AppContent> = {
  en: {
    common: {
      back: 'Back',
      cancel: 'Cancel',
      demoBadge: 'Demo',
      backToSite: 'Back to site',
      perHour: 'per hour',
      hoursPerWeek: 'h per week',
      verified: 'Verified',
      loading: 'Loading',
      genericError: 'Something went wrong. Please try again.',
    },
    jobTypes: {
      minijob: 'Minijob',
      werkstudent: 'Werkstudent',
      oneoff: 'One off',
    },
    login: {
      title: 'Log in to LaborLink',
      sub: 'Compliant student work, one login away.',
      nameLabel: 'Name',
      namePlaceholder: 'Your name',
      emailLabel: 'Email',
      emailPlaceholder: 'you@university.de',
      passwordLabel: 'Password',
      passwordPlaceholder: 'At least 8 characters',
      signInTab: 'Sign in',
      signUpTab: 'Create account',
      continueBtn: 'Continue',
      demoNote:
        'This is a product preview. No password, no real account: your session lives only in this browser.',
      liveNote:
        'Your account is protected by Supabase Auth. We never see or store your password.',
      confirmNotice:
        'Almost there. Confirm your mail address via the link in your inbox, then sign in here.',
      errorName: 'Please enter your name.',
      errorEmail: 'Please enter a valid email address.',
      errorPassword: 'The password needs at least 8 characters.',
    },
    onboarding: {
      kicker: 'Welcome',
      title: 'How do you want to use LaborLink?',
      sub: 'You can switch the role later in your profile.',
      student: {
        title: 'I am a student',
        sub: 'Find flexible, compliant work near you.',
        points: ['Verified employers only', 'Hour limits tracked for you', 'Legal pay in every contract'],
      },
      employer: {
        title: 'I am an employer',
        sub: 'Hire vetted students without the legal headache.',
        points: ['Post roles in minutes', 'Compliance checks built in', 'Hours and payroll in one place'],
      },
      continueBtn: 'Continue',
    },
    tabs: {
      jobs: 'Jobs',
      proposals: 'Proposals',
      contracts: 'Contracts',
      messages: 'Messages',
      profile: 'Profile',
      hiring: 'Hiring',
      candidates: 'Candidates',
      alerts: 'Alerts',
    },
    jobs: {
      title: 'Find your next shift',
      sub: 'Verified roles that fit your schedule and your student status.',
      searchPlaceholder: 'Search role, employer or city',
      filterAll: 'All',
      empty: 'No roles match your search. Try fewer filters.',
      postedToday: 'Posted today',
      postedYesterday: 'Posted yesterday',
      postedDays: 'Posted {n} days ago',
    },
    jobDetail: {
      about: 'About this role',
      tasks: 'What you will do',
      pay: 'Pay',
      hours: 'Hours',
      type: 'Type',
      complianceTitle: 'Compliance checked',
      complianceBody:
        'Contract template, hour limits and insurance status are verified by LaborLink before you sign.',
      apply: 'Submit a proposal',
      applied: 'Proposal submitted',
      notFound: 'This role no longer exists.',
      backToJobs: 'Back to jobs',
    },
    proposal: {
      title: 'Submit a proposal',
      sub: 'The employer sees your profile, your verified status and this message.',
      messageLabel: 'Message to the employer',
      messagePlaceholder:
        'Briefly say why you fit this role and when you can start.',
      hoursLabel: 'Hours you can work per week',
      hoursPlaceholder: 'e.g. 10',
      submit: 'Send proposal',
      errorMessage: 'Please write a short message (at least 20 characters).',
      errorHours: 'Please enter your available hours (1 to 20).',
    },
    bravo: {
      title: 'Bravo!',
      body: 'Your proposal is on its way. The employer usually replies within two days, and we notify you the moment they do.',
      viewProposals: 'View my proposals',
      backToJobs: 'Browse more jobs',
    },
    proposals: {
      title: 'My proposals',
      sub: 'Everything you applied to, in one place.',
      empty: 'No proposals yet. Find a role and send your first one.',
      emptyCta: 'Browse jobs',
      statusPending: 'Pending',
      statusAccepted: 'Accepted',
      statusDeclined: 'Declined',
      statusWithdrawn: 'Withdrawn',
      submitted: 'Submitted',
    },
    contracts: {
      title: 'Contracts',
      sub: 'Your agreements, hours and pay, always compliant.',
      activeBadge: 'Active',
      draftBadge: 'Ready to sign',
      hoursThisWeek: 'Hours this week',
      limitSafe: 'Werkstudent limit safe',
      signedOn: 'Signed on',
      awaitingSignature: 'Awaiting your signature',
      signNow: 'Review and sign',
      payLabel: 'Pay',
    },
    messages: {
      title: 'Messages',
      sub: 'Conversations with employers and support.',
      inputPlaceholder: 'Write a message',
      send: 'Send',
      emptyThread: 'No messages yet. Say hello.',
      emptyList:
        'No conversations yet. They start from a proposal: apply to a job or message an applicant.',
    },
    alerts: {
      title: 'Alerts',
      sub: 'Compliance warnings, matches and updates.',
      markRead: 'Mark all as read',
      allRead: 'All caught up',
    },
    profile: {
      title: 'Profile',
      earnings: 'Earnings this month',
      hoursMonth: 'Hours this month',
      proposalsSent: 'Proposals sent',
      complianceTitle: 'Compliance status',
      complianceOk: 'Compliant',
      complianceSub: 'Enrollment verified · hour limits on track',
      settingsTitle: 'Settings',
      language: 'Language',
      theme: 'Theme',
      themeLight: 'Light',
      themeDark: 'Dark',
      dataTitle: 'Your data',
      dataExport: 'Export my data',
      dataDelete: 'Delete my data',
      dataNote: 'GDPR: export or erase your personal data at any time.',
      deletePrompt:
        'This permanently removes your proposals, postings and messages from this browser. To confirm, type the sentence below exactly.',
      deletePhrase: 'delete my data',
      deleteConfirm: 'Permanently delete',
      deleteDone: 'Your data has been deleted.',
      signOut: 'Sign out',
      roleStudent: 'Student',
      roleEmployer: 'Employer',
      switchRole: 'Switch role',
    },
    hiring: {
      title: 'Post a role',
      sub: 'Describe the job once. We handle contract templates, hour limits and payroll exports.',
      titleLabel: 'Job title',
      titlePlaceholder: 'e.g. Working student, support',
      cityLabel: 'City or district',
      cityPlaceholder: 'Berlin Mitte',
      payLabel: 'Pay per hour in EUR',
      hoursLabel: 'Hours per week',
      hoursPlaceholder: 'e.g. 12 – 16',
      typeLabel: 'Job type',
      descLabel: 'Description',
      descPlaceholder: 'What will the student do? What should they bring?',
      companyLabel: 'Company name',
      companyPlaceholder: 'e.g. Kaffeewerk Mitte',
      publish: 'Publish role',
      complianceNote:
        'LaborLink checks pay against minimum wage and applies the right contract template before the role goes live.',
      errorRequired: 'Please fill in every field.',
      errorPay: 'Pay must be at least the legal minimum wage of €13.90.',
      yourPostings: 'Your postings',
      liveBadge: 'Live',
      pendingReviewBadge: 'Verification pending',
      noPostings: 'No postings yet. Your published roles appear here.',
      applicantsTitle: 'Applicants',
      noApplicants: 'No applicants yet.',
      accept: 'Accept',
      decline: 'Decline',
    },
    candidates: {
      title: 'Candidates',
      sub: 'Verified students matching your open roles.',
      availability: 'Availability',
      message: 'Message',
      empty:
        'Candidates appear here as soon as students apply to your roles.',
    },
    notFound: {
      title: 'Page not found',
      body: 'The page you are looking for does not exist or has moved.',
      home: 'Back to the start page',
    },
  },

  de: {
    common: {
      back: 'Zurück',
      cancel: 'Abbrechen',
      demoBadge: 'Demo',
      backToSite: 'Zur Website',
      perHour: 'pro Stunde',
      hoursPerWeek: 'Std pro Woche',
      verified: 'Verifiziert',
      loading: 'Lädt',
      genericError: 'Etwas ist schiefgelaufen. Bitte versuche es erneut.',
    },
    jobTypes: {
      minijob: 'Minijob',
      werkstudent: 'Werkstudent',
      oneoff: 'Einmalig',
    },
    login: {
      title: 'Bei LaborLink anmelden',
      sub: 'Konforme studentische Arbeit, eine Anmeldung entfernt.',
      nameLabel: 'Name',
      namePlaceholder: 'Dein Name',
      emailLabel: 'Mail Adresse',
      emailPlaceholder: 'du@uni.de',
      passwordLabel: 'Passwort',
      passwordPlaceholder: 'Mindestens 8 Zeichen',
      signInTab: 'Anmelden',
      signUpTab: 'Konto erstellen',
      continueBtn: 'Weiter',
      demoNote:
        'Dies ist eine Produktvorschau. Kein Passwort, kein echtes Konto: deine Sitzung existiert nur in diesem Browser.',
      liveNote:
        'Dein Konto wird durch Supabase Auth geschützt. Wir sehen und speichern dein Passwort nie.',
      confirmNotice:
        'Fast geschafft. Bestätige deine Mail Adresse über den Link in deinem Postfach und melde dich dann hier an.',
      errorName: 'Bitte gib deinen Namen ein.',
      errorEmail: 'Bitte gib eine gültige Mail Adresse ein.',
      errorPassword: 'Das Passwort braucht mindestens 8 Zeichen.',
    },
    onboarding: {
      kicker: 'Willkommen',
      title: 'Wie möchtest du LaborLink nutzen?',
      sub: 'Du kannst die Rolle später im Profil wechseln.',
      student: {
        title: 'Ich bin Studentin oder Student',
        sub: 'Finde flexible, konforme Arbeit in deiner Nähe.',
        points: ['Nur geprüfte Arbeitgeber', 'Stundenlimits im Blick', 'Legale Bezahlung in jedem Vertrag'],
      },
      employer: {
        title: 'Ich bin Arbeitgeber',
        sub: 'Stelle geprüfte Studierende ohne juristische Kopfschmerzen ein.',
        points: ['Stellen in Minuten ausschreiben', 'Compliance Prüfungen integriert', 'Stunden und Lohn an einem Ort'],
      },
      continueBtn: 'Weiter',
    },
    tabs: {
      jobs: 'Jobs',
      proposals: 'Bewerbungen',
      contracts: 'Verträge',
      messages: 'Nachrichten',
      profile: 'Profil',
      hiring: 'Ausschreiben',
      candidates: 'Kandidaten',
      alerts: 'Hinweise',
    },
    jobs: {
      title: 'Finde deine nächste Schicht',
      sub: 'Geprüfte Jobs, die zu Stundenplan und Studierendenstatus passen.',
      searchPlaceholder: 'Rolle, Arbeitgeber oder Stadt suchen',
      filterAll: 'Alle',
      empty: 'Keine Jobs passen zur Suche. Versuche weniger Filter.',
      postedToday: 'Heute veröffentlicht',
      postedYesterday: 'Gestern veröffentlicht',
      postedDays: 'Vor {n} Tagen veröffentlicht',
    },
    jobDetail: {
      about: 'Über diesen Job',
      tasks: 'Deine Aufgaben',
      pay: 'Lohn',
      hours: 'Stunden',
      type: 'Art',
      complianceTitle: 'Compliance geprüft',
      complianceBody:
        'Vertragsvorlage, Stundenlimits und Versicherungsstatus prüft LaborLink, bevor du unterschreibst.',
      apply: 'Bewerbung senden',
      applied: 'Bewerbung gesendet',
      notFound: 'Diesen Job gibt es nicht mehr.',
      backToJobs: 'Zurück zu den Jobs',
    },
    proposal: {
      title: 'Bewerbung senden',
      sub: 'Der Arbeitgeber sieht dein Profil, deinen Verifizierungsstatus und diese Nachricht.',
      messageLabel: 'Nachricht an den Arbeitgeber',
      messagePlaceholder:
        'Beschreibe kurz, warum du passt und wann du anfangen kannst.',
      hoursLabel: 'Stunden pro Woche, die du arbeiten kannst',
      hoursPlaceholder: 'z. B. 10',
      submit: 'Bewerbung absenden',
      errorMessage: 'Bitte schreibe eine kurze Nachricht (mindestens 20 Zeichen).',
      errorHours: 'Bitte gib deine verfügbaren Stunden an (1 bis 20).',
    },
    bravo: {
      title: 'Bravo!',
      body: 'Deine Bewerbung ist unterwegs. Arbeitgeber antworten meist innerhalb von zwei Tagen, und wir benachrichtigen dich sofort.',
      viewProposals: 'Meine Bewerbungen ansehen',
      backToJobs: 'Weitere Jobs entdecken',
    },
    proposals: {
      title: 'Meine Bewerbungen',
      sub: 'Alles, worauf du dich beworben hast, an einem Ort.',
      empty: 'Noch keine Bewerbungen. Finde einen Job und sende deine erste.',
      emptyCta: 'Jobs entdecken',
      statusPending: 'Ausstehend',
      statusAccepted: 'Angenommen',
      statusDeclined: 'Abgelehnt',
      statusWithdrawn: 'Zurückgezogen',
      submitted: 'Gesendet',
    },
    contracts: {
      title: 'Verträge',
      sub: 'Deine Vereinbarungen, Stunden und Löhne, immer konform.',
      activeBadge: 'Aktiv',
      draftBadge: 'Bereit zur Unterschrift',
      hoursThisWeek: 'Stunden diese Woche',
      limitSafe: 'Werkstudentenlimit sicher',
      signedOn: 'Unterzeichnet am',
      awaitingSignature: 'Wartet auf deine Unterschrift',
      signNow: 'Prüfen und unterschreiben',
      payLabel: 'Lohn',
    },
    messages: {
      title: 'Nachrichten',
      sub: 'Unterhaltungen mit Arbeitgebern und Support.',
      inputPlaceholder: 'Nachricht schreiben',
      send: 'Senden',
      emptyThread: 'Noch keine Nachrichten. Sag hallo.',
      emptyList:
        'Noch keine Unterhaltungen. Sie starten aus einer Bewerbung: bewirb dich auf einen Job oder schreibe einer Bewerberin.',
    },
    alerts: {
      title: 'Hinweise',
      sub: 'Compliance Warnungen, Matches und Updates.',
      markRead: 'Alle als gelesen markieren',
      allRead: 'Alles gelesen',
    },
    profile: {
      title: 'Profil',
      earnings: 'Verdienst diesen Monat',
      hoursMonth: 'Stunden diesen Monat',
      proposalsSent: 'Bewerbungen gesendet',
      complianceTitle: 'Compliance Status',
      complianceOk: 'Konform',
      complianceSub: 'Immatrikulation geprüft · Stundenlimits im Rahmen',
      settingsTitle: 'Einstellungen',
      language: 'Sprache',
      theme: 'Design',
      themeLight: 'Hell',
      themeDark: 'Dunkel',
      dataTitle: 'Deine Daten',
      dataExport: 'Meine Daten exportieren',
      dataDelete: 'Meine Daten löschen',
      dataNote: 'DSGVO: exportiere oder lösche deine persönlichen Daten jederzeit.',
      deletePrompt:
        'Das entfernt deine Bewerbungen, Ausschreibungen und Nachrichten dauerhaft aus diesem Browser. Zur Bestätigung tippe den Satz unten genau ein.',
      deletePhrase: 'meine daten löschen',
      deleteConfirm: 'Endgültig löschen',
      deleteDone: 'Deine Daten wurden gelöscht.',
      signOut: 'Abmelden',
      roleStudent: 'Studentin / Student',
      roleEmployer: 'Arbeitgeber',
      switchRole: 'Rolle wechseln',
    },
    hiring: {
      title: 'Stelle ausschreiben',
      sub: 'Beschreibe den Job einmal. Vertragsvorlagen, Stundenlimits und Lohnexporte übernehmen wir.',
      titleLabel: 'Jobtitel',
      titlePlaceholder: 'z. B. Werkstudent Support',
      cityLabel: 'Stadt oder Kiez',
      cityPlaceholder: 'Berlin Mitte',
      payLabel: 'Lohn pro Stunde in EUR',
      hoursLabel: 'Stunden pro Woche',
      hoursPlaceholder: 'z. B. 12 – 16',
      typeLabel: 'Jobart',
      descLabel: 'Beschreibung',
      descPlaceholder: 'Was macht die Person? Was sollte sie mitbringen?',
      companyLabel: 'Firmenname',
      companyPlaceholder: 'z. B. Kaffeewerk Mitte',
      publish: 'Stelle veröffentlichen',
      complianceNote:
        'LaborLink prüft den Lohn gegen den Mindestlohn und wählt die passende Vertragsvorlage, bevor die Stelle live geht.',
      errorRequired: 'Bitte fülle alle Felder aus.',
      errorPay: 'Der Lohn muss mindestens dem Mindestlohn von 13,90 € entsprechen.',
      yourPostings: 'Deine Ausschreibungen',
      liveBadge: 'Live',
      pendingReviewBadge: 'Verifizierung ausstehend',
      noPostings: 'Noch keine Ausschreibungen. Veröffentlichte Stellen erscheinen hier.',
      applicantsTitle: 'Bewerbungen',
      noApplicants: 'Noch keine Bewerbungen.',
      accept: 'Annehmen',
      decline: 'Ablehnen',
    },
    candidates: {
      title: 'Kandidaten',
      sub: 'Verifizierte Studierende, die zu deinen offenen Stellen passen.',
      availability: 'Verfügbarkeit',
      message: 'Nachricht',
      empty:
        'Kandidaten erscheinen hier, sobald sich Studierende auf deine Stellen bewerben.',
    },
    notFound: {
      title: 'Seite nicht gefunden',
      body: 'Die gesuchte Seite existiert nicht oder ist umgezogen.',
      home: 'Zurück zur Startseite',
    },
  },
}
