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

// ── Preset chips ──────────────────────────────────────────────────────────────
const PRESETS = [
  { key: 'is-number', label: 'number',   pattern: '^\\d+$' },
  { key: 'is-word',   label: 'word',     pattern: '^\\w+$' },
  { key: 'is-any',    label: 'anything', pattern: '.*' },
]

const detectPreset = (pattern) =>
  PRESETS.find((p) => p.pattern === pattern)?.key ?? null

// ── Shared form for phantom row and (optionally) edit mode ───────────────────
const RuleForm = ({ initPattern = '', initUrl = '', onSave, onCancel }) => {
  const [pattern, setPattern] = useState(initPattern)
  const [url, setUrl] = useState(initUrl)

  const activePreset = detectPreset(pattern)

  const handleSave = () => {
    if (!url.trim()) return
    const presetKey = detectPreset(pattern)
    onSave({
      pattern,
      url,
      patternType: presetKey ?? 'custom',
      label: presetKey ? PATTERN_TYPES[presetKey].label : '',
    })
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
        <div style={{ padding: '0 8px 6px' }}>
          <button className="btn btn-ghost btn-sm" type="button" onClick={onCancel}>cancel</button>
        </div>
      )}
    </div>
  )
}

// ── Phantom always-visible add row ────────────────────────────────────────────
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
export const RuleList = ({
  rules,
  testResults,
  locked,
  onLockedClick,
  onReorder,
  onAdd,
  onUpdate,
  onDelete,
}) => {
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

  // Exclude editing row from sortable to avoid dnd interference
  const sortableIds = editingId
    ? rules.map((r) => r.id).filter((id) => id !== editingId)
    : rules.map((r) => r.id)

  return (
    <div className="rule-table">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
          {rules.map((rule) => (
            <RuleRow
              key={rule.id}
              rule={rule}
              matchResult={testResults ? (testResults[rule.id] ?? null) : null}
              locked={locked}
              onLockedClick={onLockedClick}
              isEditing={editingId === rule.id}
              onEdit={() => setEditingId(rule.id)}
              onSave={(data) => { onUpdate(rule.id, data); setEditingId(null) }}
              onCancel={() => setEditingId(null)}
              onDelete={() => onDelete(rule.id)}
            />
          ))}
        </SortableContext>
      </DndContext>

      {!locked && <PhantomRow onAdd={onAdd} />}
    </div>
  )
}
