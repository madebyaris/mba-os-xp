import type { WindowInstance, WindowPosition, WindowSize } from '@/types/window'

const BASE_Z_INDEX = 100
const CASCADE_OFFSET = 32

export const createWindowInstance = (
  appId: string,
  title: string,
  options: Partial<Omit<WindowInstance, 'id' | 'appId' | 'title'>> = {},
): WindowInstance => {
  const now = Date.now()
  return {
    id: crypto.randomUUID(),
    appId,
    title,
    position: options.position ?? { x: CASCADE_OFFSET, y: CASCADE_OFFSET },
    size: options.size ?? { width: 640, height: 420 },
    minSize: options.minSize ?? { width: 360, height: 260 },
    previousPosition: options.previousPosition,
    previousSize: options.previousSize,
    zIndex: options.zIndex ?? BASE_Z_INDEX,
    isFocused: options.isFocused ?? false,
    isMinimized: options.isMinimized ?? false,
    isMaximized: options.isMaximized ?? false,
    isResizable: options.isResizable ?? true,
    createdAt: now,
    lastActiveAt: now,
    payload: options.payload,
  }
}

export const getNextZIndex = (windows: WindowInstance[]): number => {
  if (!windows.length) return BASE_Z_INDEX
  return Math.max(...windows.map((w) => w.zIndex)) + 1
}

export const cascadePosition = (count: number): WindowPosition => {
  const offset = (count % 10) * 20
  return {
    x: 40 + offset,
    y: 60 + offset,
  }
}

export const clampToViewport = (
  position: WindowPosition,
  size: WindowSize,
  viewport: WindowSize,
): WindowPosition => {
  const x = Math.min(Math.max(position.x, 0), Math.max(viewport.width - size.width, 0))
  const y = Math.min(Math.max(position.y, 0), Math.max(viewport.height - size.height, 0))
  return { x, y }
}

