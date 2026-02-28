import { useState, useEffect, useRef, useCallback } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { PATTERN_TYPES } from '../../utils/go.utils'
import { PatternField } from './PatternField'
import { DeleteConfirm } from '../shared/DeleteConfirm'
import { IconDrag, IconArrowRight, IconCheck, IconX, IconMinus } from '../shared/icons'
import type { GoRule, GoRuleResult, PatternTypeName } from '../../utils/go.utils'

type Props = {
  rule: GoRule
  matchResult: GoRuleResult | null
  testParam: string
  testIndex: number
  onSave: (data: { pattern: string; url: string; patternType: PatternTypeName; label: string }) => void
  onDelete: () => void
}

export const GoRuleRow = ({
  rule,
  matchResult,
  testParam,
  testIndex,
  onSave,
  onDelete,
}: Props) => {
  const [editPatternType, setEditPatternType] = useState<PatternTypeName>(rule.patternType ?? 'regex')
  const [editPattern, setEditPattern]         = useState(rule.pattern)
  const [editUrl, setEditUrl]                 = useState(rule.url)

  const editPatternTypeRef = useRef<PatternTypeName>(rule.patternType ?? 'regex')
  const editPatternRef     = useRef(rule.pattern)
  const editUrlRef         = useRef(rule.url)
  const onSaveRef          = useRef(onSave)
  const cancelledRef       = useRef(false)
  useEffect(() => { onSaveRef.current = onSave }, [onSave])

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: rule.id })

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 1 : undefined,
  }

  const doSave = useCallback(() => {
    if (!editUrlRef.current.trim()) return
    onSaveRef.current({
      pattern: editPatternRef.current,
      url: editUrlRef.current,
      patternType: editPatternTypeRef.current,
      label: PATTERN_TYPES[editPatternTypeRef.current]?.label ?? '',
    })
  }, [])

  const handlePatternChange = ({ patternType, pattern }: { patternType: PatternTypeName; pattern: string }) => {
    setEditPatternType(patternType)
    editPatternTypeRef.current = patternType
    setEditPattern(pattern)
    editPatternRef.current = pattern
  }

  const handleUrlChange = (v: string) => { setEditUrl(v); editUrlRef.current = v }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || ((e.ctrlKey || e.metaKey) && e.key === 's')) { e.preventDefault(); doSave() }
    if (e.key === 'Escape') {
      cancelledRef.current = true
      const pt: PatternTypeName = rule.patternType ?? 'regex'
      setEditPatternType(pt); editPatternTypeRef.current = pt
      setEditPattern(rule.pattern); editPatternRef.current = rule.pattern
      setEditUrl(rule.url); editUrlRef.current = rule.url
    }
  }

  const handleContainerBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (e.currentTarget.contains(e.relatedTarget)) return
    if (cancelledRef.current) { cancelledRef.current = false; return }
    doSave()
  }

  // First col: testing → check/x/minus, default → drag handle
  const firstCol = () => {
    if (matchResult !== null) {
      const delay = { animationDelay: `${testIndex * 0.07}s` }
      const animKey = `${testParam}-${rule.id}`
      if (matchResult.matched)
        return <span key={animKey} className="rule-match-yes" style={delay}><IconCheck /></span>
      if (matchResult.skipped)
        return <span key={animKey} className="rule-match-skip" style={delay}><IconMinus /></span>
      return <span key={animKey} className="rule-match-no" style={delay}><IconX /></span>
    }
    return (
      <span
        className="rule-drag-handle"
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        title="Drag to reorder"
      >
        <IconDrag />
      </span>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rule-row${isDragging ? ' dragging' : ''}`}
    >
      {firstCol()}

      <div className="rule-edit-fields" onBlur={handleContainerBlur}>
        <PatternField
          patternType={editPatternType}
          pattern={editPattern}
          onChange={handlePatternChange}
          onKeyDown={handleKeyDown}
        />
        <span className="rule-form-arrow"><IconArrowRight /></span>
        <input
          className="rule-input-url"
          value={editUrl}
          onChange={(e) => handleUrlChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="https://example.com/%s"
        />
      </div>

      <DeleteConfirm
        className="rule-row-actions"
        onDelete={onDelete}
        stopPropagation
      />
    </div>
  )
}
