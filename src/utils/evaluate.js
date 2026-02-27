import { evaluateRules } from './shortcuts.utils'
import { findTable, searchEntries } from './lookup.utils'
import { resolveUrl } from './url.utils'

const MAX_DEPTH = 5

function parseRawQ(rawQ) {
  const parts = rawQ.split(' ')
  return {
    module: parts[0] || null,
    command: parts[1] || null,
    param: parts.slice(2).join(' ') || null,
  }
}

/**
 * Returns the ?q= value if `resolved` is an internal chain URL, otherwise null.
 * Handles two forms:
 *   - Relative:  /?q=...         (produced by resolveUrl for word-only rule URLs)
 *   - Absolute:  http://localhost:5173/?q=...  or  https://linker.pavlin.dev/?q=...
 *     when the URL's origin matches the app's own origin.
 */
function extractChainQ(resolved, origin) {
  if (resolved.startsWith('/?')) {
    return new URLSearchParams(resolved.slice(2)).get('q')
  }
  if (origin) {
    try {
      const url = new URL(resolved)
      if (url.origin === origin && url.pathname === '/' && url.searchParams.has('q')) {
        return url.searchParams.get('q')
      }
    } catch { /* not a valid URL */ }
  }
  return null
}

function evaluateStep(rawQ, shortcuts, tables, steps, depth, origin) {
  if (depth > MAX_DEPTH) {
    return { type: 'error', message: 'Max chain depth reached (possible cycle)' }
  }

  const { module, command, param } = parseRawQ(rawQ)
  steps.push({ type: 'parse', module, command, param, depth })

  // Sentinel: ?q=shortcuts+mr+?
  if (param === '?') {
    const to =
      module === 'lookup'
        ? `/lookup/${command ? `?key=${encodeURIComponent(command)}` : ''}`
        : `/shortcuts/${command ? `?key=${encodeURIComponent(command)}` : ''}`
    steps.push({ type: 'sentinel', navigateTo: to, depth })
    return { type: 'navigate', to }
  }

  // Shortcuts module
  if (module === 'shortcuts' && command && param) {
    const shortcut = shortcuts.find((s) => s.key === command)
    if (!shortcut) {
      steps.push({ type: 'shortcut_not_found', command, depth })
      return { type: 'navigate', to: `/shortcuts/?key=${encodeURIComponent(command)}` }
    }

    steps.push({ type: 'shortcut_found', shortcut, depth })

    let processedParam = param
    if (shortcut.trimInput) processedParam = processedParam.trim()
    if (shortcut.lowercaseInput) processedParam = processedParam.toLowerCase()

    const results = evaluateRules(shortcut.rules, processedParam)
    let match = null
    for (const r of results) {
      if (r.matched) {
        match = r
        steps.push({ type: 'shortcut_match', shortcut, rule: r.rule, rawUrl: r.resultUrl, depth })
        break
      }
      steps.push({ type: 'shortcut_rule_fail', rule: r.rule, depth })
    }

    if (match) {
      const resolved = resolveUrl(match.resultUrl)
      const nextQ = extractChainQ(resolved, origin)
      if (nextQ !== null) {
        steps.push({ type: 'chain', fromRaw: match.resultUrl, toQuery: nextQ, depth })
        return evaluateStep(nextQ, shortcuts, tables, steps, depth + 1, origin)
      }
      return { type: 'redirect', url: resolved }
    }

    return { type: 'navigate', to: `/shortcuts/?key=${encodeURIComponent(command)}` }
  }

  // Lookup module
  if (module === 'lookup' && command && param) {
    const table = findTable(tables, command)
    if (!table) {
      steps.push({ type: 'lookup_not_found', command, depth })
      return { type: 'navigate', to: `/lookup/?key=${encodeURIComponent(command)}` }
    }

    steps.push({ type: 'lookup_found', table, depth })

    const tags = param.split(' ').filter(Boolean)
    const entries = searchEntries(table, tags)

    if (entries.length === 0) {
      steps.push({ type: 'lookup_no_match', table, tags, depth })
      return { type: 'navigate', to: `/lookup/?key=${encodeURIComponent(command)}` }
    }

    if (entries.length === 1) {
      steps.push({ type: 'lookup_match', table, entry: entries[0], tags, depth })
      const resolved = resolveUrl(entries[0].url)
      const nextQ = extractChainQ(resolved, origin)
      if (nextQ !== null) {
        steps.push({ type: 'chain', fromRaw: entries[0].url, toQuery: nextQ, depth })
        return evaluateStep(nextQ, shortcuts, tables, steps, depth + 1, origin)
      }
      return { type: 'redirect', url: resolved }
    }

    steps.push({ type: 'lookup_multi', table, entries, tags, depth })
    return { type: 'picker', table, entries, tags }
  }

  // Module present but no command/param → go to admin
  if (module) {
    return { type: 'navigate', to: module === 'lookup' ? '/lookup/' : '/shortcuts/' }
  }

  return { type: 'none' }
}

/**
 * Evaluates a raw query string against shortcuts and tables.
 * @param {string} rawQ     – content of the ?q= param
 * @param {Array}  shortcuts
 * @param {Array}  tables
 * @param {string} [origin] – window.location.origin, used to detect same-origin chain URLs
 * @returns {{ steps: Array, result: Object }}
 */
export function evaluateQuery(rawQ, shortcuts, tables, origin = '') {
  const trimmed = rawQ?.trim() ?? ''
  if (!trimmed) return { steps: [], result: { type: 'none' } }
  const steps = []
  const result = evaluateStep(trimmed, shortcuts, tables, steps, 0, origin)
  return { steps, result }
}
