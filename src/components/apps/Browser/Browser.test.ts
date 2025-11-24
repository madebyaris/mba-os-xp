import { describe, expect, it } from 'vitest'

import { normalizeInput, safeHostname } from './Browser'

describe('Browser helpers', () => {
  it('normalizes plain domains to https URLs', () => {
    expect(normalizeInput('example.com')).toBe('https://example.com')
  })

  it('creates search URLs for phrases', () => {
    expect(normalizeInput('hello world')).toBe('https://duckduckgo.com/?q=hello%20world')
  })

  it('leaves existing URLs untouched', () => {
    expect(normalizeInput('https://github.com')).toBe('https://github.com')
  })

  it('extracts hostnames safely', () => {
    expect(safeHostname('https://openai.com/research')).toBe('openai.com')
    expect(safeHostname('not a url')).toBe('not a url')
  })
})

