import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../lib/theme'
import { useI18n } from '../../lib/i18n'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const { t } = useI18n()
  const label = theme === 'light' ? t.nav.themeDark : t.nav.themeLight

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition hover:bg-primary-soft hover:text-primary"
    >
      {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
      <span className="sr-only">{label}</span>
    </button>
  )
}
