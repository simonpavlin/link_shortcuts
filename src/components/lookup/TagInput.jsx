import { useState, useRef } from 'react'
import { TagBadge } from './TagBadge'

export const TagInput = ({ tags, onChange, suggestions = [], placeholder = 'Add tags…' }) => {
  const [input, setInput] = useState('')
  const [open, setOpen] = useState(false)
  const inputRef = useRef(null)

  const addTag = (raw) => {
    const tag = raw.trim().toLowerCase()
    if (!tag || tags.includes(tag)) { setInput(''); return }
    onChange([...tags, tag])
    setInput('')
  }

  const removeTag = (tag) => onChange(tags.filter((t) => t !== tag))

  const filtered = suggestions.filter(
    (s) => !tags.includes(s) && s.toLowerCase().includes(input.toLowerCase())
  )

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(input) }
    if (e.key === 'Backspace' && !input && tags.length) removeTag(tags[tags.length - 1])
    if (e.key === 'Escape') setOpen(false)
  }

  return (
    <div className="tag-input-wrap">
      <div className="tag-input-box" onClick={() => inputRef.current?.focus()}>
        {tags.map((tag) => (
          <TagBadge key={tag} tag={tag} onRemove={() => removeTag(tag)} />
        ))}
        <input
          ref={inputRef}
          className="tag-input-field"
          value={input}
          onChange={(e) => { setInput(e.target.value); setOpen(true) }}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={tags.length === 0 ? placeholder : ''}
        />
      </div>
      {open && filtered.length > 0 && (
        <div className="tag-dropdown">
          {filtered.map((s) => (
            <button
              key={s}
              className="tag-dropdown-item"
              type="button"
              onMouseDown={(e) => { e.preventDefault(); addTag(s) }}
            >
              <TagBadge tag={s} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
