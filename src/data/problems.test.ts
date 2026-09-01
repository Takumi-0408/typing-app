import { describe, expect, it } from 'vitest'
import { PROBLEMS } from './problems.ts'

describe('problems', () => {
  it('has at least 12 items per difficulty', () => {
    for (const difficulty of ['beginner', 'intermediate', 'advanced'] as const) {
      expect(
        PROBLEMS.filter((item) => item.difficulty === difficulty).length,
      ).toBeGreaterThanOrEqual(12)
    }
  })

  it('avoids url-like load', () => {
    for (const item of PROBLEMS) {
      expect(item.reply.includes('https://')).toBe(false)
      expect(item.reading.length).toBeGreaterThan(0)
    }
  })
})
