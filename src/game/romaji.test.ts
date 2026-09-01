import { describe, expect, it } from 'vitest'
import { canonicalRomaji, createRomajiSession } from './romaji.ts'

function typeAll(reading: string, keys: string) {
  const session = createRomajiSession(reading)
  let misses = 0
  for (const key of keys) {
    const hit = session.input(key)
    if (!hit.ok) misses += 1
  }
  return { done: session.done, misses, typed: session.typed }
}

describe('canonicalRomaji', () => {
  it('maps basic words', () => {
    expect(canonicalRomaji('かくにんします.')).toBe('kakuninsimasu.')
  })
})

describe('romaji session', () => {
  it('accepts shi and si', () => {
    expect(typeAll('し', 'si').done).toBe(true)
    expect(typeAll('し', 'shi').done).toBe(true)
  })

  it('accepts tsu and tu', () => {
    expect(typeAll('つ', 'tu').done).toBe(true)
    expect(typeAll('つ', 'tsu').done).toBe(true)
  })

  it('does not advance on a wrong key', () => {
    const session = createRomajiSession('あ')
    expect(session.input('b').ok).toBe(false)
    expect(session.done).toBe(false)
    expect(session.input('a').ok).toBe(true)
    expect(session.done).toBe(true)
  })

  it('handles sokuon', () => {
    expect(typeAll('がっこう', 'gakkou').done).toBe(true)
  })

  it('handles n before a consonant', () => {
    expect(typeAll('かんたん', 'kantan').done).toBe(true)
  })

  it('requires nn before a vowel', () => {
    const na = typeAll('んあ', 'na')
    expect(na.done).toBe(false)
    expect(typeAll('んあ', 'nna').done).toBe(true)
    expect(typeAll('んあ', "n'a").done).toBe(true)
  })

  it('types symbols as displayed', () => {
    expect(typeAll('@tanaka #482', '@tanaka #482').done).toBe(true)
  })
})
