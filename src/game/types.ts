export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export type Problem = {
  id: string
  difficulty: Difficulty
  tag: string
  channel: string
  senderName: string
  senderRole: string
  incoming: string
  reply: string
  reading: string
}

export type KeyStat = { hits: number; misses: number }
export type StatMap = Record<string, KeyStat>

export type PlayResult = {
  anonId: string
  difficulty: Difficulty
  durationSec: number
  salary: number
  completedCount: number
  kpm: number | null
  accuracy: number | null
  missCount: number
  maxCombo: number
  keyStats: StatMap
  fingerStats: StatMap
  bigramStats: StatMap
}

export type AggregatedRow = {
  label: string
  hits: number
  misses: number
  rate: number
}

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  beginner: '初級',
  intermediate: '中級',
  advanced: '上級',
}

export const BASE_PAY: Record<Difficulty, number> = {
  beginner: 1_200_000,
  intermediate: 2_200_000,
  advanced: 3_500_000,
}

export const BASE_KPM = 180
