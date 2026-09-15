import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Theme = 'light' | 'dark'
const KEY = 'risiq-theme'

function initial(): Theme {
  if (typeof window === 'undefined') return 'light'
  const saved = localStorage.getItem(KEY) as Theme | null
  if (saved === 'light' || saved === 'dark') return saved
  return 'light' // brand default; dark is an explicit choice via this toggle
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(initial)

  useEffect(() => {
    const root = document.documentElement
    const apply = () => {
      root.classList.toggle('dark', theme === 'dark')
      root.style.colorScheme = theme
    }
    // cross-fade every colour for the duration of the switch, then drop the transitions
    root.classList.add('theme-anim')
    const doc = document as Document & { startViewTransition?: (cb: () => void) => void }
    if (doc.startViewTransition) doc.startViewTransition(apply); else apply()
    const t = window.setTimeout(() => root.classList.remove('theme-anim'), 600)
    try { localStorage.setItem(KEY, theme) } catch { /* private mode */ }
    return () => clearTimeout(t)
  }, [theme])

  return (
    <Button variant="ghost" size="icon" aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      {theme === 'dark' ? <Sun /> : <Moon />}
    </Button>
  )
}
