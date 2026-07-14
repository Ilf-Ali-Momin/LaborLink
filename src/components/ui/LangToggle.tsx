import { useI18n } from '../../lib/i18n'
import type { Lang } from '../../content'

const langs: Lang[] = ['de', 'en']

/** DE / EN segmented pill, shared by Nav and Footer. */
export function LangToggle() {
  const { lang, setLang, t } = useI18n()

  return (
    <div
      role="group"
      aria-label={t.nav.langSwitch}
      className="flex items-center rounded-full border bg-surface/60 p-0.5"
    >
      {langs.map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={lang === l}
          onClick={() => setLang(l)}
          className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase transition ${
            lang === l
              ? 'bg-primary text-white'
              : 'text-ink-muted hover:text-ink'
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  )
}
