import { sb } from './supabase'
import type {
  AlertRow,
  JobRow,
  MessageRow,
  ParticipantRow,
  ProfileRow,
  ProposalRow,
  ProposalStatus,
} from './db-types'
import type { Role } from './auth'
import { jobs as demoJobs, type JobType } from '../data/jobs'
import type { Lang } from '../content'

/*
 * Data access for live (Supabase) mode. Every query goes through the
 * anon client and is therefore filtered by Row Level Security — there is
 * no privileged path in the frontend. Pages consume the Ui* shapes so
 * demo mode and live mode render identically.
 */

export interface UiJob {
  id: string
  title: string
  employer: string
  city: string
  payEUR: number
  hoursPerWeek: string
  type: JobType
  postedDaysAgo: number
  blurb: string
  tasks: string[]
  verified: boolean
  ownerId: string | null
}

export interface UiProposal {
  id: string
  jobId: string
  jobTitle: string
  employer: string
  city: string
  message: string
  hoursPerWeek: string
  status: ProposalStatus
  date: string
}

export interface UiApplicant {
  proposalId: string
  profileId: string
  name: string
  jobId: string
  jobTitle: string
  message: string
  hoursPerWeek: number
  status: ProposalStatus
  date: string
}

export interface UiConversation {
  id: string
  otherProfileId: string
  name: string
  otherRole: Role | null
  messages: UiMessage[]
}

export interface UiMessage {
  fromMe: boolean
  text: string
  time: string
}

export interface UiAlert {
  id: string
  kind: AlertRow['kind']
  title: string
  body: string
  time: string
  unread: boolean
}

/** Demo mode: map the bundled bilingual jobs into the same UI shape. */
export function demoJobsToUi(lang: Lang): UiJob[] {
  return demoJobs.map((job) => ({
    id: job.id,
    title: job.title[lang],
    employer: job.employer,
    city: job.city,
    payEUR: job.payEUR,
    hoursPerWeek: job.hoursPerWeek,
    type: job.type,
    postedDaysAgo: job.postedDaysAgo,
    blurb: job.blurb[lang],
    tasks: job.tasks[lang],
    verified: true,
    ownerId: null,
  }))
}

async function requireUid(): Promise<string> {
  const { data, error } = await sb().auth.getUser()
  if (error || !data.user) throw new Error('Not authenticated')
  return data.user.id
}

function daysSince(iso: string): number {
  const ms = Date.now() - new Date(iso).getTime()
  return Math.max(0, Math.floor(ms / 86_400_000))
}

function timeOf(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function jobToUi(row: JobRow): UiJob {
  return {
    id: row.id,
    title: row.title,
    employer: row.employer_name,
    city: row.city,
    payEUR: Number(row.pay_eur),
    hoursPerWeek: row.hours_per_week,
    type: row.job_type,
    postedDaysAgo: daysSince(row.created_at),
    blurb: row.description,
    tasks: row.tasks ?? [],
    verified: row.verified,
    ownerId: row.owner_id,
  }
}

// ---------------------------------------------------------------- jobs

export async function fetchJobs(): Promise<UiJob[]> {
  const { data, error } = await sb()
    .from('jobs')
    .select('*')
    .eq('status', 'live')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data as JobRow[]).map(jobToUi)
}

export async function fetchJob(id: string): Promise<UiJob | null> {
  const { data, error } = await sb()
    .from('jobs')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data ? jobToUi(data as JobRow) : null
}

export async function fetchMyJobs(): Promise<UiJob[]> {
  const uid = await requireUid()
  const { data, error } = await sb()
    .from('jobs')
    .select('*')
    .eq('owner_id', uid)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data as JobRow[]).map(jobToUi)
}

export async function createJob(input: {
  title: string
  employerName: string
  city: string
  payEUR: number
  hoursPerWeek: string
  type: JobType
  description: string
}): Promise<void> {
  const uid = await requireUid()
  const { error } = await sb().from('jobs').insert({
    owner_id: uid,
    title: input.title,
    employer_name: input.employerName,
    city: input.city,
    pay_eur: input.payEUR,
    hours_per_week: input.hoursPerWeek,
    job_type: input.type,
    description: input.description,
  })
  if (error) throw new Error(error.message)
}

// ----------------------------------------------------------- proposals

export async function fetchMyProposals(): Promise<UiProposal[]> {
  const uid = await requireUid()
  const { data, error } = await sb()
    .from('proposals')
    .select('*, job:jobs(id, title, employer_name, city)')
    .eq('student_id', uid)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  type Row = ProposalRow & {
    job: Pick<JobRow, 'id' | 'title' | 'employer_name' | 'city'> | null
  }
  return (data as Row[]).map((row) => ({
    id: row.id,
    jobId: row.job_id,
    jobTitle: row.job?.title ?? '',
    employer: row.job?.employer_name ?? '',
    city: row.job?.city ?? '',
    message: row.message,
    hoursPerWeek: String(row.hours_per_week),
    status: row.status,
    date: row.created_at,
  }))
}

export async function hasProposalFor(jobId: string): Promise<boolean> {
  const uid = await requireUid()
  const { data, error } = await sb()
    .from('proposals')
    .select('id')
    .eq('job_id', jobId)
    .eq('student_id', uid)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data !== null
}

export async function createProposal(
  jobId: string,
  message: string,
  hoursPerWeek: number,
): Promise<void> {
  const uid = await requireUid()
  const { error } = await sb().from('proposals').insert({
    job_id: jobId,
    student_id: uid,
    message,
    hours_per_week: hoursPerWeek,
  })
  if (error) throw new Error(error.message)
}

/** Proposals received on jobs the caller owns (employer view). */
export async function fetchApplicants(): Promise<UiApplicant[]> {
  const uid = await requireUid()
  const { data, error } = await sb()
    .from('proposals')
    .select(
      '*, job:jobs(id, title, owner_id), student:profiles(id, name)',
    )
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  type Row = ProposalRow & {
    job: Pick<JobRow, 'id' | 'title' | 'owner_id'> | null
    student: Pick<ProfileRow, 'id' | 'name'> | null
  }
  return (data as Row[])
    .filter((row) => row.job?.owner_id === uid)
    .map((row) => ({
      proposalId: row.id,
      profileId: row.student_id,
      name: row.student?.name ?? 'Student',
      jobId: row.job_id,
      jobTitle: row.job?.title ?? '',
      message: row.message,
      hoursPerWeek: row.hours_per_week,
      status: row.status,
      date: row.created_at,
    }))
}

export async function decideProposal(
  proposalId: string,
  status: 'accepted' | 'declined',
): Promise<void> {
  const { error } = await sb()
    .from('proposals')
    .update({ status })
    .eq('id', proposalId)
  if (error) throw new Error(error.message)
}

// ------------------------------------------------------------ messages

export async function fetchConversations(): Promise<UiConversation[]> {
  const uid = await requireUid()

  const { data: parts, error: partsError } = await sb()
    .from('conversation_participants')
    .select('conversation_id, profile_id')
  if (partsError) throw new Error(partsError.message)

  const byConv = new Map<string, string[]>()
  for (const row of parts as ParticipantRow[]) {
    const list = byConv.get(row.conversation_id) ?? []
    list.push(row.profile_id)
    byConv.set(row.conversation_id, list)
  }

  const convIds: string[] = []
  const otherByConv = new Map<string, string>()
  for (const [convId, members] of byConv) {
    if (!members.includes(uid)) continue
    const other = members.find((m) => m !== uid)
    if (!other) continue
    convIds.push(convId)
    otherByConv.set(convId, other)
  }
  if (convIds.length === 0) return []

  const otherIds = [...new Set(otherByConv.values())]
  const [{ data: profiles, error: profilesError }, { data: msgs, error: msgsError }] =
    await Promise.all([
      sb().from('profiles').select('id, name, role').in('id', otherIds),
      sb()
        .from('messages')
        .select('*')
        .in('conversation_id', convIds)
        .order('created_at', { ascending: true }),
    ])
  if (profilesError) throw new Error(profilesError.message)
  if (msgsError) throw new Error(msgsError.message)

  const profileById = new Map(
    (profiles as ProfileRow[]).map((p) => [p.id, p]),
  )
  const messagesByConv = new Map<string, UiMessage[]>()
  for (const row of msgs as MessageRow[]) {
    const list = messagesByConv.get(row.conversation_id) ?? []
    list.push({
      fromMe: row.sender_id === uid,
      text: row.body,
      time: timeOf(row.created_at),
    })
    messagesByConv.set(row.conversation_id, list)
  }

  return convIds.map((convId) => {
    const otherId = otherByConv.get(convId) as string
    const profile = profileById.get(otherId)
    return {
      id: convId,
      otherProfileId: otherId,
      name: profile?.name ?? 'User',
      otherRole: profile?.role ?? null,
      messages: messagesByConv.get(convId) ?? [],
    }
  })
}

export async function sendMessageDb(
  conversationId: string,
  body: string,
): Promise<void> {
  const uid = await requireUid()
  const { error } = await sb().from('messages').insert({
    conversation_id: conversationId,
    sender_id: uid,
    body,
  })
  if (error) throw new Error(error.message)
}

/** Returns the conversation id (existing or newly created). */
export async function startConversation(otherProfileId: string): Promise<string> {
  const { data, error } = await sb().rpc('start_conversation', {
    other_profile: otherProfileId,
  })
  if (error) throw new Error(error.message)
  return data as string
}

// -------------------------------------------------------------- alerts

export async function fetchAlerts(): Promise<UiAlert[]> {
  const { data, error } = await sb()
    .from('alerts')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data as AlertRow[]).map((row) => ({
    id: row.id,
    kind: row.kind,
    title: row.title,
    body: row.body,
    time: new Date(row.created_at).toLocaleDateString([], {
      day: 'numeric',
      month: 'short',
    }),
    unread: row.read_at === null,
  }))
}

export async function markAlertsReadDb(): Promise<void> {
  const uid = await requireUid()
  const { error } = await sb()
    .from('alerts')
    .update({ read_at: new Date().toISOString() })
    .eq('profile_id', uid)
    .is('read_at', null)
  if (error) throw new Error(error.message)
}

export async function countUnreadAlerts(): Promise<number> {
  const { count, error } = await sb()
    .from('alerts')
    .select('id', { count: 'exact', head: true })
    .is('read_at', null)
  if (error) throw new Error(error.message)
  return count ?? 0
}

// ----------------------------------------------------- profile / GDPR

export async function fetchMyCounts(): Promise<{
  proposals: number
  jobs: number
}> {
  const uid = await requireUid()
  const [proposals, jobs] = await Promise.all([
    sb()
      .from('proposals')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', uid),
    sb()
      .from('jobs')
      .select('id', { count: 'exact', head: true })
      .eq('owner_id', uid),
  ])
  if (proposals.error) throw new Error(proposals.error.message)
  if (jobs.error) throw new Error(jobs.error.message)
  return { proposals: proposals.count ?? 0, jobs: jobs.count ?? 0 }
}

/** Everything the backend stores about the caller, for GDPR export. */
export async function exportMyData(): Promise<Record<string, unknown>> {
  const [proposals, jobs, conversations, alerts] = await Promise.all([
    fetchMyProposals(),
    fetchMyJobs(),
    fetchConversations(),
    fetchAlerts(),
  ])
  return { proposals, jobs, conversations, alerts }
}

/** Calls the delete_my_data() RPC; the session itself survives. */
export async function deleteMyDataDb(): Promise<void> {
  const { error } = await sb().rpc('delete_my_data')
  if (error) throw new Error(error.message)
}
