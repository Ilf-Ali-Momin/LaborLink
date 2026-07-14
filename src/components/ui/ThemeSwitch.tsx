import { Moon, Sun } from 'lucide-react'
import { useTheme, type Theme } from '../../lib/theme'
import { useI18n } from '../../lib/i18n'

/** Light / Dark segmented pill, same pattern as LangToggle. */
export function ThemeSwitch() {
  const { theme, setTheme } = useTheme()
  const { ta } = useI18n()

  const options: { value: Theme; label: string; icon: typeof Sun }[] = [
    { value: 'light', label: ta.profile.themeLight, icon: Sun },
    { value: 'dark', label: ta.profile.themeDark, icon: Moon },
  ]

  return (
    <div
      role="group"
      aria-label={ta.profile.theme}
      className="flex items-center rounded-full border bg-surface/60 p-0.5"
    >
      {options.map((option) => {
        const Icon = option.icon
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={theme === option.value}
            onClick={() => setTheme(option.value)}
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold transition ${
              theme === option.value
                ? 'bg-primary text-white'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <Icon size={12} aria-hidden="true" />
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
