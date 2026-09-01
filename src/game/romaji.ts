const DIGRAPHS: Record<string, string[]> = {
  きゃ: ['kya'],
  きぃ: ['kyi'],
  きゅ: ['kyu'],
  きぇ: ['kye'],
  きょ: ['kyo'],
  しゃ: ['sya', 'sha'],
  しぃ: ['syi', 'shi'],
  しゅ: ['syu', 'shu'],
  しぇ: ['sye', 'she'],
  しょ: ['syo', 'sho'],
  ちゃ: ['tya', 'cha', 'cya'],
  ちぃ: ['tyi', 'cyi'],
  ちゅ: ['tyu', 'chu', 'cyu'],
  ちぇ: ['tye', 'che', 'cye'],
  ちょ: ['tyo', 'cho', 'cyo'],
  にゃ: ['nya'],
  にゅ: ['nyu'],
  にょ: ['nyo'],
  ひゃ: ['hya'],
  ひゅ: ['hyu'],
  ひょ: ['hyo'],
  みゃ: ['mya'],
  みゅ: ['myu'],
  みょ: ['myo'],
  りゃ: ['rya'],
  りゅ: ['ryu'],
  りょ: ['ryo'],
  ぎゃ: ['gya'],
  ぎゅ: ['gyu'],
  ぎょ: ['gyo'],
  じゃ: ['zya', 'ja', 'jya'],
  じゅ: ['zyu', 'ju', 'jyu'],
  じょ: ['zyo', 'jo', 'jyo'],
  びゃ: ['bya'],
  びゅ: ['byu'],
  びょ: ['byo'],
  ぴゃ: ['pya'],
  ぴゅ: ['pyu'],
  ぴょ: ['pyo'],
  てぃ: ['thi', 'texi', 'ti'],
  でぃ: ['dhi', 'dexi', 'di'],
  ふぁ: ['fa', 'fuxa', 'hua'],
  ふぃ: ['fi', 'fuxi', 'hui'],
  ふぇ: ['fe', 'fuxe', 'hue'],
  ふぉ: ['fo', 'fuxo', 'huo'],
  うぃ: ['wi', 'uxi'],
  うぇ: ['we', 'uxe'],
  うぉ: ['wo', 'uxo'],
}

const MONO: Record<string, string[]> = {
  あ: ['a'],
  い: ['i'],
  う: ['u', 'wu'],
  え: ['e'],
  お: ['o'],
  か: ['ka', 'ca'],
  き: ['ki'],
  く: ['ku', 'cu', 'qu'],
  け: ['ke'],
  こ: ['ko', 'co'],
  さ: ['sa'],
  し: ['si', 'shi', 'ci'],
  す: ['su'],
  せ: ['se', 'ce'],
  そ: ['so'],
  た: ['ta'],
  ち: ['ti', 'chi'],
  つ: ['tu', 'tsu'],
  て: ['te'],
  と: ['to'],
  な: ['na'],
  に: ['ni'],
  ぬ: ['nu'],
  ね: ['ne'],
  の: ['no'],
  は: ['ha'],
  ひ: ['hi'],
  ふ: ['hu', 'fu'],
  へ: ['he'],
  ほ: ['ho'],
  ま: ['ma'],
  み: ['mi'],
  む: ['mu'],
  め: ['me'],
  も: ['mo'],
  や: ['ya'],
  ゆ: ['yu'],
  よ: ['yo'],
  ら: ['ra'],
  り: ['ri'],
  る: ['ru'],
  れ: ['re'],
  ろ: ['ro'],
  わ: ['wa'],
  を: ['wo', 'o'],
  ん: ['n', 'nn', "n'"],
  が: ['ga'],
  ぎ: ['gi'],
  ぐ: ['gu'],
  げ: ['ge'],
  ご: ['go'],
  ざ: ['za'],
  じ: ['zi', 'ji'],
  ず: ['zu'],
  ぜ: ['ze'],
  ぞ: ['zo'],
  だ: ['da'],
  ぢ: ['di', 'ji'],
  づ: ['du', 'zu'],
  で: ['de'],
  ど: ['do'],
  ば: ['ba'],
  び: ['bi'],
  ぶ: ['bu'],
  べ: ['be'],
  ぼ: ['bo'],
  ぱ: ['pa'],
  ぴ: ['pi'],
  ぷ: ['pu'],
  ぺ: ['pe'],
  ぽ: ['po'],
  ぁ: ['xa', 'la'],
  ぃ: ['xi', 'li'],
  ぅ: ['xu', 'lu'],
  ぇ: ['xe', 'le'],
  ぉ: ['xo', 'lo'],
  ゃ: ['xya', 'lya'],
  ゅ: ['xyu', 'lyu'],
  ょ: ['xyo', 'lyo'],
  っ: ['xtu', 'ltu', 'xtsu', 'ltsu'],
  ー: ['-'],
  '。': ['.'],
  '、': [','],
  '？': ['?'],
  '！': ['!'],
}

const VOWELISH = /^[あいうえおやゆよんaiueoyn]/i

function firstConsonant(roma: string): string | null {
  const ch = roma[0]
  if (!ch || /[aeiou']/i.test(ch)) return null
  return ch
}

function nOptions(restAfterN: string): string[] {
  if (!restAfterN) return ['n', 'nn', "n'"]
  if (VOWELISH.test(restAfterN)) return ['nn', "n'"]
  return ['n', 'nn']
}

function optionsAt(text: string): { consume: number; options: string[] } | null {
  if (!text) return null
  if (text[0] === 'ん') return { consume: 1, options: nOptions(text.slice(1)) }
  if (text[0] === 'っ' && text.length > 1) {
    const next = optionsAt(text.slice(1))
    if (next) {
      const doubled: string[] = []
      for (const opt of next.options) {
        const c = firstConsonant(opt)
        if (c) doubled.push(c + opt)
      }
      doubled.push(...MONO['っ'].map((x) => x + next.options[0]))
      return { consume: 1 + next.consume, options: [...new Set(doubled)] }
    }
  }
  const two = text.slice(0, 2)
  if (DIGRAPHS[two]) return { consume: 2, options: DIGRAPHS[two] }
  const one = text[0]
  if (MONO[one]) return { consume: 1, options: MONO[one] }
  return { consume: 1, options: [one] }
}

export function canonicalRomaji(reading: string): string {
  let rest = reading
  let out = ''
  while (rest) {
    const chunk = optionsAt(rest)
    if (!chunk) break
    out += chunk.options[0]
    rest = rest.slice(chunk.consume)
  }
  return out
}

export type RomajiHit = {
  ok: boolean
  done: boolean
  expected: string
  typed: string
}

export function createRomajiSession(reading: string) {
  let remaining = reading
  let buffer = ''
  let typed = ''
  let expectedKey = ''

  const current = () => optionsAt(remaining)

  const refreshExpected = () => {
    const chunk = current()
    expectedKey = chunk
      ? (chunk.options.find((o) => o.startsWith(buffer)) ?? chunk.options[0]).slice(
          buffer.length,
          buffer.length + 1,
        )
      : ''
  }
  refreshExpected()

  return {
    get typed() {
      return typed
    },
    get remainingRomaji() {
      const chunk = current()
      if (!chunk) return ''
      const chosen = chunk.options.find((o) => o.startsWith(buffer)) ?? chunk.options[0]
      return chosen.slice(buffer.length) + canonicalRomaji(remaining.slice(chunk.consume))
    },
    get expectedKey() {
      return expectedKey
    },
    get done() {
      return remaining.length === 0
    },
    input(key: string): RomajiHit {
      const apply = (chunk: { consume: number; options: string[] }): boolean => {
        const next = buffer + key
        const matches = chunk.options.filter((o) => o.startsWith(next))
        if (matches.length > 0) {
          typed += key
          if (matches.some((o) => o === next)) {
            remaining = remaining.slice(chunk.consume)
            buffer = ''
          } else {
            buffer = next
          }
          return true
        }
        if (buffer && chunk.options.includes(buffer)) {
          remaining = remaining.slice(chunk.consume)
          buffer = ''
          const following = current()
          return following ? apply(following) : false
        }
        return false
      }
      const chunk = current()
      if (!chunk) return { ok: false, done: true, expected: '', typed }
      const ok = apply(chunk)
      refreshExpected()
      return { ok, done: remaining.length === 0, expected: ok ? key : expectedKey, typed }
    },
  }
}

export function isTypingKey(key: string, ctrl: boolean, alt: boolean, meta: boolean): boolean {
  if (ctrl || alt || meta) return false
  if (key === 'Enter') return true
  return key.length === 1
}
