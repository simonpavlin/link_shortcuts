import { useState, useEffect, useRef } from 'react'
import { PATTERN_TYPES } from '../../utils/go.utils'
import { IconChevronDown } from '../shared/icons'
import type { PatternTypeName } from '../../utils/go.utils'

const PRESET_OPTIONS: PatternTypeName[] = ['number', 'string', 'url', 'empty', 'const', 'regex']

type Props = {
  patternType: PatternTypeName | null
  pattern: string
  onChange: (val: { patternType: PatternTypeName; pattern: string }) => void
  onKeyDown?: (e: React.KeyboardEvent) => void
  autoFocus?: boolean
}

export const PatternField = ({ patternType, pattern, onChange, onKeyDown, autoFocus }: Props) => {
  const [open, setOpen] = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)

  // null = placeholder (no type chosen yet); unknown legacy keys fall back to 'regex'
  const isPlaceholder = patternType == null
  const effectiveType = isPlaceholder ? null : (PATTERN_TYPES[patternType] ? patternType : 'regex')
  const isCustom = effectiveType === 'const' || effectiveType === 'regex'

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (!dropRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleTypeSelect = (type: PatternTypeName) => {
    setOpen(false)
    if (type === 'const' || type === 'regex') {
      onChange({ patternType: type, pattern: '' })
    } else {
      onChange({ patternType: type, pattern: PATTERN_TYPES[type].pattern! })
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
          onChange={(e) => onChange({ patternType: effectiveType!, pattern: e.target.value })}
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
        <span className="pattern-badge-label">{PATTERN_TYPES[effectiveType!]?.label ?? effectiveType}</span>
        <IconChevronDown />
      </button>
      {open && menu}
    </div>
  )
}
