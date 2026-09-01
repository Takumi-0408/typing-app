import { useEffect, useMemo, useRef, useState } from 'react'
import { addStat, fingerForKey } from '../game/fingers.ts'
import { createRomajiSession, isTypingKey } from '../game/romaji.ts'
import { messagePay, playAccuracy, playKpm } from '../game/score.ts'
import type { Difficulty, PlayResult, Problem, StatMap } from '../game/types.ts'
import { DIFFICULTY_LABEL } from '../game/types.ts'
import { getAnonId } from './anon.ts'
import { fetchProblems, fetchStats, savePlay, type StatsResponse } from './api.ts'

type Screen = 'home' | 'play' | 'result' | 'stats'
type Duration = 30 | 60 | 120

type ThreadItem = {
  incoming: string
  senderName: string
  senderRole: string
  reply?: string
  gain?: number
}

function yen(value: number): string {
  return `${value.toLocaleString('ja-JP')} 円`
}

function shuffle<T>(items: T[]): T[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

export function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate')
  const [duration, setDuration] = useState<Duration>(60)
  const [problems, setProblems] = useState<Problem[]>([])
  const [index, setIndex] = useState(0)
  const [typed, setTyped] = useState('')
  const [remainingRoma, setRemainingRoma] = useState('')
  const [salary, setSalary] = useState(0)
  const [leftMs, setLeftMs] = useState(0)
  const [thread, setThread] = useState<ThreadItem[]>([])
  const [result, setResult] = useState<PlayResult | null>(null)
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [bestSalary, setBestSalary] = useState(0)
  const [error, setError] = useState('')

  const problem = problems[index]
  const session = useMemo(() => (problem ? createRomajiSession(problem.reading) : null), [problem])

  useEffect(() => {
    if (!session) return
    setTyped('')
    setRemainingRoma(session.remainingRomaji)
  }, [session])

  useEffect(() => {
    fetchStats(getAnonId())
      .then((data) => setBestSalary(data.bestSalary))
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    if (screen !== 'play') return
    const started = Date.now()
    const timer = window.setInterval(() => {
      const left = duration * 1000 - (Date.now() - started)
      setLeftMs(Math.max(0, left))
      if (left <= 0) window.clearInterval(timer)
    }, 100)
    return () => window.clearInterval(timer)
  }, [screen, duration])

  useEffect(() => {
    if (screen === 'play' && leftMs === 0 && problems.length > 0) {
      void finishPlay()
    }
  }, [leftMs, screen, problems.length])

  const playState = useRef({
    completed: 0,
    misses: 0,
    messageMisses: 0,
    combo: 0,
    maxCombo: 0,
    keys: 0,
    seconds: 0,
    keyStats: {} as StatMap,
    fingerStats: {} as StatMap,
    bigramStats: {} as StatMap,
    prevKey: '',
    startedAt: 0,
    finished: false,
  })

  async function startPlay() {
    setError('')
    const list = shuffle(await fetchProblems(difficulty))
    if (list.length === 0) {
      setError('問題がまだありません。just db-seed を実行してください。')
      return
    }
    playState.current = {
      completed: 0,
      misses: 0,
      messageMisses: 0,
      combo: 0,
      maxCombo: 0,
      keys: 0,
      seconds: 0,
      keyStats: {},
      fingerStats: {},
      bigramStats: {},
      prevKey: '',
      startedAt: Date.now(),
      finished: false,
    }
    setProblems(list)
    setIndex(0)
    setSalary(0)
    setLeftMs(duration * 1000)
    setThread([
      {
        incoming: list[0].incoming,
        senderName: list[0].senderName,
        senderRole: list[0].senderRole,
      },
    ])
    setScreen('play')
  }

  function record(expected: string, ok: boolean) {
    const finger = fingerForKey(expected)
    addStat(playState.current.keyStats, expected, ok ? 'hit' : 'miss')
    addStat(playState.current.fingerStats, finger, ok ? 'hit' : 'miss')
    if (playState.current.prevKey) {
      addStat(
        playState.current.bigramStats,
        `${playState.current.prevKey} → ${expected}`,
        ok ? 'hit' : 'miss',
      )
    }
    if (ok) {
      playState.current.prevKey = expected
      playState.current.combo += 1
      playState.current.maxCombo = Math.max(playState.current.maxCombo, playState.current.combo)
    } else {
      playState.current.combo = 0
    }
  }

  function completeCurrent() {
    if (!problem || !session) return
    const elapsed = Math.max((Date.now() - playState.current.startedAt) / 1000, 0.1)
    const required = session.typed.length
    const pay = messagePay(difficulty, required, elapsed, playState.current.messageMisses)
    playState.current.completed += 1
    playState.current.keys += required
    playState.current.seconds += elapsed
    playState.current.messageMisses = 0
    setSalary((value) => value + pay)
    setThread((items) => {
      const next = [...items]
      const last = next[next.length - 1]
      if (last) last.reply = problem.reply
      if (last) last.gain = pay
      return next
    })
    const nextIndex = (index + 1) % problems.length
    const next = problems[nextIndex]
    setIndex(nextIndex)
    setThread((items) => [
      ...items,
      { incoming: next.incoming, senderName: next.senderName, senderRole: next.senderRole },
    ])
    playState.current.startedAt = Date.now()
  }

  async function finishPlay() {
    if (playState.current.finished) return
    playState.current.finished = true
    const payload: PlayResult = {
      anonId: getAnonId(),
      difficulty,
      durationSec: duration,
      salary,
      completedCount: playState.current.completed,
      kpm: playKpm(playState.current.keys, playState.current.seconds),
      accuracy: playAccuracy(playState.current.misses, playState.current.keys),
      missCount: playState.current.misses,
      maxCombo: playState.current.maxCombo,
      keyStats: playState.current.keyStats,
      fingerStats: playState.current.fingerStats,
      bigramStats: playState.current.bigramStats,
    }
    setResult(payload)
    setScreen('result')
    try {
      await savePlay(payload)
      setBestSalary((value) => Math.max(value, payload.salary))
    } catch {
      setError('結果の保存に失敗しました。ローカルの結果は見られます。')
    }
  }

  useEffect(() => {
    if (screen !== 'play' || !session) return
    const onKey = (event: KeyboardEvent) => {
      if (!isTypingKey(event.key, event.ctrlKey, event.altKey, event.metaKey)) return
      event.preventDefault()
      if (leftMs <= 0) return
      const key = event.key === 'Enter' ? '\n' : event.key
      const expected = session.expectedKey
      const hit = session.input(key)
      setTyped(session.typed)
      setRemainingRoma(session.remainingRomaji)
      record(expected || key, hit.ok)
      if (!hit.ok) {
        playState.current.misses += 1
        playState.current.messageMisses += 1
      }
      if (hit.done) completeCurrent()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [screen, session, leftMs, problem, index])

  async function openStats() {
    setStats(await fetchStats(getAnonId()))
    setScreen('stats')
  }

  const minutes = String(Math.floor(leftMs / 1000 / 60))
  const seconds = String(Math.floor((leftMs / 1000) % 60)).padStart(2, '0')

  if (screen === 'home') {
    return (
      <div className="center">
        <div className="panel">
          <div className="kicker">PINCHWORKS THREAD</div>
          <h1>年収打</h1>
          <p className="lead">
            届いたスレッドに、指定の返信をローマ字で返す。送り切った額が年収になります。
          </p>
          {bestSalary > 0 ? <p className="lead">ベスト年収 {yen(bestSalary)}</p> : null}
          <div className="picks">
            <div className="group">
              <p>難易度</p>
              {(['beginner', 'intermediate', 'advanced'] as const).map((value) => (
                <button
                  key={value}
                  className={difficulty === value ? 'opt on' : 'opt'}
                  onClick={() => setDifficulty(value)}
                >
                  {value === 'beginner'
                    ? '初級 新米'
                    : value === 'intermediate'
                      ? '中級 慣れてきた'
                      : '上級 つよつよ'}
                </button>
              ))}
            </div>
            <div className="group">
              <p>制限時間</p>
              {([30, 60, 120] as const).map((value) => (
                <button
                  key={value}
                  className={duration === value ? 'opt on' : 'opt'}
                  onClick={() => setDuration(value)}
                >
                  {value === 30 ? '30秒' : value === 60 ? '1分' : '2分'}
                </button>
              ))}
            </div>
          </div>
          {error ? <p className="lead">{error}</p> : null}
          <div className="row">
            <button className="cta" onClick={() => void startPlay()}>
              スレッドを開く
            </button>
            <button className="cta ghost" onClick={() => void openStats()}>
              分析を見る
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (screen === 'play' && problem) {
    return (
      <>
        <div className="float-hud">
          <div className="pay">
            <span>現在年収</span>
            <b>{yen(salary)}</b>
          </div>
          <div className="time">
            <span>残り時間</span>
            <b>
              {minutes}:{seconds}
            </b>
          </div>
          <div>
            <span>難易度</span>
            <b>{DIFFICULTY_LABEL[difficulty]}</b>
          </div>
        </div>
        <div className="col">
          <div className="thread">
            <div className="thread-head">
              <b>{problem.senderName}とのスレッド</b>
              <br />
              <small>
                {problem.channel} ・ {problem.tag}
              </small>
            </div>
            {thread.map((item, i) => (
              <div key={`${item.incoming}-${i}`}>
                <div className="bub in">
                  <span className="nm">
                    {item.senderName} ・ {item.senderRole}
                  </span>
                  {item.incoming}
                </div>
                {item.reply ? (
                  <div className="bub out">
                    <span className="nm">あなた</span>
                    {item.reply}
                    {item.gain ? <span className="gain">+{yen(item.gain)}</span> : null}
                  </div>
                ) : null}
              </div>
            ))}
            <div className="composer">
              <div className="target">
                <label>打つ返信</label>
                <div>{problem.reply}</div>
                <div className="reading">{problem.reading}</div>
                <div className="roma">
                  <span className="done">{typed}</span>
                  <span className="rest">{remainingRoma}</span>
                </div>
              </div>
              <div className="box">{typed || 'ローマ字で入力'}</div>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (screen === 'result' && result) {
    return (
      <div className="center">
        <div className="panel">
          <div className="kicker">
            {DIFFICULTY_LABEL[result.difficulty]} / {result.durationSec}秒 / {result.completedCount}
            通成立
          </div>
          <div>今回の年収</div>
          <div className="salary">{yen(result.salary)}</div>
          <p className="lead">ピンチワークス、今日も無事にチャットで稼いだ。カタカナは資産です。</p>
          {error ? <p className="lead">{error}</p> : null}
          <div className="sub">
            <div className="stat">
              <span>入力速度</span>
              <b>{result.kpm ?? '—'}</b> {result.kpm !== null ? 'kpm' : ''}
            </div>
            <div className="stat">
              <span>正確性</span>
              <b>{result.accuracy !== null ? `${result.accuracy}%` : '—'}</b>
            </div>
            <div className="stat">
              <span>ミス数</span>
              <b>{result.missCount}</b>
            </div>
            <div className="stat">
              <span>最大連続</span>
              <b>{result.maxCombo}</b>
            </div>
          </div>
          <div className="row">
            <button className="cta" onClick={() => void startPlay()}>
              もう一度
            </button>
            <button className="cta ghost" onClick={() => setScreen('home')}>
              ホーム
            </button>
            <button className="cta ghost" onClick={() => void openStats()}>
              分析を見る
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="center">
      <div className="panel">
        <div className="kicker">TYPING LAB</div>
        <h1 style={{ fontSize: 32 }}>分析</h1>
        <p className="lead">これまでのプレイから、苦手キー・指・動きを集計しています。</p>
        <h3>苦手キー</h3>
        <StatTable rows={stats?.keys ?? []} empty="まだ集計できる通数が足りない" />
        <h3>苦手な指</h3>
        <StatTable rows={stats?.fingers ?? []} empty="まだ集計できる通数が足りない" />
        <h3>苦手な動き</h3>
        <StatTable rows={stats?.bigrams ?? []} empty="まだ集計できる通数が足りない" />
        <button className="cta ghost" onClick={() => setScreen('home')}>
          ホームへ戻る
        </button>
      </div>
    </div>
  )
}

function StatTable({
  rows,
  empty,
}: {
  rows: { label: string; hits: number; misses: number; rate: number }[]
  empty: string
}) {
  if (rows.length === 0) return <p className="empty">{empty}</p>
  return (
    <table>
      <thead>
        <tr>
          <th>項目</th>
          <th>入力</th>
          <th>ミス</th>
          <th>ミス率</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.label}>
            <td>{row.label}</td>
            <td>{row.hits}</td>
            <td>{row.misses}</td>
            <td>{`${(row.rate * 100).toFixed(1)}%`}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
