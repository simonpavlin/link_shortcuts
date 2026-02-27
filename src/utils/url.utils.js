/**
 * Extracts `module`, `command` and `param` from URLSearchParams.
 * Format: ?q=module+command+value  (e.g. ?q=shortcuts+mr+1234)
 * token 0 = module ("shortcuts" | "lookup"), token 1 = command, rest = param.
 * @param {URLSearchParams} searchParams
 * @returns {{ module: string|null, command: string|null, param: string|null }}
 */
export function parseSearchParams(searchParams) {
  const raw = searchParams.get('q') ?? ''
  if (!raw) return { module: null, command: null, param: null }
  const parts = raw.split(' ')
  return {
    module: parts[0] || null,
    command: parts[1] || null,
    param: parts.slice(2).join(' ') || null,
  }
}

/**
 * Builds the browser URL that users paste as a custom search engine.
 * Format: ?q=shortcuts+KEY+%s  — the browser substitutes %s with whatever the user types.
 * @param {string} origin  e.g. "https://linker.pavlin.dev"
 * @param {string} shortcutKey
 * @returns {string}
 */
export function buildBrowserUrl(origin, shortcutKey) {
  return `${origin}/?q=shortcuts+${encodeURIComponent(shortcutKey)}+%s`
}

/**
 * Builds the lookup browser URL for a given table key.
 * Format: ?q=lookup+TABLE_KEY+%s  — user types space-separated tags in place of %s.
 * @param {string} origin  e.g. "https://linker.pavlin.dev"
 * @param {string} tableKey
 * @returns {string}
 */
export function buildLookupUrl(origin, tableKey) {
  return `${origin}/?q=lookup+${encodeURIComponent(tableKey)}+%s`
}

/**
 * Resolves a raw URL/query value to a navigable href.
 * If the first word (before the first space) consists solely of a-z letters,
 * the whole string is treated as a ?q= query → `/?q=value`.
 * Otherwise it's used as a URL as-is (handles http://, https://, www., /path, etc.).
 * @param {string} raw
 * @returns {string}
 */
export function resolveUrl(raw) {
  const firstWord = raw.split(' ')[0]
  if (/^[a-z]+$/.test(firstWord)) {
    return `/?${new URLSearchParams({ q: raw }).toString()}`
  }
  return raw
}
