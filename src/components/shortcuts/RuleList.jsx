import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { PATTERN_TYPES } from '../../utils/shortcuts.utils'
import { Eyebrow } from '../shared/Eyebrow'
import { RuleRow } from './RuleRow'

// Internal inline form – not a modal
const RuleForm = ({ rule, onSave, onCancel }) => {
  const [form, setForm] = useState({
    label: rule?.label ?? '',
    patternType: rule?.patternType ?? 'is-any',
    pattern: rule?.pattern ?? '',
    url: rule?.url ?? '',
  })

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleTypeChange = (patternType) => {
    const pattern = patternType === 'custom' ? form.pattern : (PATTERN_TYPES[patternType]?.pattern ?? '')
    setForm((f) => ({ ...f, patternType, pattern }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.url.trim()) return
    if (form.patternType === 'custom' && !form.pattern.trim()) return
    onSave(form)
  }

  return (
    <div className="rule-inline-form">
      <form onSubmit={handleSubmit}>
        <div className="rule-form-top">
          <div className="field">
            <label className="field-label">Label</label>
            <input
              className="input"
              value={form.label}
              onChange={(e) => set('label', e.target.value)}
              placeholder="e.g. MR number"
              autoFocus
            />
          </div>
          <div className="field">
            <label className="field-label">Condition</label>
            <select
              className="input"
              value={form.patternType}
              onChange={(e) => handleTypeChange(e.target.value)}
            >
              {Object.entries(PATTERN_TYPES).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {form.patternType !== 'custom' && (
          <p className="pattern-hint">
            pattern: <code>{PATTERN_TYPES[form.patternType]?.pattern}</code>
          </p>
        )}

        {form.patternType === 'custom' && (
          <div className="field">
            <label className="field-label">Pattern</label>
            <input
              className="input"
              value={form.pattern}
              onChange={(e) => set('pattern', e.target.value)}
              placeholder="e.g. ^\d{4}$"
              required
            />
          </div>
        )}

        <div className="field">
          <label className="field-label">Target URL <span style={{ color: 'var(--text-label)' }}>(%s = parameter)</span></label>
          <input
            className="input"
            value={form.url}
            onChange={(e) => set('url', e.target.value)}
            placeholder="https://example.com/%s"
            required
          />
        </div>

        <div className="form-actions" style={{ marginTop: 2 }}>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>cancel</button>
          <button type="submit" className="btn btn-primary btn-sm">save</button>
        </div>
      </form>
    </div>
  )
}

export const RuleList = ({ rules, onReorder, onAdd, onUpdate, onDelete }) => {
  const [editing, setEditing] = useState(null) // null | 'new' | rule.id string

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return
    const oldIndex = rules.findIndex((r) => r.id === active.id)
    const newIndex = rules.findIndex((r) => r.id === over.id)
    onReorder(arrayMove(rules, oldIndex, newIndex))
  }

  const handleSave = (formData) => {
    if (editing === 'new') {
      onAdd(formData)
    } else {
      onUpdate(editing, formData)
    }
    setEditing(null)
  }

  // Exclude the rule being edited from sortable (it renders as a form, not a draggable)
  const editingRuleId = editing && editing !== 'new' ? editing : null
  const sortableIds = rules.map((r) => r.id).filter((id) => id !== editingRuleId)

  return (
    <div className="detail-section">
      <div className="section-header-row">
        <Eyebrow>Rules</Eyebrow>
        {editing !== 'new' && (
          <button className="btn btn-ghost btn-sm" onClick={() => setEditing('new')}>
            + add
          </button>
        )}
      </div>

      <div className="rule-table">
        {rules.length > 0 && (
          <div className="rule-table-head">
            <span />
            <span>label</span>
            <span>pattern</span>
            <span>target url</span>
            <span />
          </div>
        )}

        {rules.length === 0 && editing !== 'new' && (
          <p className="rule-empty">No rules yet. Add your first rule.</p>
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
            {rules.map((rule) =>
              editing === rule.id ? (
                <RuleForm
                  key={`form-${rule.id}`}
                  rule={rule}
                  onSave={handleSave}
                  onCancel={() => setEditing(null)}
                />
              ) : (
                <RuleRow
                  key={rule.id}
                  rule={rule}
                  onEdit={() => setEditing(rule.id)}
                  onDelete={() => onDelete(rule.id)}
                />
              )
            )}
          </SortableContext>
        </DndContext>

        {editing === 'new' && (
          <RuleForm onSave={handleSave} onCancel={() => setEditing(null)} />
        )}
      </div>
    </div>
  )
}
