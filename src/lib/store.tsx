import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { JobType } from '../data/jobs'

/**
 * Client side app state for the demo (proposals, job postings, sent
 * messages, alert read state), persisted to localStorage. Replace with a
 * real backend later; pages only talk to this hook, so the swap is local.
 */

export interface Proposal {
  jobId: string
  message: string
  hoursPerWeek: string
  date: string
}

export interface Posting {
  id: string
  title: string
  city: string
  payEUR: number
  hoursPerWeek: string
  type: JobType
  description: string
  employerName?: string
  date: string
}

export interface SentMessage {
  conversationId: string
  text: string
  date: string
}

interface AppData {
  proposals: Proposal[]
  postings: Posting[]
  sentMessages: SentMessage[]
  alertsReadAt: string | null
}

interface StoreValue extends AppData {
  addProposal: (proposal: Omit<Proposal, 'date'>) => void
  hasProposal: (jobId: string) => boolean
  addPosting: (posting: Omit<Posting, 'id' | 'date'>) => void
  sendMessage: (conversationId: string, text: string) => void
  markAlertsRead: () => void
  resetAll: () => void
}

const empty: AppData = {
  proposals: [],
  postings: [],
  sentMessages: [],
  alertsReadAt: null,
}

const STORAGE_KEY = 'laborlink.appdata'

function readData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...empty, ...(JSON.parse(raw) as Partial<AppData>) }
  } catch {
    /* corrupt or unavailable storage: start fresh */
  }
  return empty
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(readData)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      /* non fatal */
    }
  }, [data])

  const value: StoreValue = {
    ...data,
    addProposal: (proposal) =>
      setData((d) => ({
        ...d,
        proposals: [
          ...d.proposals.filter((p) => p.jobId !== proposal.jobId),
          { ...proposal, date: new Date().toISOString() },
        ],
      })),
    hasProposal: (jobId) => data.proposals.some((p) => p.jobId === jobId),
    addPosting: (posting) =>
      setData((d) => ({
        ...d,
        postings: [
          {
            ...posting,
            id: `posting-${Date.now()}`,
            date: new Date().toISOString(),
          },
          ...d.postings,
        ],
      })),
    sendMessage: (conversationId, text) =>
      setData((d) => ({
        ...d,
        sentMessages: [
          ...d.sentMessages,
          { conversationId, text, date: new Date().toISOString() },
        ],
      })),
    markAlertsRead: () =>
      setData((d) => ({ ...d, alertsReadAt: new Date().toISOString() })),
    resetAll: () => setData(empty),
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}
