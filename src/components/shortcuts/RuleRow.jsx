import { useState, useEffect, useRef, useCallback } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { PATTERN_TYPES } from '../../utils/shortcuts.utils'
import { IconDrag, IconTrash, IconArrowRight, IconCheck, IconMinus, IconChevronDown } from '../shared/icons'

const PRESET_OPTIONS = ['number', 'string', 'url', 'const', 'regex']

// ── PatternField ──────────────────────────────────────────────────────────────
// Dropdown for preset types; switches to text field for 'const' and 'regex'.
export const PatternField = ({ patternType, pattern, onChange, onKeyDown, autoFocus }) => {
  const [open, setOpen] = useState(false)
  const dropRef = useRef(null)

  // null = placeholder (no type chosen yet); unknown legacy keys fall back to 'regex'
  const isPlaceholder = patternType == null
  const effectiveType = isPlaceholder ? null : (PATTERN_TYPES[patternType] ? patternType : 'regex')
  const isCustom = effectiveType === 'const' || effectiveType === 'regex'

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (!dropRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleTypeSelect = (type) => {
    setOpen(false)
    if (type === 'const' || type === 'regex') {
      onChange({ patternType: type, pattern: '' })
    } else {
      onChange({ patternType: type, pattern: PATTERN_TYPES[type].pattern })
    }
  }

  const menu = (
    <div className="pattern-dropdown-menu">
      {PRESET_OPTIONS.map((t) => (
        <button
          key={t}
          type="button"
          className={`pattern-dropdown-item${t === effectiveType ? ' active' : ''}`}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => handleTypeSelect(t)}
        >
          {PATTERN_TYPES[t].label}
        </button>
      ))}
    </div>
  )

  if (isPlaceholder) {
    return (
      <div ref={dropRef} className="pattern-field-wrap pattern-field-preset">
        <button
          type="button"
          className="pattern-type-badge pattern-type-placeholder"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="pattern-badge-label">Select Rule</span>
          <IconChevronDown />
        </button>
        {open && menu}
      </div>
    )
  }

  if (isCustom) {
    return (
      <div ref={dropRef} className="pattern-field-wrap pattern-field-custom">
        <input
          className="rule-input-pattern"
          value={pattern}
          onChange={(e) => onChange({ patternType: effectiveType, pattern: e.target.value })}
          onKeyDown={onKeyDown}
          placeholder={effectiveType === 'const' ? 'exact value…' : 'regex…'}
          autoFocus={autoFocus}
        />
        <button
          type="button"
          className="pattern-type-chevron"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setOpen((o) => !o)}
          title="Change type"
        >
          <IconChevronDown />
        </button>
        {open && menu}
      </div>
    )
  }

  return (
    <div ref={dropRef} className="pattern-field-wrap pattern-field-preset">
      <button
        type="button"
        className="pattern-type-badge"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="pattern-badge-label">{PATTERN_TYPES[effectiveType]?.label ?? effectiveType}</span>
        <IconChevronDown />
      </button>
      {open && menu}
    </div>
  )
}

// ── RuleRow ───────────────────────────────────────────────────────────────────
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
  const [editPatternType, setEditPatternType] = useState(rule.patternType ?? 'regex')
  const [editPattern, setEditPattern]         = useState(rule.pattern)
  const [editUrl, setEditUrl]                 = useState(rule.url)
  const [confirmDelete, setConfirmDelete]     = useState(false)

  // Refs so doSave never reads stale closure values
  const editPatternTypeRef = useRef(rule.patternType ?? 'regex')
  const editPatternRef     = useRef(rule.pattern)
  const editUrlRef         = useRef(rule.url)
  const onSaveRef          = useRef(onSave)
  const cancelledRef       = useRef(false)
  useEffect(() => { onSaveRef.current = onSave }, [onSave])

  // Sync edit state when editing starts
  useEffect(() => {
    if (isEditing) {
      const pt = rule.patternType ?? 'regex'
      setEditPatternType(pt)
      setEditPattern(rule.pattern)
      setEditUrl(rule.url)
      editPatternTypeRef.current = pt
      editPatternRef.current = rule.pattern
      editUrlRef.current = rule.url
      cancelledRef.current = false
    }
  }, [isEditing, rule.patternType, rule.pattern, rule.url])

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

  const handlePatternChange = ({ patternType, pattern }) => {
    setEditPatternType(patternType)
    editPatternTypeRef.current = patternType
    setEditPattern(pattern)
    editPatternRef.current = pattern
  }

  const handleUrlChange = (v) => { setEditUrl(v); editUrlRef.current = v }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || ((e.ctrlKey || e.metaKey) && e.key === 's')) { e.preventDefault(); doSave() }
    if (e.key === 'Escape') { cancelledRef.current = true; onCancel() }
  }

  // Auto-save when focus leaves the edit container entirely
  const handleContainerBlur = (e) => {
    if (e.currentTarget.contains(e.relatedTarget)) return
    if (cancelledRef.current) { cancelledRef.current = false; return }
    doSave()
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

  // Pattern display in non-edit mode
  const patternDisplay = () => {
    const pt = rule.patternType
    if (pt === 'const') {
      return <span className="rule-pattern-text rule-pattern-const">&quot;{rule.pattern}&quot;</span>
    }
    if (pt === 'regex') {
      return <span className="rule-pattern-text rule-pattern-const">{rule.pattern}</span>
    }
    const meta = PATTERN_TYPES[pt]
    if (meta) {
      return (
        <span className="rule-pattern-text rule-pattern-preset">
          <span className="pattern-badge-label">{meta.label}</span>
        </span>
      )
    }
    return <span className="rule-pattern-text">{rule.pattern}</span>
  }

  // URL col in non-edit mode
  const urlCol = () => {
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

      {/* Cols 2-4: a single wrapper div when editing so onBlur can cover all fields */}
      {isEditing ? (
        <div className="rule-edit-fields" onBlur={handleContainerBlur}>
          <PatternField
            patternType={editPatternType}
            pattern={editPattern}
            onChange={handlePatternChange}
            onKeyDown={handleKeyDown}
            autoFocus
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
      ) : (
        <>
          {patternDisplay()}
          <span className="rule-arrow-icon"><IconArrowRight /></span>
          {urlCol()}
        </>
      )}

      <div
        className="rule-row-actions"
        style={confirmDelete ? { opacity: 1 } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        {!isEditing && (
          confirmDelete ? (
            <div className="confirm-delete-inline">
              <span className="confirm-text">Delete?</span>
              <button className="btn-yes" onClick={handleDelete}>Yes</button>
              <button className="btn-no" onClick={(e) => { e.stopPropagation(); setConfirmDelete(false) }}>No</button>
            </div>
          ) : (
            <button
              className="icon-btn danger"
              onClick={(e) => { e.stopPropagation(); setConfirmDelete(true) }}
              title="Delete"
            >
              <IconTrash />
            </button>
          )
        )}
      </div>
    </div>
  )
}
