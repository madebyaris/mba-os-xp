import { Home, RefreshCw, Search, Star, StopCircle, Undo2, Redo2 } from 'lucide-react'
import { useMemo, useState } from 'react'

import { useLocalStorage } from '@/hooks/useLocalStorage'
import type { AppWindowProps } from '@/types/apps'

import styles from './Browser.module.css'

interface Bookmark {
  id: string
  title: string
  url: string
}

const HOME_PAGE = 'https://www.wikipedia.org'

const BrowserApp = (_props: AppWindowProps) => {
  const [history, setHistory] = useState<string[]>([HOME_PAGE])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [address, setAddress] = useState(HOME_PAGE)
  const [isLoading, setIsLoading] = useState(false)
  const [bookmarks, setBookmarks] = useLocalStorage<Bookmark[]>('mba-bookmarks', [])

  const currentUrl = history[historyIndex]

  const canGoBack = historyIndex > 0
  const canGoForward = historyIndex < history.length - 1

  const normalizedBookmarks = useMemo(
    () =>
      bookmarks.map((bookmark) => ({
        ...bookmark,
        hostname: safeHostname(bookmark.url),
      })),
    [bookmarks],
  )

  const navigateTo = (url: string, replace = false) => {
    setIsLoading(true)
    if (replace) {
      setHistory((prev) => {
        const copy = [...prev]
        copy[historyIndex] = url
        return copy
      })
    } else {
      const nextHistory = history.slice(0, historyIndex + 1)
      nextHistory.push(url)
      setHistory(nextHistory)
      setHistoryIndex(nextHistory.length - 1)
    }
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const normalized = normalizeInput(address)
    if (!normalized) return
    navigateTo(normalized)
  }

  const addBookmark = () => {
    if (!currentUrl) return
    const title = safeHostname(currentUrl) || 'Bookmark'
    setBookmarks((prev) => [...prev, { id: crypto.randomUUID(), title, url: currentUrl }])
  }

  const removeBookmark = (id: string) => {
    setBookmarks((prev) => prev.filter((bookmark) => bookmark.id !== id))
  }

  return (
    <div className={styles.container}>
      <header className={styles.toolbar}>
        <div className={styles.navButtons}>
          <button type="button" aria-label="Go back" onClick={() => canGoBack && setHistoryIndex((prev) => prev - 1)} disabled={!canGoBack}>
            <Undo2 size={16} />
          </button>
          <button type="button" aria-label="Go forward" onClick={() => canGoForward && setHistoryIndex((prev) => prev + 1)} disabled={!canGoForward}>
            <Redo2 size={16} />
          </button>
          <button type="button" aria-label="Refresh" onClick={() => navigateTo(currentUrl, true)}>
            <RefreshCw size={16} />
          </button>
          <button type="button" aria-label="Home" onClick={() => setHistory([HOME_PAGE])}>
            <Home size={16} />
          </button>
          <button type="button" aria-label="Stop loading" onClick={() => setIsLoading(false)}>
            <StopCircle size={16} />
          </button>
        </div>
        <form className={styles.addressGroup} onSubmit={handleSubmit}>
          <Search size={16} />
          <input
            className={styles.addressBar}
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="Enter URL or search term"
          />
          <button type="submit" className={styles.goButton}>
            Go
          </button>
        </form>
        <button type="button" className={styles.bookmarkButton} onClick={addBookmark}>
          <Star size={16} /> Save
        </button>
      </header>
      <section className={styles.browserContent}>
        <iframe
          key={currentUrl}
          src={currentUrl}
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          className={styles.browserPane}
          onLoad={() => setIsLoading(false)}
          title="browser"
        />
        <aside className={styles.bookmarksPane}>
          <h4>Bookmarks</h4>
          {normalizedBookmarks.length === 0 && <p>No bookmarks yet.</p>}
          <ul>
            {normalizedBookmarks.map((bookmark) => (
              <li key={bookmark.id}>
                <button
                  type="button"
                  onClick={() => {
                    setAddress(bookmark.url)
                    navigateTo(bookmark.url)
                  }}
                >
                  {bookmark.title}
                  <small>{bookmark.hostname}</small>
                </button>
                <button type="button" className={styles.bookmarkRemove} aria-label="Remove bookmark" onClick={() => removeBookmark(bookmark.id)}>
                  ×
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </section>
      {isLoading && <div className={styles.loadingBar} />}
    </div>
  )
}

export const normalizeInput = (value: string) => {
  if (!value.trim()) return null
  const trimmed = value.trim()
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed
  if (trimmed.includes('.') && !trimmed.includes(' ')) {
    return `https://${trimmed}`
  }
  const encoded = encodeURIComponent(trimmed)
  return `https://duckduckgo.com/?q=${encoded}`
}

export const safeHostname = (value: string) => {
  try {
    return new URL(value).hostname
  } catch {
    return value
  }
}

export default BrowserApp

