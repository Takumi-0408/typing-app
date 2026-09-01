import type { StatMap } from './types.ts'

const FINGER_KEYS: Record<string, string[]> = {
  左小指: ['1', 'q', 'a', 'z', '!', 'Q', 'A', 'Z'],
  左薬指: ['2', 'w', 's', 'x', '"', 'W', 'S', 'X'],
  左中指: ['3', 'e', 'd', 'c', '#', 'E', 'D', 'C'],
  左人差: ['4', '5', 'r', 't', 'f', 'g', 'v', 'b', '$', '%', 'R', 'T', 'F', 'G', 'V', 'B'],
  右人差: ['6', '7', 'y', 'u', 'h', 'j', 'n', 'm', '&', "'", 'Y', 'U', 'H', 'J', 'N', 'M'],
  右中指: ['8', 'i', 'k', ',', '(', 'I', 'K', '<'],
  右薬指: ['9', 'o', 'l', '.', ')', 'O', 'L', '>'],
  右小指: [
    '0',
    '-',
    'p',
    ';',
    '/',
    '=',
    '@',
    '[',
    ']',
    ':',
    '\\',
    '`',
    'P',
    '_',
    '+',
    '{',
    '}',
    '?',
    '|',
    '~',
  ],
  親指: [' '],
}

const KEY_TO_FINGER = new Map<string, string>()
for (const [finger, keys] of Object.entries(FINGER_KEYS)) {
  for (const key of keys) KEY_TO_FINGER.set(key, finger)
}

export function fingerForKey(key: string): string {
  return KEY_TO_FINGER.get(key) ?? (key === 'Enter' ? '右小指' : 'その他')
}

export function addStat(map: StatMap, label: string, kind: 'hit' | 'miss'): void {
  const row = map[label] ?? { hits: 0, misses: 0 }
  if (kind === 'hit') row.hits += 1
  else row.misses += 1
  map[label] = row
}

export function mergeStats(parts: StatMap[]): StatMap {
  const out: StatMap = {}
  for (const part of parts) {
    for (const [label, stat] of Object.entries(part)) {
      const row = out[label] ?? { hits: 0, misses: 0 }
      row.hits += stat.hits
      row.misses += stat.misses
      out[label] = row
    }
  }
  return out
}

export function rankStats(
  map: StatMap,
  minEvents: number,
): { label: string; hits: number; misses: number; rate: number }[] {
  return Object.entries(map)
    .map(([label, stat]) => {
      const events = stat.hits + stat.misses
      return {
        label,
        hits: stat.hits,
        misses: stat.misses,
        rate: events === 0 ? 0 : stat.misses / events,
      }
    })
    .filter((row) => row.hits + row.misses >= minEvents)
    .sort((a, b) => b.rate - a.rate || b.misses - a.misses)
}
