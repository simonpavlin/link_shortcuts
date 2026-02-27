import { evaluateRules, interpolateParams } from './shortcuts.utils'
import type { Shortcut, Rule, RuleResult } from './shortcuts.utils'
import { findTable, searchEntries } from './lookup.utils'
import type { LookupTable, LookupEntry } from './lookup.utils'
import { resolveUrl } from './url.utils'

// ── Types ────────────────────────────────────────────────────────────────────

export type EvalStep =
  | { type: 'parse'; module: string | null; command: string | null; param: string | null; flags: Record<string, string>; params: Record<string, string>; depth: number }
  | { type: 'sentinel'; navigateTo: string; depth: number }
  | { type: 'shortcut_found'; shortcut: Shortcut; depth: number }
  | { type: 'shortcut_not_found'; command: string; depth: number }
  | { type: 'shortcut_match'; shortcut: Shortcut; rule: Rule; rawUrl: string | null; depth: number }
  | { type: 'shortcut_rule_fail'; rule: Rule; depth: number }
  | { type: 'lookup_found'; table: LookupTable; depth: number }
  | { type: 'lookup_not_found'; command: string; depth: number }
  | { type: 'lookup_match'; table: LookupTable; entry: LookupEntry; tags: string[]; depth: number }
  | { type: 'lookup_no_match'; table: LookupTable; tags: string[]; depth: number }
  | { type: 'lookup_multi'; table: LookupTable; entries: LookupEntry[]; tags: string[]; depth: number }
  | { type: 'chain'; fromRaw: string | null; toQuery: string; depth: number }
  | { type: 'error'; message: string; depth: number }

export type EvalResult =
  | { type: 'none' }
  | { type: 'redirect'; url: string }
  | { type: 'navigate'; to: string }
  | { type: 'picker'; table: LookupTable; entries: LookupEntry[]; tags: string[]; params: Record<string, string> }
  | { type: 'error'; message: string }

// ── Internals ────────────────────────────────────────────────────────────────

const MAX_DEPTH = 5
const FLAG_RE = /^--([a-zA-Z_][\w-]*)=(.*)$/

function parseFlags(tokens: string[]): { plainTokens: string[]; flags: Record<string, string> } {
  const plainTokens: string[] = []
  const flags: Record<string, string> = {}
  for (const token of tokens) {
    const m = FLAG_RE.exec(token)
    if (m) {
      flags[m[1]] = m[2]
    } else {
      plainTokens.push(token)
    }
  }
  return { plainTokens, flags }
}

function parseRawQ(rawQ: string) {
  const parts = rawQ.split(' ')
  const { plainTokens, flags } = parseFlags(parts.slice(2))
  return {
    module: parts[0] || null,
    command: parts[1] || null,
    param: plainTokens.length ? plainTokens.join(' ') : null,
    flags,
  }
}

function extractChainQ(resolved: string, origin: string): string | null {
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

function evaluateStep(
  rawQ: string,
  shortcuts: Shortcut[],
  tables: LookupTable[],
  steps: EvalStep[],
  depth: number,
  origin: string,
  urlParams: Record<string, string> = {},
): EvalResult {
  if (depth > MAX_DEPTH) {
    return { type: 'error', message: 'Max chain depth reached (possible cycle)' }
  }

  const { module, command, param, flags } = parseRawQ(rawQ)
  const params = { ...urlParams, ...flags }

  steps.push({ type: 'parse', module, command, param, flags, params, depth })

  // Sentinel: ?q=shortcuts+mr+?
  if (param === '?') {
    const to =
      module === 'find'
        ? `/find/${command ? `?key=${encodeURIComponent(command)}` : ''}`
        : `/go/${command ? `?key=${encodeURIComponent(command)}` : ''}`
    steps.push({ type: 'sentinel', navigateTo: to, depth })
    return { type: 'navigate', to }
  }

  // Go (shortcuts) module
  if (module === 'go' && command && (param != null || Object.keys(params).length)) {
    const shortcut = shortcuts.find((s) => s.key === command)
    if (!shortcut) {
      steps.push({ type: 'shortcut_not_found', command, depth })
      return { type: 'navigate', to: `/go/?key=${encodeURIComponent(command)}` }
    }

    steps.push({ type: 'shortcut_found', shortcut, depth })

    let processedParam = param ?? ''
    if (shortcut.trimInput) processedParam = processedParam.trim()
    if (shortcut.lowercaseInput) processedParam = processedParam.toLowerCase()

    const results = evaluateRules(shortcut.rules, processedParam, params)
    let match: RuleResult | null = null
    for (const r of results) {
      if (r.matched) {
        match = r
        steps.push({ type: 'shortcut_match', shortcut, rule: r.rule, rawUrl: r.resultUrl, depth })
        break
      }
      steps.push({ type: 'shortcut_rule_fail', rule: r.rule, depth })
    }

    if (match) {
      const resolved = resolveUrl(match.resultUrl!)
      const nextQ = extractChainQ(resolved, origin)
      if (nextQ !== null) {
        steps.push({ type: 'chain', fromRaw: match.resultUrl, toQuery: nextQ, depth })
        return evaluateStep(nextQ, shortcuts, tables, steps, depth + 1, origin, params)
      }
      return { type: 'redirect', url: resolved }
    }

    return { type: 'navigate', to: `/go/?key=${encodeURIComponent(command)}` }
  }

  // Find (lookup) module
  if (module === 'find' && command && (param != null || Object.keys(params).length)) {
    const table = findTable(tables, command)
    if (!table) {
      steps.push({ type: 'lookup_not_found', command, depth })
      return { type: 'navigate', to: `/find/?key=${encodeURIComponent(command)}` }
    }

    steps.push({ type: 'lookup_found', table, depth })

    const tags = param ? param.split(' ').filter(Boolean) : []
    const entries = searchEntries(table, tags)

    if (entries.length === 0) {
      steps.push({ type: 'lookup_no_match', table, tags, depth })
      return { type: 'navigate', to: `/find/?key=${encodeURIComponent(command)}` }
    }

    if (entries.length === 1) {
      steps.push({ type: 'lookup_match', table, entry: entries[0], tags, depth })
      const entryUrl = interpolateParams(entries[0].url, params)
      const resolved = resolveUrl(entryUrl)
      const nextQ = extractChainQ(resolved, origin)
      if (nextQ !== null) {
        steps.push({ type: 'chain', fromRaw: entryUrl, toQuery: nextQ, depth })
        return evaluateStep(nextQ, shortcuts, tables, steps, depth + 1, origin, params)
      }
      return { type: 'redirect', url: resolved }
    }

    steps.push({ type: 'lookup_multi', table, entries, tags, depth })
    return { type: 'picker', table, entries, tags, params }
  }

  // Module present but no command/param → go to admin
  if (module) {
    return { type: 'navigate', to: module === 'find' ? '/find/' : '/go/' }
  }

  return { type: 'none' }
}

export function evaluateQuery(
  rawQ: string,
  shortcuts: Shortcut[],
  tables: LookupTable[],
  origin = '',
  urlParams: Record<string, string> = {},
): { steps: EvalStep[]; result: EvalResult } {
  const trimmed = rawQ?.trim() ?? ''
  if (!trimmed) return { steps: [], result: { type: 'none' } }
  const steps: EvalStep[] = []
  const result = evaluateStep(trimmed, shortcuts, tables, steps, 0, origin, urlParams)
  return { steps, result }
}
