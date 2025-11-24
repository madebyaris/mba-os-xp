import type { ComponentType } from 'react'
import type { WindowSize } from './window'

export interface AppWindowProps {
  windowId: string
  payload?: Record<string, unknown>
}

export interface AppDefinition {
  id: string
  title: string
  icon: string
  category: 'system' | 'productivity' | 'media' | 'web'
  description: string
  defaultSize: WindowSize
  minSize: WindowSize
  resizable: boolean
  component: () => Promise<{ default: ComponentType<AppWindowProps> }>
}

