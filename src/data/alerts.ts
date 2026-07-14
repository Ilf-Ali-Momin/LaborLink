import type { Lang } from '../content'

export type AlertKind = 'compliance' | 'proposal' | 'match' | 'contract'

export interface AlertRecord {
  id: string
  kind: AlertKind
  title: Record<Lang, string>
  body: Record<Lang, string>
  time: Record<Lang, string>
}

export const alerts: AlertRecord[] = [
  {
    id: 'hours-warning',
    kind: 'compliance',
    title: {
      en: 'Hour limit heads up',
      de: 'Hinweis zum Stundenlimit',
    },
    body: {
      en: 'You are at 18.5 of 20 weekly hours. New shifts this week would break the Werkstudent limit.',
      de: 'Du bist bei 18,5 von 20 Wochenstunden. Neue Schichten diese Woche würden das Werkstudentenlimit überschreiten.',
    },
    time: { en: '2 h ago', de: 'vor 2 Std' },
  },
  {
    id: 'contract-ready',
    kind: 'contract',
    title: {
      en: 'Contract ready to sign',
      de: 'Vertrag bereit zur Unterschrift',
    },
    body: {
      en: 'Kaffeewerk Mitte sent a contract for Barista, weekend shifts. Review and sign it in Contracts.',
      de: 'Kaffeewerk Mitte hat einen Vertrag für Barista am Wochenende gesendet. Prüfe und unterschreibe ihn unter Verträge.',
    },
    time: { en: '5 h ago', de: 'vor 5 Std' },
  },
  {
    id: 'proposal-viewed',
    kind: 'proposal',
    title: {
      en: 'Your proposal was viewed',
      de: 'Deine Bewerbung wurde angesehen',
    },
    body: {
      en: 'Novabank opened your proposal for Working student, frontend.',
      de: 'Novabank hat deine Bewerbung als Werkstudent Frontend geöffnet.',
    },
    time: { en: 'Yesterday', de: 'Gestern' },
  },
  {
    id: 'new-match',
    kind: 'match',
    title: {
      en: 'New match near you',
      de: 'Neues Match in deiner Nähe',
    },
    body: {
      en: 'Campusfy posted a Werkstudent support role that fits your profile and schedule.',
      de: 'Campusfy hat eine Werkstudentenstelle im Support veröffentlicht, die zu Profil und Stundenplan passt.',
    },
    time: { en: '2 days ago', de: 'vor 2 Tagen' },
  },
]
