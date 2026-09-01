import { Hono } from 'hono'
import { PROBLEMS } from '../data/problems.ts'
import { mergeStats, rankStats } from '../game/fingers.ts'
import type { Difficulty, PlayResult, StatMap } from '../game/types.ts'

type Env = { DB: D1Database }

const app = new Hono<{ Bindings: Env }>()
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const DIFFICULTIES = new Set<Difficulty>(['beginner', 'intermediate', 'advanced'])

function isAnonId(value: unknown): value is string {
  return typeof value === 'string' && UUID.test(value)
}

function parseStats(raw: string): StatMap {
  try {
    const value = JSON.parse(raw) as StatMap
    return value && typeof value === 'object' ? value : {}
  } catch {
    return {}
  }
}

app.get('/api/problems', async (c) => {
  const difficulty = c.req.query('difficulty')
  if (!difficulty || !DIFFICULTIES.has(difficulty as Difficulty)) {
    return c.json({ error: 'invalid difficulty' }, 400)
  }
  const rows = await c.env.DB.prepare(
    'SELECT id, difficulty, tag, channel, sender_name AS senderName, sender_role AS senderRole, incoming, reply, reading FROM problems WHERE difficulty = ?',
  )
    .bind(difficulty)
    .all()
  const problems = rows.results ?? []
  if (problems.length === 0) {
    return c.json(PROBLEMS.filter((item) => item.difficulty === difficulty))
  }
  return c.json(problems)
})

app.post('/api/plays', async (c) => {
  const body = (await c.req.json()) as PlayResult
  if (!isAnonId(body.anonId)) return c.json({ error: 'invalid anonId' }, 400)
  if (!DIFFICULTIES.has(body.difficulty)) return c.json({ error: 'invalid difficulty' }, 400)
  if (typeof body.salary !== 'number' || typeof body.missCount !== 'number') {
    return c.json({ error: 'invalid result' }, 400)
  }
  const id = crypto.randomUUID()
  await c.env.DB.prepare(
    `INSERT INTO plays (id, anon_id, difficulty, duration_sec, salary, completed_count, kpm, accuracy, miss_count, max_combo, key_stats, finger_stats, bigram_stats, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      id,
      body.anonId,
      body.difficulty,
      body.durationSec,
      body.salary,
      body.completedCount,
      body.kpm,
      body.accuracy,
      body.missCount,
      body.maxCombo,
      JSON.stringify(body.keyStats ?? {}),
      JSON.stringify(body.fingerStats ?? {}),
      JSON.stringify(body.bigramStats ?? {}),
      new Date().toISOString(),
    )
    .run()
  return c.json({ id })
})

app.get('/api/stats', async (c) => {
  const anonId = c.req.query('anonId')
  if (!isAnonId(anonId)) return c.json({ error: 'invalid anonId' }, 400)
  const rows = await c.env.DB.prepare(
    'SELECT salary, key_stats, finger_stats, bigram_stats FROM plays WHERE anon_id = ?',
  )
    .bind(anonId)
    .all<{ salary: number; key_stats: string; finger_stats: string; bigram_stats: string }>()
  const plays = rows.results ?? []
  const bestSalary = plays.reduce((max, row) => Math.max(max, row.salary), 0)
  return c.json({
    playCount: plays.length,
    bestSalary,
    keys: rankStats(mergeStats(plays.map((row) => parseStats(row.key_stats))), 10).slice(0, 8),
    fingers: rankStats(mergeStats(plays.map((row) => parseStats(row.finger_stats))), 1).slice(0, 8),
    bigrams: rankStats(mergeStats(plays.map((row) => parseStats(row.bigram_stats))), 8).slice(0, 8),
  })
})

export default app
