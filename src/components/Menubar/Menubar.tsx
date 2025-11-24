import { useEffect, useMemo, useRef, useState } from 'react'

import { useApps } from '@/context/AppContext'
import { useTheme } from '@/context/ThemeContext'
import { useWindows } from '@/context/WindowContext'
import type { WindowInstance } from '@/types/window'

import styles from './Menubar.module.css'

type MenuId = 'file' | 'edit' | 'view' | 'window' | 'help'

interface MenuItem {
  label: string
  onSelect?: () => void
  disabled?: boolean
}

interface MenuConfig {
  id: MenuId
  label: string
  items: MenuItem[]
}

const Menubar = () => {
  const {
    windows,
    activeWindowId,
    closeWindow,
    openWindow,
    restoreWindow,
    focusWindow,
  } = useWindows()
  const { launchApp } = useApps()
  const { dockVisible, toggleDock } = useTheme()

  const [openMenu, setOpenMenu] = useState<MenuId | null>(null)
  const [showWindowPalette, setShowWindowPalette] = useState(false)
  const [clock, setClock] = useState(() => new Date())
  const menubarRef = useRef<HTMLDivElement>(null)

  const activeWindow = windows.find((window) => window.id === activeWindowId)

  useEffect(() => {
    const interval = window.setInterval(() => setClock(new Date()), 30_000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (!menubarRef.current?.contains(event.target as Node)) {
        setOpenMenu(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const formatTime = (date: Date) =>
    Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(date)

  const emitAppCommand = (command: 'copy' | 'paste') => {
    if (!activeWindowId) return
    window.dispatchEvent(
      new CustomEvent('mba:app-command', {
        detail: {
          windowId: activeWindowId,
          command,
        },
      }),
    )
  }

  const handleNewWindow = () => {
    if (activeWindow?.appId) {
      launchApp(activeWindow.appId)
      return
    }
    launchApp('notes')
  }

  const closeAllWindows = () => {
    const ids = windows.map((window) => window.id)
    ids.forEach((id) => closeWindow(id))
  }

  const windowMenuItems = useMemo(() => windows.slice().sort((a, b) => b.zIndex - a.zIndex), [windows])

  const menus: MenuConfig[] = [
    {
      id: 'file',
      label: 'File',
      items: [
        { label: 'New Window', onSelect: handleNewWindow },
        {
          label: 'Close Window',
          onSelect: () => activeWindow && closeWindow(activeWindow.id),
          disabled: !activeWindow,
        },
        {
          label: 'Exit MBA OS',
          onSelect: closeAllWindows,
        },
      ],
    },
    {
      id: 'edit',
      label: 'Edit',
      items: [
        { label: 'Copy', onSelect: () => emitAppCommand('copy'), disabled: !activeWindow },
        { label: 'Paste', onSelect: () => emitAppCommand('paste'), disabled: !activeWindow },
      ],
    },
    {
      id: 'view',
      label: 'View',
      items: [
        { label: dockVisible ? 'Hide Dock' : 'Show Dock', onSelect: toggleDock },
        {
          label: 'Change Wallpaper',
          onSelect: () =>
            openWindow({
              appId: 'welcome',
              title: 'Wallpapers',
              size: { width: 420, height: 320 },
              payload: { purpose: 'wallpaper' },
            }),
        },
      ],
    },
    {
      id: 'window',
      label: 'Window',
      items: [
        {
          label: 'List Windows',
          onSelect: () => setShowWindowPalette((prev) => !prev),
        },
      ],
    },
    {
      id: 'help',
      label: 'Help',
      items: [
        {
          label: 'About MBA OS',
          onSelect: () =>
            openWindow({
              appId: 'welcome',
              title: 'About MBA OS',
              size: { width: 420, height: 280 },
              payload: { purpose: 'about' },
            }),
        },
        {
          label: 'Documentation',
          onSelect: () => window.open('https://madebyaris.com', '_blank'),
        },
      ],
    },
  ]

  const handleMenuToggle = (menuId: MenuId) => {
    setOpenMenu((current) => (current === menuId ? null : menuId))
  }

  const handleWindowPaletteSelect = (window: WindowInstance) => {
    if (window.isMinimized) {
      restoreWindow(window.id)
    } else {
      focusWindow(window.id)
    }
    setShowWindowPalette(false)
  }

  return (
    <>
      <div className={styles.menubar} ref={menubarRef}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>🪟</span>
          <span>MBA OS</span>
        </div>
        <nav className={styles.menuGroup}>
          {menus.map((menu) => (
            <div key={menu.id} className={styles.menu}>
              <button
                type="button"
                className={styles.menuButton}
                onClick={() => handleMenuToggle(menu.id)}
                aria-expanded={openMenu === menu.id}
              >
                {menu.label}
              </button>
              {openMenu === menu.id && (
                <div className={styles.menuDropdown} role="menu">
                  {menu.items.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      role="menuitem"
                      className={styles.menuItem}
                      disabled={item.disabled}
                      onClick={() => {
                        item.onSelect?.()
                        setOpenMenu(null)
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className={styles.statusArea}>
          <span>{activeWindow?.title ?? 'Ready'}</span>
          <span className={styles.clock}>{formatTime(clock)}</span>
        </div>
      </div>
      {showWindowPalette && (
        <div className={styles.windowPalette}>
          <header>
            <span>Open Windows</span>
            <button type="button" onClick={() => setShowWindowPalette(false)}>
              ✕
            </button>
          </header>
          <ul>
            {windowMenuItems.map((window) => (
              <li key={window.id}>
                <button type="button" onClick={() => handleWindowPaletteSelect(window)}>
                  <span>{window.title}</span>
                  <small>{window.isMinimized ? 'Minimized' : window.isFocused ? 'Active' : 'Idle'}</small>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}

export default Menubar

