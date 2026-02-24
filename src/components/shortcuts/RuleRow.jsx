import { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { PATTERN_TYPES } from '../../utils/shortcuts.utils'
import { IconDrag, IconTrash, IconArrowRight, IconCheck, IconMinus } from '../shared/icons'

const PRESET_PATTERNS = {
  '^\\d+$': { patternType: 'is-number', label: PATTERN_TYPES['is-number'].label },
  '^\\w+$': { patternType: 'is-word',   label: PATTERN_TYPES['is-word'].label },
  '.*':     { patternType: 'is-any',    label: PATTERN_TYPES['is-any'].label },
}

export const RuleRow = forwardRef(({
  rule,
  matchResult,
  locked,
  onLockedClick,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
}, ref) => {
  const [editPattern, setEditPattern] = useState(rule.pattern)
  const [editUrl, setEditUrl] = useState(rule.url)

  // Refs so the imperative save() never reads stale closure values
  const editPatternRef = useRef(rule.pattern)
  const editUrlRef = useRef(rule.url)
  const onSaveRef = useRef(onSave)
  useEffect(() => { onSaveRef.current = onSave }, [onSave])

  // Sync edit state when editing starts
  useEffect(() => {
    if (isEditing) {
      setEditPattern(rule.pattern)
      setEditUrl(rule.url)
      editPatternRef.current = rule.pattern
      editUrlRef.current = rule.url
    }
  }, [isEditing, rule.pattern, rule.url])

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: rule.id })

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 1 : undefined,
  }

  // Stable save function – reads from refs so it's safe to expose via imperative handle
  const doSave = useCallback(() => {
    if (!editUrlRef.current.trim()) return
    const preset = PRESET_PATTERNS[editPatternRef.current]
    onSaveRef.current({
      pattern: editPatternRef.current,
      url: editUrlRef.current,
      patternType: preset?.patternType ?? 'custom',
      label: preset?.label ?? '',
    })
  }, [])

  useImperativeHandle(ref, () => ({ save: doSave }), [doSave])

  const handlePatternChange = (v) => { setEditPattern(v); editPatternRef.current = v }
  const handleUrlChange = (v) => { setEditUrl(v); editUrlRef.current = v }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); doSave() }
    if (e.key === 'Escape') onCancel()
  }

  const handleRowClick = () => {
    if (isEditing) return
    if (locked) { onLockedClick(); return }
    onEdit()
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    if (locked) { onLockedClick(); return }
    onDelete()
  }

  // First col: editing → empty, testing → ✓/✗, default → drag handle
  const firstCol = () => {
    if (isEditing) return <span />
    if (matchResult !== null) {
      return matchResult.matched
        ? <span className="rule-match-yes"><IconCheck /></span>
        : <span className="rule-match-no"><IconMinus /></span>
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

  // URL col: editing → input, matched → link, default → muted text
  const urlCol = () => {
    if (isEditing) {
      return (
        <input
          className="rule-input-url"
          value={editUrl}
          onChange={(e) => handleUrlChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="https://example.com/%s"
        />
      )
    }
    if (matchResult?.matched && matchResult.resultUrl) {
      return (
        <a
          href={matchResult.resultUrl}
          className="rule-url-text matched"
          target="_blank"
          rel="noopener noreferrer"
          title={matchResult.resultUrl}
          onClick={(e) => e.stopPropagation()}
        >
          {matchResult.resultUrl}
        </a>
      )
    }
    return <span className="rule-url-text">{rule.url}</span>
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rule-row${isDragging ? ' dragging' : ''}${isEditing ? ' editing' : ''}${!isEditing && !locked ? ' rule-row-clickable' : ''}`}
      onClick={handleRowClick}
    >
      {firstCol()}

      {isEditing ? (
        <input
          className="rule-input-pattern"
          value={editPattern}
          onChange={(e) => handlePatternChange(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      ) : (
        <span className="rule-pattern-text">{rule.pattern}</span>
      )}

      <span className="rule-arrow-icon"><IconArrowRight /></span>

      {urlCol()}

      <div className="rule-row-actions" onClick={(e) => e.stopPropagation()}>
        {!isEditing && (
          <button className="icon-btn danger" onClick={handleDelete} title="Delete"><IconTrash /></button>
        )}
      </div>
    </div>
  )
})

RuleRow.displayName = 'RuleRow'
