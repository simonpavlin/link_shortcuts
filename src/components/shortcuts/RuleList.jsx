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
import { RuleRow } from './RuleRow'
import { IconArrowRight, IconCheck } from '../shared/icons'

// ── Preset chips config ───────────────────────────────────────────────────────
const PRESETS = [
  { key: 'is-number', label: 'number', pattern: '^\\d+$' },
  { key: 'is-word',   label: 'word',   pattern: '^\\w+$' },
  { key: 'is-any',    label: 'anything', pattern: '.*' },
]

const detectPreset = (pattern) =>
  PRESETS.find((p) => p.pattern === pattern)?.key ?? null

// ── Shared form (phantom row + edit mode) ─────────────────────────────────────
const RuleForm = ({ initPattern = '', initUrl = '', onSave, onCancel }) => {
  const [pattern, setPattern] = useState(initPattern)
  const [url, setUrl] = useState(initUrl)

  const activePreset = detectPreset(pattern)

  const handleSave = () => {
    if (!url.trim()) return
    const presetKey = detectPreset(pattern)
    const patternType = presetKey ?? 'custom'
    const label = presetKey ? PATTERN_TYPES[presetKey].label : ''
    onSave({ pattern, url, patternType, label })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleSave() }
    if (e.key === 'Escape' && onCancel) onCancel()
  }

  return (
    <div className="rule-form">
      <div className="preset-chips">
        {PRESETS.map((p) => (
          <button
            key={p.key}
            type="button"
            className={`preset-chip${activePreset === p.key ? ' active' : ''}`}
            onClick={() => setPattern(p.pattern)}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="rule-form-row">
        <input
          className="input input-ghost"
          placeholder="regex…"
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <span className="rule-form-arrow"><IconArrowRight /></span>
        <input
          className="input input-ghost"
          placeholder="https://example.com/%s"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="icon-btn" type="button" onClick={handleSave} title="Save rule">
          <IconCheck />
        </button>
      </div>
      {onCancel && (
        <div className="form-actions" style={{ paddingBottom: 4 }}>
          <button className="btn btn-ghost btn-sm" type="button" onClick={onCancel}>cancel</button>
        </div>
      )}
    </div>
  )
}

// ── Phantom always-visible add row ───────────────────────────────────────────
const PhantomRow = ({ onAdd }) => {
  const [resetKey, setResetKey] = useState(0)

  const handleSave = (data) => {
    onAdd(data)
    setResetKey((k) => k + 1)
  }

  return (
    <div className="rule-phantom-wrap">
      <RuleForm key={resetKey} onSave={handleSave} />
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export const RuleList = ({ rules, onReorder, onAdd, onUpdate, onDelete }) => {
  const [editingId, setEditingId] = useState(null)

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

  const sortableIds = editingId
    ? rules.map((r) => r.id).filter((id) => id !== editingId)
    : rules.map((r) => r.id)

  return (
    <div className="rule-table">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
          {rules.map((rule) =>
            editingId === rule.id ? (
              <div key={`edit-${rule.id}`} className="rule-edit-wrap">
                <RuleForm
                  initPattern={rule.pattern}
                  initUrl={rule.url}
                  onSave={(data) => { onUpdate(rule.id, data); setEditingId(null) }}
                  onCancel={() => setEditingId(null)}
                />
              </div>
            ) : (
              <RuleRow
                key={rule.id}
                rule={rule}
                onEdit={() => setEditingId(rule.id)}
                onDelete={() => onDelete(rule.id)}
              />
            )
          )}
        </SortableContext>
      </DndContext>

      <PhantomRow onAdd={onAdd} />
    </div>
  )
}
