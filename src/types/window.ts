export interface WindowPosition {
  x: number
  y: number
}

export interface WindowSize {
  width: number
  height: number
}

export interface WindowInstance {
  id: string
  appId: string
  title: string
  position: WindowPosition
  size: WindowSize
  minSize: WindowSize
  previousPosition?: WindowPosition
  previousSize?: WindowSize
  zIndex: number
  isFocused: boolean
  isMinimized: boolean
  isMaximized: boolean
  isResizable: boolean
  createdAt: number
  lastActiveAt: number
  payload?: Record<string, unknown>
}

export type WindowIntent = 'focus' | 'close' | 'minimize' | 'maximize' | 'restore'

export interface WindowEvent {
  windowId: string
  intent: WindowIntent
}

