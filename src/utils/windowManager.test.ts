import { describe, expect, it } from 'vitest'

import { cascadePosition, getNextZIndex, createWindowInstance } from './windowManager'

describe('windowManager helpers', () => {
  it('cascades window coordinates', () => {
    expect(cascadePosition(0)).toEqual({ x: 40, y: 60 })
    expect(cascadePosition(3)).toEqual({ x: 100, y: 120 })
  })

  it('calculates next z-index based on windows', () => {
    const windows = [
      createWindowInstance('notes', 'Notes'),
      createWindowInstance('calendar', 'Calendar', { zIndex: 150 }),
    ]
    expect(getNextZIndex(windows)).toBeGreaterThan(150)
  })
})

