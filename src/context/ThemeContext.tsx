import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

import { useLocalStorage } from '@/hooks/useLocalStorage'

interface ThemePreferences {
  dockVisible: boolean
  wallpaper: string
}

const wallpaperOptions = ['bliss', 'aurora', 'sunset']

interface ThemeContextValue extends ThemePreferences {
  toggleDock: () => void
  setWallpaper: (wallpaper: string) => void
  wallpaperOptions: string[]
}

const defaultPreferences: ThemePreferences = {
  dockVisible: true,
  wallpaper: 'bliss',
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [preferences, setPreferences] = useLocalStorage<ThemePreferences>(
    'mba-os-theme',
    defaultPreferences,
  )
  const [, setForceUpdate] = useState(0)

  const value = useMemo<ThemeContextValue>(
    () => ({
      ...preferences,
      wallpaperOptions,
      toggleDock: () =>
        setPreferences((prev) => ({
          ...prev,
          dockVisible: !prev.dockVisible,
        })),
      setWallpaper: (wallpaper: string) =>
        setPreferences((prev) => ({
          ...prev,
          wallpaper,
        })),
    }),
    [preferences, setPreferences],
  )

  // Force re-render when preferences change outside React (e.g., storage event)
  useEffect(() => {
    const handler = (event: StorageEvent) => {
      if (event.key === 'mba-os-theme') {
        setForceUpdate((count) => count + 1)
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

