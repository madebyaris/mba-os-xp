import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'

import type { WindowInstance, WindowPosition, WindowSize } from '@/types/window'
import { cascadePosition, createWindowInstance, getNextZIndex } from '@/utils/windowManager'
import { playSound } from '@/utils/sounds'

const BASE_Z_INDEX = 100

interface WindowState {
  windows: WindowInstance[]
  activeWindowId: string | null
}

const initialState: WindowState = {
  windows: [],
  activeWindowId: null,
}

interface CreateWindowOptions {
  appId: string
  title: string
  size?: WindowSize
  minSize?: WindowSize
  position?: WindowPosition
  isResizable?: boolean
  payload?: Record<string, unknown>
}

type WindowAction =
  | { type: 'OPEN'; instance: WindowInstance }
  | { type: 'CLOSE'; id: string }
  | { type: 'FOCUS'; id: string }
  | { type: 'CLEAR_ACTIVE' }
  | { type: 'MINIMIZE'; id: string }
  | { type: 'RESTORE'; id: string }
  | { type: 'MINIMIZE_ALL' }
  | { type: 'RESTORE_ALL' }
  | { type: 'POSITION'; id: string; position: WindowPosition }
  | { type: 'SIZE'; id: string; size: WindowSize; position?: WindowPosition }
  | { type: 'MAXIMIZE'; id: string; viewport?: WindowSize }
  | { type: 'TOGGLE_MAXIMIZE'; id: string; viewport?: WindowSize }

const windowReducer = (state: WindowState, action: WindowAction): WindowState => {
  switch (action.type) {
    case 'OPEN': {
      const windows = state.windows
        .map((w) => ({ ...w, isFocused: false }))
        .concat({
          ...action.instance,
          isFocused: true,
          isMinimized: false,
          lastActiveAt: Date.now(),
        })

      return {
        windows,
        activeWindowId: action.instance.id,
      }
    }
    case 'CLOSE': {
      const windows = state.windows.filter((w) => w.id !== action.id)
      const activeWindow = windows.length ? windows[windows.length - 1].id : null
      return {
        windows: windows.map((w, index) => ({
          ...w,
          zIndex: BASE_Z_INDEX + index,
          isFocused: w.id === activeWindow,
        })),
        activeWindowId: activeWindow,
      }
    }
    case 'FOCUS': {
      const windows = state.windows.map((w) => {
        if (w.id === action.id) {
          return {
            ...w,
            isFocused: true,
            isMinimized: false,
            zIndex: getNextZIndex(state.windows),
            lastActiveAt: Date.now(),
          }
        }
        return { ...w, isFocused: false }
      })

      return {
        windows,
        activeWindowId: action.id,
      }
    }
    case 'CLEAR_ACTIVE': {
      return {
        windows: state.windows.map((w) => ({
          ...w,
          isFocused: false,
        })),
        activeWindowId: null,
      }
    }
    case 'MINIMIZE': {
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.id
            ? {
                ...w,
                isMinimized: true,
                isFocused: false,
              }
            : w,
        ),
        activeWindowId: state.activeWindowId === action.id ? null : state.activeWindowId,
      }
    }
    case 'RESTORE': {
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.id
            ? {
                ...w,
                isMinimized: false,
                isFocused: true,
                zIndex: getNextZIndex(state.windows),
              }
            : { ...w, isFocused: false },
        ),
        activeWindowId: action.id,
      }
    }
    case 'MINIMIZE_ALL': {
      return {
        windows: state.windows.map((w) => ({
          ...w,
          isMinimized: true,
          isFocused: false,
        })),
        activeWindowId: null,
      }
    }
    case 'RESTORE_ALL': {
      if (!state.windows.length) {
        return state
      }

      const lastWindowId = state.windows[state.windows.length - 1].id
      return {
        windows: state.windows.map((w, index) => ({
          ...w,
          isMinimized: false,
          isFocused: w.id === lastWindowId,
          zIndex: BASE_Z_INDEX + index,
        })),
        activeWindowId: lastWindowId,
      }
    }
    case 'POSITION': {
      // Ensure minimum spacing from menu bar (8px)
      const MIN_TOP_OFFSET = 8
      const constrainedPosition = {
        ...action.position,
        y: Math.max(MIN_TOP_OFFSET, action.position.y),
      }
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.id
            ? {
                ...w,
                position: constrainedPosition,
                lastActiveAt: Date.now(),
              }
            : w,
        ),
      }
    }
    case 'SIZE': {
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.id
            ? {
                ...w,
                size: action.size,
                position: action.position ?? w.position,
                lastActiveAt: Date.now(),
              }
            : w,
        ),
      }
    }
    case 'MAXIMIZE':
    case 'TOGGLE_MAXIMIZE': {
      const defaultViewport = {
        width: typeof window !== 'undefined' ? window.innerWidth : 1280,
        height: typeof window !== 'undefined' ? window.innerHeight : 720,
      }
      return {
        ...state,
        windows: state.windows.map((w) => {
          if (w.id !== action.id) {
            return w
          }
          const viewport = action.viewport ?? defaultViewport
          if (!w.isMaximized) {
            return {
              ...w,
              isMaximized: true,
              previousPosition: w.position,
              previousSize: w.size,
              position: { x: 0, y: 0 },
              size: viewport,
              isFocused: true,
            }
          }
          return {
            ...w,
            isMaximized: false,
            position: w.previousPosition ?? w.position,
            size: w.previousSize ?? w.size,
            previousPosition: undefined,
            previousSize: undefined,
            isFocused: true,
          }
        }),
        activeWindowId: action.id,
      }
    }
    default:
      return state
  }
}

interface WindowContextValue extends WindowState {
  openWindow: (options: CreateWindowOptions) => WindowInstance
  closeWindow: (id: string) => void
  focusWindow: (id: string) => void
  clearActiveWindow: () => void
  minimizeWindow: (id: string) => void
  restoreWindow: (id: string) => void
  minimizeAll: () => void
  restoreAll: () => void
  updateWindowPosition: (id: string, position: WindowPosition) => void
  updateWindowSize: (id: string, size: WindowSize, position?: WindowPosition) => void
  toggleMaximize: (id: string, viewport?: WindowSize) => void
}

const WindowContext = createContext<WindowContextValue | undefined>(undefined)

export const WindowProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(windowReducer, initialState)

  const openWindow = useCallback(
    (options: CreateWindowOptions) => {
      const size = options.size ?? { width: 640, height: 420 }
      const position = options.position ?? cascadePosition(state.windows.length)
      const instance = createWindowInstance(options.appId, options.title, {
        ...options,
        size,
        position,
        zIndex: getNextZIndex(state.windows),
      })

      dispatch({ type: 'OPEN', instance })
      playSound('open')

      return instance
    },
    [state.windows],
  )

  const value = useMemo<WindowContextValue>(
    () => ({
      ...state,
      openWindow,
      closeWindow: (id: string) => {
        dispatch({ type: 'CLOSE', id })
        playSound('close')
      },
      focusWindow: (id: string) => dispatch({ type: 'FOCUS', id }),
      clearActiveWindow: () => dispatch({ type: 'CLEAR_ACTIVE' }),
      minimizeWindow: (id: string) => dispatch({ type: 'MINIMIZE', id }),
      restoreWindow: (id: string) => dispatch({ type: 'RESTORE', id }),
      minimizeAll: () => dispatch({ type: 'MINIMIZE_ALL' }),
      restoreAll: () => dispatch({ type: 'RESTORE_ALL' }),
      updateWindowPosition: (id: string, position: WindowPosition) =>
        dispatch({ type: 'POSITION', id, position }),
      updateWindowSize: (id: string, size: WindowSize, position?: WindowPosition) =>
        dispatch({ type: 'SIZE', id, size, position }),
      toggleMaximize: (id: string, viewport?: WindowSize) =>
        dispatch({ type: 'TOGGLE_MAXIMIZE', id, viewport }),
    }),
    [state, openWindow],
  )

  return <WindowContext.Provider value={value}>{children}</WindowContext.Provider>
}

export const useWindows = () => {
  const context = useContext(WindowContext)
  if (!context) {
    throw new Error('useWindows must be used within WindowProvider')
  }
  return context
}

