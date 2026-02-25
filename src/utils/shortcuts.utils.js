import { v4 as uuidv4 } from 'uuid'

export const PATTERN_TYPES = {
  'number': { label: 'Number', pattern: '^\\d+$' },
  'string': { label: 'Anything', pattern: '^.+$' },
  'url':    { label: 'URL',    pattern: '^https?://' },
  'const':  { label: 'Const',  pattern: null },
  'regex':  { label: 'Regex',  pattern: null },
}

/**
 * Evaluates all rules against a param and returns results for each rule.
 * @param {Array} rules
 * @param {string} param
 * @returns {Array<{rule, matched: boolean, resultUrl: string|null}>}
 */
export const evaluateRules = (rules, param) =>
  rules.map((rule) => {
    let matched = false
    let resultUrl = null
    try {
      if (rule.patternType === 'const') {
        matched = param === rule.pattern
      } else {
        const regex = new RegExp(rule.pattern)
        matched = regex.test(param)
      }
      if (matched) {
        resultUrl = rule.url.replace('%s', encodeURIComponent(param))
      }
    } catch {
      matched = false
    }
    return { rule, matched, resultUrl }
  })

/**
 * Finds the first matching rule for a given command + param and returns redirect URL.
 * @param {Array} shortcuts
 * @param {string} command
 * @param {string} param
 * @returns {{ found: boolean, url: string|null }}
 */
export const resolveRedirect = (shortcuts, command, param) => {
  const shortcut = shortcuts.find((s) => s.key === command)
  if (!shortcut) return { found: false, url: null }

  const firstMatch = evaluateRules(shortcut.rules, param).find((r) => r.matched)
  return firstMatch ? { found: true, url: firstMatch.resultUrl } : { found: false, url: null }
}

// --- CRUD helpers (pure functions, return new arrays) ---

export const createShortcut = ({ key = '', name = '' } = {}) => ({
  id: uuidv4(),
  key,
  name,
  rules: [],
})

export const createRule = ({ label = '', patternType = 'number', pattern = '', url = '' } = {}) => ({
  id: uuidv4(),
  label,
  patternType,
  // preset types get their fixed pattern; const/regex use the provided pattern
  pattern: (patternType === 'const' || patternType === 'regex')
    ? pattern
    : (PATTERN_TYPES[patternType]?.pattern ?? pattern),
  url,
})

export const addShortcut = (shortcuts, data) => {
  const shortcut = createShortcut(data)
  return { shortcuts: [...shortcuts, shortcut], newId: shortcut.id }
}

export const updateShortcut = (shortcuts, id, data) =>
  shortcuts.map((s) => (s.id === id ? { ...s, ...data } : s))

export const deleteShortcut = (shortcuts, id) =>
  shortcuts.filter((s) => s.id !== id)

export const addRule = (shortcuts, shortcutId, ruleData) =>
  shortcuts.map((s) =>
    s.id !== shortcutId ? s : { ...s, rules: [...s.rules, createRule(ruleData)] }
  )

export const updateRule = (shortcuts, shortcutId, ruleId, data) =>
  shortcuts.map((s) =>
    s.id !== shortcutId
      ? s
      : { ...s, rules: s.rules.map((r) => (r.id === ruleId ? { ...r, ...data } : r)) }
  )

export const deleteRule = (shortcuts, shortcutId, ruleId) =>
  shortcuts.map((s) =>
    s.id !== shortcutId ? s : { ...s, rules: s.rules.filter((r) => r.id !== ruleId) }
  )

export const reorderRules = (shortcuts, shortcutId, newRules) =>
  shortcuts.map((s) => (s.id !== shortcutId ? s : { ...s, rules: newRules }))

export const duplicateShortcut = (shortcuts, id) => {
  const src = shortcuts.find((s) => s.id === id)
  if (!src) return shortcuts
  const copy = {
    ...createShortcut({ key: `${src.key}-copy`, name: src.name ? `${src.name} (copy)` : '' }),
    rules: src.rules.map((r) => ({ ...r, id: uuidv4() })),
  }
  const idx = shortcuts.findIndex((s) => s.id === id)
  const result = [...shortcuts]
  result.splice(idx + 1, 0, copy)
  return result
}
