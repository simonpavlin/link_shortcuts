import { useState, useEffect } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { PATTERN_TYPES } from '../../utils/shortcuts.utils'
import { IconDrag, IconPencil, IconTrash, IconArrowRight, IconCheck, IconMinus } from '../shared/icons'

const PRESET_PATTERNS = {
  '^\\d+$': { patternType: 'is-number', label: PATTERN_TYPES['is-number'].label },
  '^\\w+$': { patternType: 'is-word',   label: PATTERN_TYPES['is-word'].label },
  '.*':     { patternType: 'is-any',    label: PATTERN_TYPES['is-any'].label },
}

export const RuleRow = ({
  rule,
  matchResult,
  locked,
  onLockedClick,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
}) => {
  const [editPattern, setEditPattern] = useState(rule.pattern)
  const [editUrl, setEditUrl] = useState(rule.url)

  // Sync form state when editing starts
  useEffect(() => {
    if (isEditing) {
      setEditPattern(rule.pattern)
      setEditUrl(rule.url)
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

  const handleSave = () => {
    if (!editUrl.trim()) return
    const preset = PRESET_PATTERNS[editPattern]
    onSave({
      pattern: editPattern,
      url: editUrl,
      patternType: preset?.patternType ?? 'custom',
      label: preset?.label ?? '',
    })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleSave() }
    if (e.key === 'Escape') onCancel()
  }

  const handleEdit = () => locked ? onLockedClick() : onEdit()
  const handleDelete = () => locked ? onLockedClick() : onDelete()

  // First column: editing → empty, testing → ✓/✗, default → drag handle
  const firstCol = () => {
    if (isEditing) return <span />
    if (matchResult !== null) {
      return matchResult.matched
        ? <span className="rule-match-yes"><IconCheck /></span>
        : <span className="rule-match-no"><IconMinus /></span>
    }
    return (
      <span className="rule-drag-handle" {...attributes} {...listeners} title="Drag to reorder">
        <IconDrag />
      </span>
    )
  }

  // URL column: editing → input, matched → link with resolved URL, default → muted text
  const urlCol = () => {
    if (isEditing) {
      return (
        <input
          className="rule-input-url"
          value={editUrl}
          onChange={(e) => setEditUrl(e.target.value)}
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
      className={`rule-row${isDragging ? ' dragging' : ''}${isEditing ? ' editing' : ''}`}
    >
      {firstCol()}

      {isEditing ? (
        <input
          className="rule-input-pattern"
          value={editPattern}
          onChange={(e) => setEditPattern(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      ) : (
        <span className="rule-pattern-text">{rule.pattern}</span>
      )}

      <span className="rule-arrow-icon"><IconArrowRight /></span>

      {urlCol()}

      <div className="rule-row-actions">
        {isEditing ? (
          <>
            <button className="icon-btn" onClick={handleSave} title="Save"><IconCheck /></button>
            <button className="icon-btn" onClick={onCancel} title="Cancel"><IconMinus /></button>
          </>
        ) : (
          <>
            <button className="icon-btn" onClick={handleEdit} title="Edit"><IconPencil /></button>
            <button className="icon-btn danger" onClick={handleDelete} title="Delete"><IconTrash /></button>
          </>
        )}
      </div>
    </div>
  )
}
