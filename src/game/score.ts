import { BASE_KPM, BASE_PAY, type Difficulty } from './types.ts'

function clamp(min: number, max: number, value: number): number {
  return Math.min(max, Math.max(min, value))
}

export function speedFactor(requiredKeys: number, elapsedSec: number): number {
  const seconds = Math.max(elapsedSec, 0.1)
  const kpm = (requiredKeys / seconds) * 60
  const ratio = kpm / BASE_KPM
  return clamp(0.6, 1.5, 0.6 + ratio * 0.6)
}

export function accuracyFactor(misses: number, requiredKeys: number): number {
  if (requiredKeys <= 0) return 0.5
  return Math.max(0.5, 1 - misses / requiredKeys)
}

export function messagePay(
  difficulty: Difficulty,
  requiredKeys: number,
  elapsedSec: number,
  misses: number,
): number {
  const pay =
    BASE_PAY[difficulty] *
    speedFactor(requiredKeys, elapsedSec) *
    accuracyFactor(misses, requiredKeys)
  return Math.floor(pay)
}

export function playKpm(totalKeys: number, totalSec: number): number | null {
  if (totalKeys <= 0 || totalSec <= 0) return null
  return Math.round((totalKeys / totalSec) * 60 * 10) / 10
}

export function playAccuracy(misses: number, requiredKeys: number): number | null {
  if (requiredKeys + misses <= 0) return null
  return Math.round((1 - misses / (requiredKeys + misses)) * 1000) / 10
}
