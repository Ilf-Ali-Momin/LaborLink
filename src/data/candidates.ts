import type { Lang } from '../content'

export interface CandidateRecord {
  id: string
  name: string
  university: string
  skills: Record<Lang, string[]>
  availability: Record<Lang, string>
  verified: boolean
}

export const candidates: CandidateRecord[] = [
  {
    id: 'jonas-w',
    name: 'Jonas Weber',
    university: 'TU Berlin',
    skills: {
      en: ['React', 'TypeScript', 'Python'],
      de: ['React', 'TypeScript', 'Python'],
    },
    availability: {
      en: 'Up to 20 h per week',
      de: 'Bis zu 20 Std pro Woche',
    },
    verified: true,
  },
  {
    id: 'aylin-d',
    name: 'Aylin Demir',
    university: 'FU Berlin',
    skills: {
      en: ['Social media', 'Copywriting', 'Canva'],
      de: ['Social Media', 'Texten', 'Canva'],
    },
    availability: {
      en: 'Afternoons and weekends',
      de: 'Nachmittags und am Wochenende',
    },
    verified: true,
  },
  {
    id: 'marco-p',
    name: 'Marco Petrov',
    university: 'HTW Berlin',
    skills: {
      en: ['Logistics', 'Forklift license', 'Excel'],
      de: ['Logistik', 'Staplerschein', 'Excel'],
    },
    availability: {
      en: 'Evenings, up to 12 h',
      de: 'Abends, bis zu 12 Std',
    },
    verified: true,
  },
  {
    id: 'lena-m',
    name: 'Lena Maier',
    university: 'HU Berlin',
    skills: {
      en: ['Customer support', 'German C2', 'English C1'],
      de: ['Kundensupport', 'Deutsch C2', 'Englisch C1'],
    },
    availability: {
      en: 'Flexible during semester break',
      de: 'Flexibel in den Semesterferien',
    },
    verified: true,
  },
]
