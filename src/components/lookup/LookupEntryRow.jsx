import { useState } from 'react'
import { TagBadge } from './TagBadge'
import { TagInput } from './TagInput'
import { IconTrash, IconCheck } from '../shared/icons'

export const LookupEntryRow = ({ entry, allTags, onUpdate, onDelete }) => {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(null)

  const startEdit = () => {
    setForm({ description: entry.description, tags: [...entry.tags], url: entry.url })
    setEditing(true)
  }

  const commit = () => {
    if (!form) return
    onUpdate(entry.id, form)
    setEditing(false)
    setForm(null)
  }

  const cancel = () => {
    setEditing(false)
    setForm(null)
  }

  if (editing && form) {
    return (
      <div className="lookup-entry-edit">
        <input
          className="input"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Description"
          autoFocus
        />
        <TagInput
          tags={form.tags}
          onChange={(tags) => setForm((f) => ({ ...f, tags }))}
          suggestions={allTags}
        />
        <input
          className="input"
          value={form.url}
          onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
          placeholder="https://…"
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit()
            if (e.key === 'Escape') cancel()
          }}
        />
        <div className="form-actions">
          <button className="btn btn-ghost btn-sm" onClick={cancel}>Cancel</button>
          <button className="btn btn-primary btn-sm" onClick={commit}>
            <IconCheck /> Save
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="lookup-entry-row" onClick={startEdit} title="Click to edit">
      <div className="lookup-entry-desc">
        {entry.description || <span className="lookup-entry-ghost">no description</span>}
      </div>
      <div className="lookup-entry-tags">
        {entry.tags.map((t) => <TagBadge key={t} tag={t} />)}
      </div>
      <a
        className="lookup-entry-url"
        href={entry.url}
        target="_blank"
        rel="noreferrer"
        onClick={(e) => e.stopPropagation()}
      >
        {entry.url}
      </a>
      <div className="lookup-entry-actions">
        <button
          className="icon-btn danger"
          title="Delete entry"
          onClick={(e) => { e.stopPropagation(); onDelete(entry.id) }}
        >
          <IconTrash />
        </button>
      </div>
    </div>
  )
}
