import { Download, Edit2, Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { useLocalStorage } from '@/hooks/useLocalStorage'
import type { AppWindowProps } from '@/types/apps'

import styles from './Notes.module.css'

interface Note {
  id: string
  title: string
  content: string
  updatedAt: number
}

const createNote = (title = 'New Note', content = ''): Note => ({
  id: crypto.randomUUID(),
  title,
  content,
  updatedAt: Date.now(),
})

const defaultNote = createNote('Welcome Note', 'This is your first note. Feel free to edit or create a new one!')

const NotesApp = (_props: AppWindowProps) => {
  const [notes, setNotes] = useLocalStorage<Note[]>('mba-notes', [defaultNote])
  const [activeId, setActiveId] = useState(() => notes[0]?.id ?? defaultNote.id)
  const activeNote = notes.find((note) => note.id === activeId) ?? notes[0] ?? defaultNote
  const [contentDraft, setContentDraft] = useState(activeNote?.content ?? '')
  const [titleDraft, setTitleDraft] = useState(activeNote?.title ?? '')
  const [renamingId, setRenamingId] = useState<string | null>(null)

  useEffect(() => {
    if (!notes.length) {
      const seed = createNote()
      setNotes([seed])
      setActiveId(seed.id)
      return
    }
    setContentDraft(activeNote.content)
    setTitleDraft(activeNote.title)
  }, [activeNote, notes.length, setNotes])

  useEffect(() => {
    const handler = setTimeout(() => {
      setNotes((prev) =>
        prev.map((note) =>
          note.id === activeId ? { ...note, content: contentDraft, updatedAt: Date.now() } : note,
        ),
      )
    }, 350)
    return () => clearTimeout(handler)
  }, [activeId, contentDraft, setNotes])

  const stats = useMemo(() => {
    const chars = contentDraft.length
    const words = contentDraft.trim() ? contentDraft.trim().split(/\s+/).length : 0
    return { chars, words }
  }, [contentDraft])

  const handleCreateNote = () => {
    const newNote = createNote()
    setNotes((prev) => [newNote, ...prev])
    setActiveId(newNote.id)
  }

  const handleDeleteNote = (id: string) => {
    if (notes.length === 1) {
      const seed = createNote()
      setNotes([seed])
      setActiveId(seed.id)
      return
    }
    setNotes((prev) => prev.filter((note) => note.id !== id))
    if (activeId === id) {
      const next = notes.find((note) => note.id !== id)
      if (next) setActiveId(next.id)
    }
  }

  const handleRename = (id: string, title: string) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, title, updatedAt: Date.now() } : note)),
    )
    if (id === activeId) {
      setTitleDraft(title)
    }
  }

  const exportNote = () => {
    const blob = new Blob([activeNote.content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${activeNote.title || 'note'}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className={styles.wrapper}>
      <aside className={styles.sidebar}>
        <button type="button" className={styles.newNote} onClick={handleCreateNote}>
          <Plus size={16} /> New Note
        </button>
        <ul className={styles.noteList}>
          {notes.map((note) => (
            <li
              key={note.id}
              className={note.id === activeId ? styles.noteItemActive : styles.noteItem}
            >
              <button type="button" className={styles.noteSelection} onClick={() => setActiveId(note.id)}>
                <span className={styles.noteTitle}>{note.title}</span>
                <span className={styles.noteMeta}>
                  {new Date(note.updatedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </button>
              <div className={styles.noteActions}>
                <button
                  type="button"
                  onClick={() => {
                    setRenamingId(note.id)
                    setActiveId(note.id)
                    setTitleDraft(note.title)
                  }}
                >
                  <Edit2 size={14} />
                </button>
                <button type="button" onClick={() => handleDeleteNote(note.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
              {renamingId === note.id && (
                <div className={styles.renameModal}>
                  <input
                    value={titleDraft}
                    onChange={(event) => setTitleDraft(event.target.value)}
                    autoFocus
                  />
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        handleRename(note.id, titleDraft || 'Untitled')
                        setRenamingId(null)
                      }}
                    >
                      Save
                    </button>
                    <button type="button" onClick={() => setRenamingId(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </aside>
      <section className={styles.editor}>
        <header className={styles.editorHeader}>
          <input
            className={styles.titleInput}
            value={titleDraft}
            onChange={(event) => handleRename(activeId, event.target.value)}
          />
          <div className={styles.headerActions}>
            <span>
              {stats.words} words • {stats.chars} chars
            </span>
            <button type="button" onClick={exportNote}>
              <Download size={16} /> Export
            </button>
          </div>
        </header>
        <textarea
          className={styles.textarea}
          value={contentDraft}
          onChange={(event) => setContentDraft(event.target.value)}
        />
      </section>
    </div>
  )
}

export default NotesApp

