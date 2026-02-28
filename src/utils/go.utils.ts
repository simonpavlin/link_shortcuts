import { v4 as uuidv4 } from 'uuid'

// ── Types ────────────────────────────────────────────────────────────────────

export type PatternTypeName = 'number' | 'string' | 'url' | 'empty' | 'const' | 'regex'

export type PatternTypeInfo = {
  label: string
  pattern: string | null
}

export type GoRule = {
  id: string
  label: string
  patternType: PatternTypeName
  pattern: string
  url: string
  subtitle?: string
  lastUsedAt?: string | null
}

export type GoCondition = {
  id: string
  key: string
  name: string
  trimInput?: boolean
  lowercaseInput?: boolean
  rules: GoRule[]
}

export type GoRuleResult = {
  rule: GoRule
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

export const evaluateRules = (rules: GoRule[], param: string, params: Record<string, string> = {}): GoRuleResult[] =>
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

export const createCondition = ({ key = '', name = '' } = {}): GoCondition => ({
  id: uuidv4(),
  key,
  name,
  rules: [],
})

export const createRule = ({ label = '', patternType = 'number' as PatternTypeName, pattern = '', url = '' } = {}): GoRule => ({
  id: uuidv4(),
  label,
  patternType,
  pattern: (patternType === 'const' || patternType === 'regex')
    ? pattern
    : (PATTERN_TYPES[patternType]?.pattern ?? pattern),
  url,
})

export const addCondition = (conditions: GoCondition[], data: { key?: string; name?: string }) => {
  const condition = createCondition(data)
  return { conditions: [...conditions, condition], newId: condition.id }
}

export const updateCondition = (conditions: GoCondition[], id: string, data: Partial<GoCondition>): GoCondition[] =>
  conditions.map((s) => (s.id === id ? { ...s, ...data } : s))

export const deleteCondition = (conditions: GoCondition[], id: string): GoCondition[] =>
  conditions.filter((s) => s.id !== id)

export const addRule = (conditions: GoCondition[], conditionId: string, ruleData: Partial<GoRule>): GoCondition[] =>
  conditions.map((s) =>
    s.id !== conditionId ? s : { ...s, rules: [...s.rules, createRule(ruleData)] }
  )

export const updateRule = (conditions: GoCondition[], conditionId: string, ruleId: string, data: Partial<GoRule>): GoCondition[] =>
  conditions.map((s) =>
    s.id !== conditionId
      ? s
      : { ...s, rules: s.rules.map((r) => (r.id === ruleId ? { ...r, ...data } : r)) }
  )

export const deleteRule = (conditions: GoCondition[], conditionId: string, ruleId: string): GoCondition[] =>
  conditions.map((s) =>
    s.id !== conditionId ? s : { ...s, rules: s.rules.filter((r) => r.id !== ruleId) }
  )

export const reorderRules = (conditions: GoCondition[], conditionId: string, newRules: GoRule[]): GoCondition[] =>
  conditions.map((s) => (s.id !== conditionId ? s : { ...s, rules: newRules }))

export const duplicateCondition = (conditions: GoCondition[], id: string): GoCondition[] => {
  const src = conditions.find((s) => s.id === id)
  if (!src) return conditions
  const copy: GoCondition = {
    ...createCondition({ key: `${src.key}-copy`, name: src.name ? `${src.name} (copy)` : '' }),
    rules: src.rules.map((r) => ({ ...r, id: uuidv4() })),
  }
  const idx = conditions.findIndex((s) => s.id === id)
  const result = [...conditions]
  result.splice(idx + 1, 0, copy)
  return result
}
