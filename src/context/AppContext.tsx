import { createContext, useCallback, useContext, type ReactNode } from 'react'

import type { AppDefinition } from '@/types/apps'
import type { WindowInstance, WindowSize } from '@/types/window'
import { cascadePosition } from '@/utils/windowManager'
import { useWindows } from './WindowContext'

interface LaunchOptions {
  title?: string
  size?: WindowSize
  minSize?: WindowSize
  isResizable?: boolean
  payload?: Record<string, unknown>
}

interface AppContextValue {
  apps: AppDefinition[]
  getAppById: (id: string) => AppDefinition | undefined
  launchApp: (id: string, options?: LaunchOptions) => WindowInstance | null
}

const appRegistry: AppDefinition[] = [
  {
    id: 'calculator',
    title: 'Calculator',
    icon: '🧮',
    category: 'productivity',
    description: 'Perform quick calculations with memory support.',
    defaultSize: { width: 320, height: 420 },
    minSize: { width: 280, height: 360 },
    resizable: false,
    component: () => import('@/components/apps/Calculator'),
  },
  {
    id: 'notes',
    title: 'Notes',
    icon: '📝',
    category: 'productivity',
    description: 'Write, organize, and export notes.',
    defaultSize: { width: 640, height: 480 },
    minSize: { width: 420, height: 320 },
    resizable: true,
    component: () => import('@/components/apps/Notes'),
  },
  {
    id: 'calendar',
    title: 'Calendar',
    icon: '📅',
    category: 'productivity',
    description: 'View months at a glance and manage events.',
    defaultSize: { width: 620, height: 480 },
    minSize: { width: 480, height: 360 },
    resizable: true,
    component: () => import('@/components/apps/Calendar'),
  },
  {
    id: 'todo',
    title: 'Tasks + Pomodoro',
    icon: '⏱️',
    category: 'productivity',
    description: 'Manage tasks and run pomodoro sessions.',
    defaultSize: { width: 780, height: 520 },
    minSize: { width: 620, height: 420 },
    resizable: true,
    component: () => import('@/components/apps/TodoPomodoro'),
  },
  {
    id: 'music',
    title: 'Winamp Player',
    icon: '🎵',
    category: 'media',
    description: 'Play music with playlists and visualizers.',
    defaultSize: { width: 520, height: 420 },
    minSize: { width: 420, height: 320 },
    resizable: true,
    component: () => import('@/components/apps/MusicPlayer'),
  },
  {
    id: 'browser',
    title: 'Web Browser',
    icon: '🌐',
    category: 'web',
    description: 'Lightweight in-app web browser.',
    defaultSize: { width: 900, height: 560 },
    minSize: { width: 640, height: 420 },
    resizable: true,
    component: () => import('@/components/apps/Browser'),
  },
]

const AppContext = createContext<AppContextValue | undefined>(undefined)

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { openWindow, windows, focusWindow } = useWindows()

  const launchApp = useCallback(
    (id: string, options?: LaunchOptions) => {
      const app = appRegistry.find((definition) => definition.id === id)
      if (!app) return null

      // Check if a window for this app already exists
      const existingWindow = windows.find((w) => w.appId === id && !w.isMinimized)
      if (existingWindow) {
        // Focus existing window instead of creating a new one
        focusWindow(existingWindow.id)
        return existingWindow
      }

      // Create new window with fresh position (cascade)
      return openWindow({
        appId: app.id,
        title: options?.title ?? app.title,
        size: options?.size ?? app.defaultSize,
        minSize: options?.minSize ?? app.minSize,
        isResizable: options?.isResizable ?? app.resizable,
        payload: options?.payload,
        position: cascadePosition(windows.length), // Always use fresh cascade position
      })
    },
    [openWindow, windows, focusWindow],
  )

  const value: AppContextValue = {
    apps: appRegistry,
    getAppById: (id: string) => appRegistry.find((app) => app.id === id),
    launchApp,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApps = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApps must be used within an AppProvider')
  }
  return context
}

