import { useState, useRef } from 'react'
import type { FindEntry } from '../../utils/find.utils'
import { TagBadge } from './TagBadge'
import { TagInput } from './TagInput'
import { DeleteConfirm } from '../shared/DeleteConfirm'

type Props = {
  entry: FindEntry
  allTags: string[]
  onUpdate: (entryId: string, data: Partial<FindEntry>) => void
  onDelete: (entryId: string) => void
}

export const FindEntryRow = ({ entry, allTags, onUpdate, onDelete }: Props) => {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<{ description: string; tags: string[]; url: string } | null>(null)
  const cancelledRef = useRef(false)

  const startEdit = () => {
    setForm({ description: entry.description, tags: [...entry.tags], url: entry.url })
    setEditing(true)
    cancelledRef.current = false
  }

  const commit = (currentForm: { description: string; tags: string[]; url: string } | null) => {
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

  const handleContainerBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (e.currentTarget.contains(e.relatedTarget)) return
    if (cancelledRef.current) { cancelledRef.current = false; return }
    commit(form)
  }

  if (editing && form) {
    return (
      <div
        className="find-entry-edit"
        onBlur={handleContainerBlur}
      >
        <input
          className="input"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f!, description: e.target.value }))}
          placeholder="Description"
          autoFocus
        />
        <TagInput
          tags={form.tags}
          onChange={(tags) => setForm((f) => ({ ...f!, tags }))}
          suggestions={allTags}
        />
        <input
          className="input"
          value={form.url}
          onChange={(e) => setForm((f) => ({ ...f!, url: e.target.value }))}
          placeholder="https://\u2026"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || ((e.ctrlKey || e.metaKey) && e.key === 's')) { e.preventDefault(); cancelledRef.current = false; commit(form) }
            if (e.key === 'Escape') cancel()
          }}
        />
      </div>
    )
  }

  return (
    <div className="find-entry-row" onClick={startEdit} title="Click to edit">
      <div className="find-entry-desc">
        {entry.description || <span className="find-entry-ghost">no description</span>}
      </div>
      <div className="find-entry-tags">
        {entry.tags.map((t) => <TagBadge key={t} tag={t} />)}
      </div>
      <a
        className="find-entry-url"
        href={entry.url}
        target="_blank"
        rel="noreferrer"
        onClick={(e) => e.stopPropagation()}
      >
        {entry.url}
      </a>
      <DeleteConfirm
        className="find-entry-actions"
        onDelete={() => onDelete(entry.id)}
        iconTitle="Delete entry"
        stopPropagation
      />
    </div>
  )
}
