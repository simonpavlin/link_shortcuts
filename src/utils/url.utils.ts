export function parseSearchParams(searchParams: URLSearchParams): {
  module: string | null
  command: string | null
  param: string | null
} {
  const raw = searchParams.get('q') ?? ''
  if (!raw) return { module: null, command: null, param: null }
  const parts = raw.split(' ')
  return {
    module: parts[0] || null,
    command: parts[1] || null,
    param: parts.slice(2).join(' ') || null,
  }
}

export function buildGoUrl(origin: string, conditionKey: string): string {
  return `${origin}/?q=go+${encodeURIComponent(conditionKey)}+%s`
}

export function buildFindUrl(origin: string, tableKey: string): string {
  return `${origin}/?q=find+${encodeURIComponent(tableKey)}+%s`
}

export function resolveUrl(raw: string): string {
  const firstWord = raw.split(' ')[0]
  if (/^[a-z]+$/.test(firstWord)) {
    return `/?${new URLSearchParams({ q: raw }).toString()}`
  }
  return raw
}
