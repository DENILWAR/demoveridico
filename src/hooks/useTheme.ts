import { useState, useEffect } from 'react'

export type Theme = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'veridico-theme'

function applyTheme(theme: Theme) {
  const root = document.documentElement
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const shouldBeDark = theme === 'dark' || (theme === 'system' && prefersDark)
  root.classList.toggle('dark', shouldBeDark)
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem(STORAGE_KEY) as Theme) || 'light'
  )

  // Apply on mount and whenever theme changes
  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  // Re-apply when OS preference changes (only relevant in 'system' mode)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => { if (theme === 'system') applyTheme('system') }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  const setTheme = (t: Theme) => {
    localStorage.setItem(STORAGE_KEY, t)
    setThemeState(t)
  }

  return { theme, setTheme }
}
