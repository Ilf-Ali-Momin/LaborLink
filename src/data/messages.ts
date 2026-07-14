import type { Lang } from '../content'

export interface SeedMessage {
  fromMe: boolean
  text: Record<Lang, string>
  time: string
}

export interface Conversation {
  id: string
  name: string
  subtitle: Record<Lang, string>
  messages: SeedMessage[]
}

export const conversations: Conversation[] = [
  {
    id: 'kaffeewerk-anna',
    name: 'Anna Roth',
    subtitle: {
      en: 'Kaffeewerk Mitte · Hiring manager',
      de: 'Kaffeewerk Mitte · Einstellung',
    },
    messages: [
      {
        fromMe: false,
        text: {
          en: 'Hi! Thanks for your proposal. Could you do a trial shift on Saturday morning?',
          de: 'Hi! Danke für deine Bewerbung. Könntest du am Samstagvormittag eine Probeschicht machen?',
        },
        time: '09:24',
      },
      {
        fromMe: true,
        text: {
          en: 'Hi Anna, yes, Saturday works. From 9 to 12?',
          de: 'Hi Anna, ja, Samstag passt. Von 9 bis 12?',
        },
        time: '09:31',
      },
      {
        fromMe: false,
        text: {
          en: 'Perfect. The contract draft is already in your LaborLink contracts tab.',
          de: 'Perfekt. Der Vertragsentwurf liegt schon in deinem LaborLink Vertragsbereich.',
        },
        time: '09:40',
      },
    ],
  },
  {
    id: 'novabank-felix',
    name: 'Felix Braun',
    subtitle: {
      en: 'Novabank · Engineering',
      de: 'Novabank · Engineering',
    },
    messages: [
      {
        fromMe: false,
        text: {
          en: 'We liked your GitHub profile. Are you available for a short intro call this week?',
          de: 'Dein GitHub Profil hat uns gefallen. Hast du diese Woche Zeit für ein kurzes Kennenlernen?',
        },
        time: 'Tue',
      },
    ],
  },
  {
    id: 'laborlink-support',
    name: 'LaborLink Support',
    subtitle: {
      en: 'We reply within one day',
      de: 'Wir antworten innerhalb eines Tages',
    },
    messages: [
      {
        fromMe: false,
        text: {
          en: 'Welcome to LaborLink! Your enrollment check is complete and your profile is verified.',
          de: 'Willkommen bei LaborLink! Deine Immatrikulation ist geprüft und dein Profil verifiziert.',
        },
        time: 'Mon',
      },
    ],
  },
]

export function getConversation(id: string): Conversation | undefined {
  return conversations.find((c) => c.id === id)
}
