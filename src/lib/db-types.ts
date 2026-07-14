import type { JobType } from '../data/jobs'
import type { Role } from './auth'

/** Row shapes as returned by PostgREST for our tables. */

export interface ProfileRow {
  id: string
  name: string
  role: Role | null
}

export interface JobRow {
  id: string
  owner_id: string | null
  title: string
  employer_name: string
  city: string
  pay_eur: number | string
  hours_per_week: string
  job_type: JobType
  description: string
  tasks: string[]
  verified: boolean
  status: 'live' | 'closed'
  created_at: string
}

export type ProposalStatus = 'pending' | 'accepted' | 'declined' | 'withdrawn'

export interface ProposalRow {
  id: string
  job_id: string
  student_id: string
  message: string
  hours_per_week: number
  status: ProposalStatus
  created_at: string
}

export interface ParticipantRow {
  conversation_id: string
  profile_id: string
}

export interface MessageRow {
  id: string
  conversation_id: string
  sender_id: string
  body: string
  created_at: string
}

export interface AlertRow {
  id: string
  profile_id: string
  kind: 'compliance' | 'proposal' | 'match' | 'contract'
  title: string
  body: string
  read_at: string | null
  created_at: string
}
