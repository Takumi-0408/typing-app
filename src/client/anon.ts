const KEY = 'nenshuda-anon-id'

export function getAnonId(): string {
  const existing = localStorage.getItem(KEY)
  if (existing) return existing
  const id = crypto.randomUUID()
  localStorage.setItem(KEY, id)
  return id
}
