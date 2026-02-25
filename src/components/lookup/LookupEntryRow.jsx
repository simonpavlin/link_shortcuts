import { useState, useRef } from 'react'
import { TagBadge } from './TagBadge'
import { TagInput } from './TagInput'
import { IconTrash } from '../shared/icons'

export const LookupEntryRow = ({ entry, allTags, onUpdate, onDelete }) => {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const cancelledRef = useRef(false)

  const startEdit = () => {
    setForm({ description: entry.description, tags: [...entry.tags], url: entry.url })
    setEditing(true)
    cancelledRef.current = false
  }

  const commit = (currentForm) => {
    const f = currentForm ?? form
    if (!f) return
    onUpdate(entry.id, f)
    setEditing(false)
    setForm(null)
  }

  const cancel = () => {
    cancelledRef.current = true
    setEditing(false)
    setForm(null)
  }

  const handleContainerBlur = (e) => {
    if (e.currentTarget.contains(e.relatedTarget)) return
    if (cancelledRef.current) { cancelledRef.current = false; return }
    commit(form)
  }

  if (editing && form) {
    return (
      <div
        className="lookup-entry-edit"
        onBlur={handleContainerBlur}
      >
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
            if (e.key === 'Enter' || ((e.ctrlKey || e.metaKey) && e.key === 's')) { e.preventDefault(); cancelledRef.current = false; commit(form) }
            if (e.key === 'Escape') cancel()
          }}
        />
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
      <div
        className="lookup-entry-actions"
        style={confirmDelete ? { opacity: 1 } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        {confirmDelete ? (
          <div className="confirm-delete-inline">
            <span className="confirm-text">Delete?</span>
            <button
              className="btn-yes"
              onClick={(e) => { e.stopPropagation(); onDelete(entry.id) }}
            >
              Yes
            </button>
            <button
              className="btn-no"
              onClick={(e) => { e.stopPropagation(); setConfirmDelete(false) }}
            >
              No
            </button>
          </div>
        ) : (
          <button
            className="icon-btn danger"
            title="Delete entry"
            onClick={(e) => { e.stopPropagation(); setConfirmDelete(true) }}
          >
            <IconTrash />
          </button>
        )}
      </div>
    </div>
  )
}
