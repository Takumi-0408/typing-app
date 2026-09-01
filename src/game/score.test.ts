import { describe, expect, it } from 'vitest'
import { accuracyFactor, messagePay, playAccuracy, playKpm, speedFactor } from './score.ts'

describe('score', () => {
  it('clamps speed around the baseline', () => {
    expect(speedFactor(180, 60)).toBeCloseTo(1.2, 5)
    expect(speedFactor(1, 10_000)).toBeCloseTo(0.6, 3)
    expect(speedFactor(1000, 1)).toBe(1.5)
  })

  it('keeps accuracy at least 0.5', () => {
    expect(accuracyFactor(0, 10)).toBe(1)
    expect(accuracyFactor(100, 10)).toBe(0.5)
  })

  it('returns integer yen', () => {
    const pay = messagePay('beginner', 40, 12, 1)
    expect(Number.isInteger(pay)).toBe(true)
    expect(pay).toBeGreaterThan(0)
  })

  it('returns null kpm when nothing was completed', () => {
    expect(playKpm(0, 0)).toBeNull()
    expect(playAccuracy(0, 0)).toBeNull()
    expect(playAccuracy(3, 0)).toBe(0)
  })
})
