import { useState, useEffect } from 'react'
import { PATTERN_TYPES } from '../../utils/shortcuts.utils'
import { Button } from '../shared/Button'
import { Input } from '../shared/Input'

const DEFAULT_FORM = { label: '', patternType: 'is-any', pattern: '', url: '' }

export const RuleEditor = ({ rule, onSave, onCancel }) => {
  const [form, setForm] = useState(
    rule
      ? { label: rule.label, patternType: rule.patternType, pattern: rule.pattern, url: rule.url }
      : DEFAULT_FORM
  )

  // Keep pattern in sync with patternType for non-custom types
  useEffect(() => {
    if (form.patternType !== 'custom') {
      setForm((f) => ({ ...f, pattern: PATTERN_TYPES[f.patternType]?.pattern ?? '' }))
    }
  }, [form.patternType])

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.url.trim()) return
    if (form.patternType === 'custom' && !form.pattern.trim()) return
    onSave(form)
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">{rule ? 'Edit rule' : 'Add rule'}</h2>
        <form onSubmit={handleSubmit}>
          <Input
            label="Label"
            id="rule-label"
            value={form.label}
            onChange={(e) => set('label', e.target.value)}
            placeholder="e.g. MR number"
          />

          <div className="input-group">
            <label className="input-label" htmlFor="rule-pattern-type">
              Condition type
            </label>
            <select
              id="rule-pattern-type"
              className="input"
              value={form.patternType}
              onChange={(e) => set('patternType', e.target.value)}
            >
              {Object.entries(PATTERN_TYPES).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {form.patternType !== 'custom' && (
            <p className="pattern-hint">
              Pattern: <code>{PATTERN_TYPES[form.patternType]?.pattern}</code>
            </p>
          )}

          {form.patternType === 'custom' && (
            <Input
              label="Regex pattern"
              id="rule-pattern"
              value={form.pattern}
              onChange={(e) => set('pattern', e.target.value)}
              placeholder="e.g. ^\d{4}$"
              required
            />
          )}

          <Input
            label="Target URL (%s will be replaced by the parameter)"
            id="rule-url"
            value={form.url}
            onChange={(e) => set('url', e.target.value)}
            placeholder="https://example.com/%s"
            required
          />

          <div className="modal-actions">
            <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
            <Button type="submit" variant="primary">Save</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
