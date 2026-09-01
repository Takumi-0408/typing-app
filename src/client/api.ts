import type { Difficulty, PlayResult, Problem } from '../game/types.ts'

export type StatsResponse = {
  playCount: number
  bestSalary: number
  keys: { label: string; hits: number; misses: number; rate: number }[]
  fingers: { label: string; hits: number; misses: number; rate: number }[]
  bigrams: { label: string; hits: number; misses: number; rate: number }[]
}

export async function fetchProblems(difficulty: Difficulty): Promise<Problem[]> {
  const res = await fetch(`/api/problems?difficulty=${difficulty}`)
  if (!res.ok) throw new Error('problems')
  return res.json()
}

export async function savePlay(result: PlayResult): Promise<void> {
  await fetch('/api/plays', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result),
  })
}

export async function fetchStats(anonId: string): Promise<StatsResponse> {
  const res = await fetch(`/api/stats?anonId=${anonId}`)
  if (!res.ok) throw new Error('stats')
  return res.json()
}
