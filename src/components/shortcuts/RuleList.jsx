import { useState, useRef, forwardRef, useImperativeHandle } from 'react'
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
import { IconArrowRight } from '../shared/icons'

// ── Pattern helpers ───────────────────────────────────────────────────────────
const PRESET_PATTERNS = {
  '^\\d+$': { patternType: 'is-number', label: PATTERN_TYPES['is-number'].label },
  '^\\w+$': { patternType: 'is-word',   label: PATTERN_TYPES['is-word'].label },
  '.*':     { patternType: 'is-any',    label: PATTERN_TYPES['is-any'].label },
}

// ── Auto-expanding pending rows for adding new rules ─────────────────────────
const PendingRows = ({ onAdd }) => {
  const rowIdRef = useRef(1)
  const newId = () => ++rowIdRef.current

  const [rows, setRows] = useState([{ id: 0, pattern: '', url: '' }])

  const handleChange = (id, field, value) => {
    setRows((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
      // When the last row gets any content → append a fresh empty row
      const changedIdx = next.findIndex((r) => r.id === id)
      const isLast = changedIdx === next.length - 1
      const row = next[changedIdx]
      if (isLast && (row.pattern || row.url)) {
        return [...next, { id: newId(), pattern: '', url: '' }]
      }
      return next
    })
  }

  const commitRow = (id) => {
    setRows((prev) => {
      const row = prev.find((r) => r.id === id)
      if (!row?.url.trim()) return prev
      const preset = PRESET_PATTERNS[row.pattern]
      onAdd({
        pattern: row.pattern,
        url: row.url,
        patternType: preset?.patternType ?? 'custom',
        label: preset?.label ?? '',
      })
      const filtered = prev.filter((r) => r.id !== id)
      // Always keep at least one empty row at the bottom
      const last = filtered[filtered.length - 1]
      if (!last || last.pattern || last.url) {
        return [...filtered, { id: newId(), pattern: '', url: '' }]
      }
      return filtered
    })
  }

  const clearRow = (id) => {
    setRows((prev) => {
      const row = prev.find((r) => r.id === id)
      if (!row) return prev
      // If row has content → clear it; if already empty → remove it (keep ≥1)
      if (row.pattern || row.url) {
        return prev.map((r) => (r.id === id ? { ...r, pattern: '', url: '' } : r))
      }
      if (prev.length === 1) return prev
      const filtered = prev.filter((r) => r.id !== id)
      const last = filtered[filtered.length - 1]
      if (!last || last.pattern || last.url) {
        return [...filtered, { id: newId(), pattern: '', url: '' }]
      }
      return filtered
    })
  }

  return (
    <div className="pending-rows">
      {rows.map((row) => {
        const handleKeyDown = (e) => {
          if (e.key === 'Enter') { e.preventDefault(); commitRow(row.id) }
          if (e.key === 'Escape') clearRow(row.id)
        }
        return (
          <div key={row.id} className="rule-phantom-wrap">
            <div className="rule-form">
              <div className="rule-form-row">
                <input
                  className="input input-ghost"
                  placeholder="regex…"
                  value={row.pattern}
                  onChange={(e) => handleChange(row.id, 'pattern', e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <span className="rule-form-arrow"><IconArrowRight /></span>
                <input
                  className="input input-ghost"
                  placeholder="https://example.com/%s"
                  value={row.url}
                  onChange={(e) => handleChange(row.id, 'url', e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export const RuleList = forwardRef(({
  rules,
  testResults,
  locked,
  onLockedClick,
  onReorder,
  onAdd,
  onUpdate,
  onDelete,
  onEditingChange,
}, ref) => {
  const [editingId, setEditingId] = useState(null)
  const editingRowRef = useRef(null)

  const handleSetEditing = (id) => {
    setEditingId(id)
    onEditingChange?.(id !== null)
  }

  useImperativeHandle(ref, () => ({
    saveEditing: () => editingRowRef.current?.save(),
    cancelEditing: () => handleSetEditing(null),
  }))

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
          {rules.map((rule) => (
            <RuleRow
              key={rule.id}
              ref={editingId === rule.id ? editingRowRef : null}
              rule={rule}
              matchResult={testResults ? (testResults[rule.id] ?? null) : null}
              locked={locked}
              onLockedClick={onLockedClick}
              isEditing={editingId === rule.id}
              onEdit={() => handleSetEditing(rule.id)}
              onSave={(data) => { onUpdate(rule.id, data); handleSetEditing(null) }}
              onCancel={() => handleSetEditing(null)}
              onDelete={() => onDelete(rule.id)}
            />
          ))}
        </SortableContext>
      </DndContext>

      {!locked && <PendingRows onAdd={onAdd} />}
    </div>
  )
})

RuleList.displayName = 'RuleList'
