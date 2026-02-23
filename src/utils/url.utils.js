/**
 * Extracts `command` and `param` from URLSearchParams.
 * @param {URLSearchParams} searchParams
 * @returns {{ command: string|null, param: string|null }}
 */
export function parseSearchParams(searchParams) {
  return {
    command: searchParams.get('command'),
    param: searchParams.get('param'),
  }
}

/**
 * Builds the browser URL that users paste as a custom search engine.
 * The `%s` placeholder is the browser's built-in substitution token.
 * @param {string} origin  e.g. "https://linker.pavlin.dev"
 * @param {string} shortcutKey
 * @returns {string}
 */
export function buildBrowserUrl(origin, shortcutKey) {
  return `${origin}/shortcuts/?command=${encodeURIComponent(shortcutKey)}&param=%s`
}
