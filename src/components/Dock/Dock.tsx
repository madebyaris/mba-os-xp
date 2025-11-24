import clsx from 'clsx'
import { useMemo } from 'react'

import { useApps } from '@/context/AppContext'
import { useTheme } from '@/context/ThemeContext'
import { useWindows } from '@/context/WindowContext'

import styles from './Dock.module.css'

interface RunningAppInfo {
  count: number
  windowId: string
  minimized: boolean
  lastActiveAt: number
}

const Dock = () => {
  const { apps, launchApp } = useApps()
  const { dockVisible } = useTheme()
  const {
    windows,
    minimizeAll,
    restoreAll,
    focusWindow,
    restoreWindow,
  } = useWindows()

  const runningApps = useMemo(() => {
    const map = new Map<string, RunningAppInfo>()
    windows.forEach((window) => {
      const existing = map.get(window.appId)
      if (existing) {
        existing.count += 1
        if (window.lastActiveAt > existing.lastActiveAt) {
          map.set(window.appId, {
            count: existing.count,
            windowId: window.id,
            minimized: window.isMinimized,
            lastActiveAt: window.lastActiveAt,
          })
        }
      } else {
        map.set(window.appId, {
          count: 1,
          windowId: window.id,
          minimized: window.isMinimized,
          lastActiveAt: window.lastActiveAt,
        })
      }
    })
    return map
  }, [windows])

  const handleAppClick = (appId: string) => {
    const info = runningApps.get(appId)
    if (!info) {
      launchApp(appId)
      return
    }
    if (info.minimized) {
      restoreWindow(info.windowId)
    } else {
      focusWindow(info.windowId)
    }
  }

  return (
    <div className={clsx(styles.dockWrapper, { [styles.hidden]: !dockVisible })}>
      <div className={styles.dock}>
        <button type="button" className={styles.dockAction} onClick={minimizeAll} aria-label="Minimize all windows">
          🧼
          <span>Minimize All</span>
        </button>
        <div className={styles.dockIcons}>
          {apps.map((app) => {
            const info = runningApps.get(app.id) as
              | { count: number; windowId: string; minimized: boolean; lastActiveAt: number }
              | undefined
            return (
              <button
                key={app.id}
                type="button"
                className={clsx(styles.dockIcon, { [styles.active]: info })}
                onClick={() => handleAppClick(app.id)}
                aria-label={`Launch ${app.title}`}
              >
                <span className={styles.iconGlyph}>{app.icon}</span>
                <span className={styles.iconLabel}>{app.title}</span>
                {info && <span className={clsx(styles.indicator, { [styles.minimized]: info.minimized })} />}
              </button>
            )
          })}
        </div>
        <button type="button" className={styles.dockAction} onClick={restoreAll} aria-label="Restore all windows">
          🪟
          <span>Show All</span>
        </button>
      </div>
    </div>
  )
}

export default Dock

