/**
 * Extracts `command` and `param` from URLSearchParams.
 * New format: ?param=command+value  (e.g. ?param=mr+1234)
 * The part before the first space is the command; the rest is the param.
 * @param {URLSearchParams} searchParams
 * @returns {{ command: string|null, param: string|null }}
 */
export function parseSearchParams(searchParams) {
  const raw = searchParams.get('param') ?? ''
  if (!raw) return { command: null, param: null }
  const spaceIdx = raw.indexOf(' ')
  if (spaceIdx === -1) return { command: raw || null, param: null }
  return {
    command: raw.slice(0, spaceIdx) || null,
    param: raw.slice(spaceIdx + 1) || null,
  }
}

/**
 * Builds the browser URL that users paste as a custom search engine.
 * Format: ?param=KEY+%s  — the browser substitutes %s with whatever the user types.
 * A global keyword (e.g. "go") can also use ?param=%s and type "go mr 1234".
 * @param {string} origin  e.g. "https://linker.pavlin.dev"
 * @param {string} shortcutKey
 * @returns {string}
 */
export function buildBrowserUrl(origin, shortcutKey) {
  return `${origin}/shortcuts/?param=${encodeURIComponent(shortcutKey)}+%s`
}
