import { useState, useRef } from 'react'
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
import { RuleRow, PatternField } from './RuleRow'
import { IconArrowRight } from '../shared/icons'

const DEFAULT_PT = 'number'

const makeEmpty = (newId) => ({
  id: newId(),
  patternType: DEFAULT_PT,
  pattern: PATTERN_TYPES[DEFAULT_PT].pattern,
  url: '',
})

// ── Auto-expanding pending rows for adding new rules ─────────────────────────
const PendingRows = ({ onAdd }) => {
  const rowIdRef = useRef(1)
  const newId = () => ++rowIdRef.current

  const [rows, setRows] = useState([{
    id: 0,
    patternType: DEFAULT_PT,
    pattern: PATTERN_TYPES[DEFAULT_PT].pattern,
    url: '',
  }])

  const handleUrlChange = (id, value) => {
    setRows((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, url: value } : r))
      const changedIdx = next.findIndex((r) => r.id === id)
      const isLast = changedIdx === next.length - 1
      if (isLast && value) return [...next, makeEmpty(newId)]
      return next
    })
  }

  const handlePatternChange = (id, { patternType, pattern }) => {
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, patternType, pattern } : r))
  }

  // Read rows directly (safe in event handlers — state is current by the time events fire)
  // and call onAdd outside any state updater to avoid side-effects in render phase
  const commitRow = (id) => {
    const row = rows.find((r) => r.id === id)
    if (!row?.url.trim()) return

    onAdd({
      pattern: row.pattern,
      url: row.url,
      patternType: row.patternType,
      label: PATTERN_TYPES[row.patternType]?.label ?? '',
    })

    setRows((prev) => {
      const filtered = prev.filter((r) => r.id !== id)
      const last = filtered[filtered.length - 1]
      if (!last || last.url) return [...filtered, makeEmpty(newId)]
      return filtered
    })
  }

  const clearRow = (id) => {
    setRows((prev) => {
      const row = prev.find((r) => r.id === id)
      if (!row) return prev
      if (row.url) {
        return prev.map((r) => (r.id === id ? { ...r, url: '' } : r))
      }
      if (prev.length === 1) return prev
      const filtered = prev.filter((r) => r.id !== id)
      const last = filtered[filtered.length - 1]
      if (!last || last.url) return [...filtered, makeEmpty(newId)]
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
                <PatternField
                  patternType={row.patternType}
                  pattern={row.pattern}
                  onChange={(val) => handlePatternChange(row.id, val)}
                  onKeyDown={handleKeyDown}
                />
                <span className="rule-form-arrow"><IconArrowRight /></span>
                <input
                  className="input input-ghost"
                  placeholder="https://example.com/%s"
                  value={row.url}
                  onChange={(e) => handleUrlChange(row.id, e.target.value)}
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

      {!locked && <PendingRows onAdd={onAdd} />}
    </div>
  )
}
