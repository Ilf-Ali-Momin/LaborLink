import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { content, type Content, type Lang } from '../content'
import { appContent, type AppContent } from '../content-app'

interface I18nValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: Content
  ta: AppContent
}

const I18nContext = createContext<I18nValue | null>(null)

const STORAGE_KEY = 'laborlink.lang'

function initialLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'en' || stored === 'de') return stored
  } catch {
    /* storage unavailable (private mode); fall through to default */
  }
  return navigator.language.toLowerCase().startsWith('de') ? 'de' : 'en'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(initialLang)

  useEffect(() => {
    document.documentElement.lang = lang
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      /* non fatal */
    }
  }, [lang])

  return (
    <I18nContext.Provider
      value={{ lang, setLang, t: content[lang], ta: appContent[lang] }}
    >
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider')
  return ctx
}
