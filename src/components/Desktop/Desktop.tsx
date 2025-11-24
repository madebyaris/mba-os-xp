import {
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  type ComponentType,
  type LazyExoticComponent,
} from 'react'

import Dock from '@/components/Dock/Dock'
import Menubar from '@/components/Menubar/Menubar'
import Window from '@/components/Window/Window'
import { useApps } from '@/context/AppContext'
import { useTheme } from '@/context/ThemeContext'
import { useWindows } from '@/context/WindowContext'
import { useElementSize } from '@/hooks/useElementSize'
import type { WindowInstance } from '@/types/window'

import styles from './Desktop.module.css'

const Desktop = () => {
  const {
    windows,
    activeWindowId,
    openWindow,
    focusWindow,
    closeWindow,
    minimizeWindow,
    updateWindowPosition,
    updateWindowSize,
    toggleMaximize,
    clearActiveWindow,
  } = useWindows()
  const { getAppById, launchApp } = useApps()
  const { wallpaper, setWallpaper, wallpaperOptions } = useTheme()
  const shortcuts = useMemo(
    () => [
      { id: 'notes', label: 'Notes', icon: '📝' },
      { id: 'todo', label: 'Tasks', icon: '✅' },
      { id: 'calendar', label: 'Calendar', icon: '📅' },
    ],
    [],
  )

  const { ref: desktopRef, size: desktopSize } = useElementSize<HTMLDivElement>()
  const componentCache = useRef<Record<string, LazyExoticComponent<ComponentType<any>>>>({})
  const welcomeWindowInitialized = useRef(false)

  useEffect(() => {
    if (welcomeWindowInitialized.current) {
      return undefined
    }

    welcomeWindowInitialized.current = true

    const timeoutId = window.setTimeout(() => {
      openWindow({
        appId: 'welcome',
        title: 'Welcome Center',
        size: { width: 480, height: 360 },
        minSize: { width: 380, height: 280 },
        isResizable: true,
        payload: {
          message: 'Select an application from the dock or menu bar to begin.',
        },
      })
    }, 100)

    return () => window.clearTimeout(timeoutId)
  }, [openWindow])

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (event.altKey && event.key === 'F4') {
        if (activeWindowId) {
          closeWindow(activeWindowId)
        }
        event.preventDefault()
      }
      if (event.ctrlKey && event.altKey && !event.shiftKey) {
        if (event.key.toLowerCase() === 'n') {
          launchApp('notes')
          event.preventDefault()
        }
        if (event.key.toLowerCase() === 'c') {
          launchApp('calculator')
          event.preventDefault()
        }
        if (event.key.toLowerCase() === 'b') {
          launchApp('browser')
          event.preventDefault()
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [activeWindowId, closeWindow, launchApp])

  const getAppComponent = (appId: string) => {
    if (!componentCache.current[appId]) {
      const definition = getAppById(appId)
      if (!definition) return null
      componentCache.current[appId] = lazy(definition.component)
    }
    return componentCache.current[appId]
  }

  const renderWindowContent = (window: WindowInstance) => {
    if (window.appId === 'welcome') {
      const payload = window.payload as { purpose?: 'about' | 'wallpaper'; message?: string } | undefined
      if (payload?.purpose === 'about') {
        return (
          <div className={styles.welcomePane}>
            <h2>About MBA OS</h2>
            <p>
              MBA OS recreates the charm of Windows XP with a modern macOS-style layout.
              Applications are lazy-loaded to keep the experience snappy.
            </p>
            <p>Version 1.0.0 — Crafted by aris</p>
          </div>
        )
      }

      if (payload?.purpose === 'wallpaper') {
        return (
          <div className={styles.welcomePane}>
            <h2>Wallpaper Settings</h2>
            <div className={styles.wallpaperOptions}>
              {wallpaperOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={styles.wallpaperOption}
                  aria-pressed={wallpaper === option}
                  onClick={() => setWallpaper(option)}
                >
                  <span className={styles.wallpaperSwatch} data-wallpaper={option} />
                  <span>{option}</span>
                </button>
              ))}
            </div>
          </div>
        )
      }

      return (
        <div className={styles.welcomePane}>
          <h2>MBA OS</h2>
          <p>Applications will appear here once launched.</p>
          <ul>
            <li>Use the dock to launch applications</li>
            <li>Drag windows by the blue title bar</li>
            <li>Use the menu bar for system-wide controls</li>
          </ul>
        </div>
      )
    }

    const LazyComponent = getAppComponent(window.appId)
    if (!LazyComponent) {
      return (
        <div className={styles.placeholderPane}>
          <span>{window.title}</span>
          <p>Application content unavailable.</p>
        </div>
      )
    }

    return (
      <Suspense
        fallback={
          <div className={styles.placeholderPane}>
            <p>Loading {window.title}…</p>
          </div>
        }
      >
        <LazyComponent windowId={window.id} payload={window.payload} />
      </Suspense>
    )
  }

  const handleMaximizeToggle = (id: string) => {
    toggleMaximize(id, desktopSize)
  }

  return (
    <div className={styles.desktop} ref={desktopRef}>
      <Menubar />
      <div
        className={styles.wallpaper}
        data-wallpaper={wallpaper}
        onMouseDown={clearActiveWindow}
        role="presentation"
      />
      <div className={styles.windowsLayer}>
        <div className={styles.shortcutGrid}>
          {shortcuts.map((shortcut) => (
            <button
              key={shortcut.id}
              type="button"
              className={styles.shortcut}
              onDoubleClick={() => launchApp(shortcut.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  launchApp(shortcut.id)
                }
              }}
              aria-label={`Open ${shortcut.label}`}
            >
              <span className={styles.shortcutIcon}>{shortcut.icon}</span>
              <span className={styles.shortcutLabel}>{shortcut.label}</span>
            </button>
          ))}
        </div>
        <div className={styles.windowsContainer}>
          {windows.map((window) => (
            <Window
              key={window.id}
              window={window}
              onFocus={focusWindow}
              onClose={closeWindow}
              onMinimize={minimizeWindow}
              onMaximizeToggle={handleMaximizeToggle}
              onPositionChange={updateWindowPosition}
              onSizeChange={updateWindowSize}
            >
              {window.isMinimized ? null : renderWindowContent(window)}
            </Window>
          ))}
        </div>
      </div>
      <Dock />
    </div>
  )
}

export default Desktop

