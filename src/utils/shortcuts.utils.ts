import { v4 as uuidv4 } from 'uuid'

// ── Types ────────────────────────────────────────────────────────────────────

export type PatternTypeName = 'number' | 'string' | 'url' | 'empty' | 'const' | 'regex'

export type PatternTypeInfo = {
  label: string
  pattern: string | null
}

export type Rule = {
  id: string
  label: string
  patternType: PatternTypeName
  pattern: string
  url: string
  subtitle?: string
  lastUsedAt?: string | null
}

export type Shortcut = {
  id: string
  key: string
  name: string
  trimInput?: boolean
  lowercaseInput?: boolean
  rules: Rule[]
}

export type RuleResult = {
  rule: Rule
  matched: boolean
  resultUrl: string | null
  skipped?: boolean
}

// ── Constants ────────────────────────────────────────────────────────────────

export const PATTERN_TYPES: Record<PatternTypeName, PatternTypeInfo> = {
  'number': { label: 'isNumber',   pattern: '^\\d+$' },
  'string': { label: 'isAnything', pattern: '^.*$' },
  'url':    { label: 'isURL',      pattern: '^https?://' },
  'empty':  { label: 'isEmpty',    pattern: '^$' },
  'const':  { label: 'isConst',    pattern: null },
  'regex':  { label: 'isRegex',    pattern: null },
}

// ── Evaluation ───────────────────────────────────────────────────────────────

export const interpolateParams = (template: string, params: Record<string, string>): string => {
  let result = template
  for (let i = 0; i < 10; i++) {
    const next = result.replace(/\$\{(\w+)\}/g, (match, name: string) =>
      name in params ? params[name] : match,
    )
    if (next === result) break
    result = next
  }
  return result
}

export const evaluateRules = (rules: Rule[], param: string, params: Record<string, string> = {}): RuleResult[] =>
  rules.map((rule) => {
    let matched = false
    let resultUrl: string | null = null
    try {
      if (rule.patternType === 'const') {
        matched = param === rule.pattern
      } else {
        const regex = new RegExp(rule.pattern)
        matched = regex.test(param)
      }
      if (matched) {
        resultUrl = interpolateParams(rule.url, params).replace('%s', encodeURIComponent(param))
      }
    } catch {
      matched = false
    }
    return { rule, matched, resultUrl }
  })

// ── CRUD helpers (pure functions, return new arrays) ─────────────────────────

export const createShortcut = ({ key = '', name = '' } = {}): Shortcut => ({
  id: uuidv4(),
  key,
  name,
  rules: [],
})

export const createRule = ({ label = '', patternType = 'number' as PatternTypeName, pattern = '', url = '' } = {}): Rule => ({
  id: uuidv4(),
  label,
  patternType,
  pattern: (patternType === 'const' || patternType === 'regex')
    ? pattern
    : (PATTERN_TYPES[patternType]?.pattern ?? pattern),
  url,
})

export const addShortcut = (shortcuts: Shortcut[], data: { key?: string; name?: string }) => {
  const shortcut = createShortcut(data)
  return { shortcuts: [...shortcuts, shortcut], newId: shortcut.id }
}

export const updateShortcut = (shortcuts: Shortcut[], id: string, data: Partial<Shortcut>): Shortcut[] =>
  shortcuts.map((s) => (s.id === id ? { ...s, ...data } : s))

export const deleteShortcut = (shortcuts: Shortcut[], id: string): Shortcut[] =>
  shortcuts.filter((s) => s.id !== id)

export const addRule = (shortcuts: Shortcut[], shortcutId: string, ruleData: Partial<Rule>): Shortcut[] =>
  shortcuts.map((s) =>
    s.id !== shortcutId ? s : { ...s, rules: [...s.rules, createRule(ruleData)] }
  )

export const updateRule = (shortcuts: Shortcut[], shortcutId: string, ruleId: string, data: Partial<Rule>): Shortcut[] =>
  shortcuts.map((s) =>
    s.id !== shortcutId
      ? s
      : { ...s, rules: s.rules.map((r) => (r.id === ruleId ? { ...r, ...data } : r)) }
  )

export const deleteRule = (shortcuts: Shortcut[], shortcutId: string, ruleId: string): Shortcut[] =>
  shortcuts.map((s) =>
    s.id !== shortcutId ? s : { ...s, rules: s.rules.filter((r) => r.id !== ruleId) }
  )

export const reorderRules = (shortcuts: Shortcut[], shortcutId: string, newRules: Rule[]): Shortcut[] =>
  shortcuts.map((s) => (s.id !== shortcutId ? s : { ...s, rules: newRules }))

export const duplicateShortcut = (shortcuts: Shortcut[], id: string): Shortcut[] => {
  const src = shortcuts.find((s) => s.id === id)
  if (!src) return shortcuts
  const copy: Shortcut = {
    ...createShortcut({ key: `${src.key}-copy`, name: src.name ? `${src.name} (copy)` : '' }),
    rules: src.rules.map((r) => ({ ...r, id: uuidv4() })),
  }
  const idx = shortcuts.findIndex((s) => s.id === id)
  const result = [...shortcuts]
  result.splice(idx + 1, 0, copy)
  return result
}
