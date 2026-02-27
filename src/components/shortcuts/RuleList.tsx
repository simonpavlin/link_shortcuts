import { useState, useRef } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { PATTERN_TYPES } from '../../utils/shortcuts.utils'
import { RuleRow, PatternField } from './RuleRow'
import { IconArrowRight } from '../shared/icons'
import type { Rule, RuleResult, PatternTypeName } from '../../utils/shortcuts.utils'

type PendingRow = {
  id: number
  patternType: PatternTypeName | null
  pattern: string
  url: string
}

const makeEmpty = (newId: () => number): PendingRow => ({
  id: newId(),
  patternType: null,
  pattern: '',
  url: '',
})

// ── Auto-expanding pending rows for adding new rules ─────────────────────────
type PendingRowsProps = {
  onAdd: (data: { pattern: string; url: string; patternType: PatternTypeName; label: string }) => void
}

const PendingRows = ({ onAdd }: PendingRowsProps) => {
  const rowIdRef = useRef(1)
  const newId = () => ++rowIdRef.current

  const [rows, setRows] = useState<PendingRow[]>([{ id: 0, patternType: null, pattern: '', url: '' }])

  const handleUrlChange = (id: number, value: string) => {
    setRows((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, url: value } : r))
      const changedIdx = next.findIndex((r) => r.id === id)
      const isLast = changedIdx === next.length - 1
      if (isLast && value) return [...next, makeEmpty(newId)]
      return next
    })
  }

  const handlePatternChange = (id: number, { patternType, pattern }: { patternType: PatternTypeName; pattern: string }) => {
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, patternType, pattern } : r))
  }

  // Read rows directly (safe in event handlers — state is current by the time events fire)
  // and call onAdd outside any state updater to avoid side-effects in render phase
  const commitRow = (id: number) => {
    const row = rows.find((r) => r.id === id)
    if (!row?.url.trim()) return

    const patternType: PatternTypeName = row.patternType ?? 'number'
    const pattern = row.pattern || (PATTERN_TYPES[patternType]?.pattern ?? '')
    onAdd({
      pattern,
      url: row.url,
      patternType,
      label: PATTERN_TYPES[patternType]?.label ?? '',
    })

    setRows((prev) => {
      const filtered = prev.filter((r) => r.id !== id)
      const last = filtered[filtered.length - 1]
      if (!last || last.url) return [...filtered, makeEmpty(newId)]
      return filtered
    })
  }

  const clearRow = (id: number) => {
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
        const handleKeyDown = (e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || ((e.ctrlKey || e.metaKey) && e.key === 's')) { e.preventDefault(); commitRow(row.id) }
          if (e.key === 'Escape') clearRow(row.id)
        }
        const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
          if (e.currentTarget.contains(e.relatedTarget)) return
          commitRow(row.id)
        }
        return (
          <div key={row.id} className="rule-phantom-wrap" onBlur={handleBlur}>
            <div className="rule-form">
              <div className="rule-form-row">
                <span />
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
type Props = {
  rules: Rule[]
  testResults: Record<string, RuleResult> | null
  testParam: string
  onReorder: (newRules: Rule[]) => void
  onAdd: (ruleData: Partial<Rule>) => void
  onUpdate: (ruleId: string, ruleData: Partial<Rule>) => void
  onDelete: (ruleId: string) => void
}

export const RuleList = ({
  rules,
  testResults,
  testParam,
  onReorder,
  onAdd,
  onUpdate,
  onDelete,
}: Props) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    const oldIndex = rules.findIndex((r) => r.id === active.id)
    const newIndex = rules.findIndex((r) => r.id === over.id)
    onReorder(arrayMove(rules, oldIndex, newIndex))
  }

  const sortableIds = rules.map((r) => r.id)

  return (
    <div className="rule-table">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
          {rules.map((rule, idx) => (
            <RuleRow
              key={rule.id}
              rule={rule}
              matchResult={testResults ? (testResults[rule.id] ?? null) : null}
              testParam={testParam}
              testIndex={idx}
              onSave={(data) => onUpdate(rule.id, data)}
              onDelete={() => onDelete(rule.id)}
            />
          ))}
        </SortableContext>
      </DndContext>

      <PendingRows onAdd={onAdd} />
    </div>
  )
}
