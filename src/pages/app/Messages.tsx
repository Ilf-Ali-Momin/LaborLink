import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { ArrowLeft, Send } from 'lucide-react'
import { useI18n } from '../../lib/i18n'
import { useStore } from '../../lib/store'
import { isSupabaseConfigured } from '../../lib/supabase'
import {
  fetchConversations,
  sendMessageDb,
  type UiMessage,
} from '../../lib/api'
import { useAsyncData } from '../../lib/use-async'
import { conversations as seedConversations } from '../../data/messages'

function initials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

interface ChatConversation {
  id: string
  name: string
  subtitle: string
  messages: UiMessage[]
}

export function Messages() {
  const { ta, lang } = useI18n()
  const { sentMessages, sendMessage } = useStore()
  const live = isSupabaseConfigured

  const [activeId, setActiveId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  // Live mode optimistic sends, appended after the DB insert succeeds.
  const [localSent, setLocalSent] = useState<Record<string, UiMessage[]>>({})
  const threadScrollRef = useRef<HTMLDivElement>(null)

  const liveData = useAsyncData(
    () => (live ? fetchConversations() : Promise.resolve(null)),
    [],
  )

  const chats: ChatConversation[] = useMemo(() => {
    if (live) {
      return (liveData.data ?? []).map((c) => ({
        id: c.id,
        name: c.name,
        subtitle:
          c.otherRole === 'employer'
            ? ta.profile.roleEmployer
            : c.otherRole === 'student'
              ? ta.profile.roleStudent
              : '',
        messages: [...c.messages, ...(localSent[c.id] ?? [])],
      }))
    }
    return seedConversations.map((conversation) => {
      const seeded: UiMessage[] = conversation.messages.map((m) => ({
        fromMe: m.fromMe,
        text: m.text[lang],
        time: m.time,
      }))
      const sent: UiMessage[] = sentMessages
        .filter((m) => m.conversationId === conversation.id)
        .map((m) => ({
          fromMe: true,
          text: m.text,
          time: new Date(m.date).toLocaleTimeString(
            lang === 'de' ? 'de-DE' : 'en-GB',
            { hour: '2-digit', minute: '2-digit' },
          ),
        }))
      return {
        id: conversation.id,
        name: conversation.name,
        subtitle: conversation.subtitle[lang],
        messages: [...seeded, ...sent],
      }
    })
  }, [live, liveData.data, localSent, sentMessages, lang, ta])

  const active = chats.find((c) => c.id === activeId) ?? null
  const thread = active?.messages ?? []

  // Keep the newest message in view when a thread opens or grows.
  useEffect(() => {
    const el = threadScrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [activeId, thread.length])

  const onSend = async (e: FormEvent) => {
    e.preventDefault()
    if (!active || !draft.trim() || busy) return
    const text = draft.trim()

    if (!live) {
      sendMessage(active.id, text)
      setDraft('')
      return
    }

    setBusy(true)
    try {
      await sendMessageDb(active.id, text)
      const now = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
      setLocalSent((prev) => ({
        ...prev,
        [active.id]: [
          ...(prev[active.id] ?? []),
          { fromMe: true, text, time: now },
        ],
      }))
      setDraft('')
    } catch {
      /* insert failed (e.g. offline): keep the draft so nothing is lost */
    } finally {
      setBusy(false)
    }
  }

  const list =
    chats.length === 0 ? (
      <p className="glass rounded-card p-8 text-center text-sm text-ink-muted">
        {ta.messages.emptyList}
      </p>
    ) : (
      <ul className="space-y-2">
        {chats.map((conversation) => {
          const last = conversation.messages.at(-1)
          return (
            <li key={conversation.id}>
              <button
                type="button"
                onClick={() => setActiveId(conversation.id)}
                aria-pressed={activeId === conversation.id}
                className={`w-full rounded-card border p-4 text-left transition hover:shadow-card ${
                  activeId === conversation.id
                    ? 'bg-primary-soft/60 ring-1 ring-primary/40'
                    : 'bg-surface'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white"
                  >
                    {initials(conversation.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold leading-tight">
                      {conversation.name}
                    </p>
                    <p className="truncate text-xs text-ink-muted">
                      {conversation.subtitle}
                    </p>
                  </div>
                </div>
                <p className="mt-2.5 truncate text-sm text-ink-muted">
                  {last?.text ?? ta.messages.emptyThread}
                </p>
              </button>
            </li>
          )
        })}
      </ul>
    )

  const threadPane = active && (
    <div className="glass flex h-[540px] flex-col rounded-card shadow-card">
      <div className="flex items-center gap-3 border-b p-4">
        <button
          type="button"
          onClick={() => setActiveId(null)}
          aria-label={ta.common.back}
          className="flex h-8 w-8 items-center justify-center rounded-full text-ink-muted transition hover:bg-primary-soft hover:text-primary md:hidden"
        >
          <ArrowLeft size={16} aria-hidden="true" />
        </button>
        <span
          aria-hidden="true"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-white"
        >
          {initials(active.name)}
        </span>
        <div>
          <p className="font-semibold leading-tight">{active.name}</p>
          <p className="text-xs text-ink-muted">{active.subtitle}</p>
        </div>
      </div>

      <div ref={threadScrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {thread.length === 0 && (
          <p className="pt-10 text-center text-sm text-ink-muted">
            {ta.messages.emptyThread}
          </p>
        )}
        {thread.map((message, i) => (
          <div
            key={i}
            className={`flex ${message.fromMe ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] min-w-0 break-words rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                message.fromMe
                  ? 'rounded-br-md bg-primary text-white'
                  : 'rounded-bl-md border bg-surface'
              }`}
            >
              <p>{message.text}</p>
              <p
                className={`mt-1 text-[10px] ${
                  message.fromMe ? 'text-white/70' : 'text-ink-muted'
                }`}
              >
                {message.time}
              </p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={onSend} className="flex items-center gap-2 border-t p-3">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={ta.messages.inputPlaceholder}
          aria-label={ta.messages.inputPlaceholder}
          className="w-full rounded-full border bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted/60"
        />
        <button
          type="submit"
          disabled={busy}
          className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white transition enabled:hover:bg-primary-deep disabled:cursor-wait disabled:opacity-60"
        >
          <Send size={14} aria-hidden="true" />
          <span className="hidden sm:inline">{ta.messages.send}</span>
          <span className="sr-only sm:hidden">{ta.messages.send}</span>
        </button>
      </form>
    </div>
  )

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">{ta.messages.title}</h1>
      <p className="mt-1.5 text-sm text-ink-muted">{ta.messages.sub}</p>

      {live && liveData.loading ? (
        <p className="mt-10 text-center text-sm text-ink-muted">
          {ta.common.loading}…
        </p>
      ) : (
        <div className="mt-6 md:grid md:grid-cols-[280px_minmax(0,1fr)] md:gap-4">
          <div className={`min-w-0 ${active ? 'hidden md:block' : ''}`}>{list}</div>
          <div className={`min-w-0 ${active ? '' : 'hidden md:block'}`}>
            {threadPane ?? (
              <div className="glass hidden h-[540px] items-center justify-center rounded-card text-sm text-ink-muted md:flex">
                {ta.messages.sub}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
