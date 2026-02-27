import { useState, useRef, useEffect } from 'react'
import { getAllTagsForTable } from '../../utils/lookup.utils'
import { LookupEntryRow } from './LookupEntryRow'
import { TagInput } from './TagInput'
import { IconPlus, IconLink, IconTrash, IconMoreDots, IconCopy } from '../shared/icons'

const buildLookupUrl = (tableKey) =>
  `${window.location.origin}/?q=lookup+${encodeURIComponent(tableKey)}+%s`

// ── 3-dot menu with duplicate + delete confirmation ───────────────────────────
const MoreMenu = ({ onDuplicate, onDelete }) => {
  const [open, setOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (!menuRef.current?.contains(e.target)) {
        setOpen(false)
        setConfirming(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={menuRef} className="more-menu-wrap">
      <button
        className="icon-btn"
        onClick={() => { setOpen((o) => !o); setConfirming(false) }}
        title="More options"
      >
        <IconMoreDots />
      </button>
      {open && (
        <div className="more-menu-dropdown">
          <button
            className="more-menu-item"
            onClick={() => { onDuplicate(); setOpen(false) }}
          >
            <IconCopy /> Duplicate
          </button>
          {confirming ? (
            <div className="more-menu-confirm">
              <span>Delete?</span>
              <button
                className="btn-yes"
                onClick={() => { onDelete(); setOpen(false); setConfirming(false) }}
              >
                Yes
              </button>
              <button className="btn-no" onClick={() => setConfirming(false)}>No</button>
            </div>
          ) : (
            <button className="more-menu-item danger" onClick={() => setConfirming(true)}>
              <IconTrash /> Delete
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export const LookupTableCard = ({
  table,
  animationDelay,
  testKey,
  testTags,
  onUpdate,
  onDelete,
  onDuplicate,
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry,
}) => {
  const [editingKey, setEditingKey] = useState(false)
  const [editKey, setEditKey] = useState(table.key)
  const keyDoneRef = useRef(false)

  const [editingName, setEditingName] = useState(false)
  const [editName, setEditName] = useState(table.name)
  const nameDoneRef = useRef(false)

  const [addingEntry, setAddingEntry] = useState(false)
  const [entryForm, setEntryForm] = useState({ description: '', tags: [], url: '' })

  const [copied, setCopied] = useState(false)

  const allTags = getAllTagsForTable(table)

  // ── Test / filter ─────────────────────────────────────────────────────────
  const isTestMatch = testKey === table.key && testTags.length > 0
  const displayEntries = isTestMatch
    ? table.entries.filter((e) => testTags.every((tag) => e.tags.includes(tag)))
    : table.entries

  // ── Key edit ─────────────────────────────────────────────────────────────
  const startKey = () => {
    keyDoneRef.current = false
    setEditKey(table.key)
    setEditingKey(true)
  }

  const commitKey = () => {
    if (keyDoneRef.current) return
    keyDoneRef.current = true
    const trimmed = editKey.trim()
    if (trimmed && trimmed !== table.key) onUpdate(table.id, { key: trimmed, name: table.name })
    setEditingKey(false)
  }

  const cancelKey = () => {
    keyDoneRef.current = true
    setEditKey(table.key)
    setEditingKey(false)
  }

  // ── Name edit ─────────────────────────────────────────────────────────────
  const startName = () => {
    nameDoneRef.current = false
    setEditName(table.name)
    setEditingName(true)
  }

  const commitName = () => {
    if (nameDoneRef.current) return
    nameDoneRef.current = true
    const trimmed = editName.trim()
    if (trimmed !== table.name) onUpdate(table.id, { key: table.key, name: trimmed })
    setEditingName(false)
  }

  const cancelName = () => {
    nameDoneRef.current = true
    setEditName(table.name)
    setEditingName(false)
  }

  // ── Add entry ─────────────────────────────────────────────────────────────
  const handleAddEntry = () => {
    if (!entryForm.url.trim()) return
    onAddEntry(table.id, entryForm)
    setEntryForm({ description: '', tags: [], url: '' })
    setAddingEntry(false)
  }

  const cancelAddEntry = () => {
    setAddingEntry(false)
    setEntryForm({ description: '', tags: [], url: '' })
  }

  // ── Copy URL ──────────────────────────────────────────────────────────────
  const handleCopy = () => {
    navigator.clipboard.writeText(buildLookupUrl(table.key)).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div
      className="shortcut-card-wrap"
      style={animationDelay ? { animationDelay: `${animationDelay}s` } : undefined}
    >
      {/* Name label above card */}
      <div className="shortcut-card-label">
        {editingName ? (
          <input
            className="shortcut-card-label-input"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); commitName() }
              if (e.key === 'Escape') cancelName()
            }}
            placeholder="Table name"
            autoFocus
          />
        ) : table.name ? (
          <span
            className="shortcut-card-label-text editable"
            onClick={startName}
            title="Click to edit name"
          >
            {table.name}
          </span>
        ) : (
          <span className="shortcut-card-label-ghost" onClick={startName}>
            add name
          </span>
        )}
      </div>

      <div className={`shortcut-card${isTestMatch ? ' card-global-match' : ''}`}>
        <div className="shortcut-card-header">
          {editingKey ? (
            <input
              className="shortcut-key-badge shortcut-key-input"
              value={editKey}
              onChange={(e) => setEditKey(e.target.value)}
              onBlur={commitKey}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); commitKey() }
                if (e.key === 'Escape') cancelKey()
              }}
              autoFocus
            />
          ) : (
            <span
              className="shortcut-key-badge shortcut-key-badge--editable"
              onClick={startKey}
              title="Click to edit key"
            >
              {table.key}
            </span>
          )}

          <button
            className={`url-copy-btn${copied ? ' copied' : ''}`}
            onClick={handleCopy}
            title="Copy browser search engine URL"
          >
            <IconLink />
            {copied ? 'Copied!' : 'Browser URL'}
          </button>

          <div style={{ flex: 1 }} />

          <div className="header-actions">
            <MoreMenu
              onDuplicate={() => onDuplicate(table.id)}
              onDelete={() => onDelete(table.id)}
            />
          </div>
        </div>

        {/* Entry list */}
        {(displayEntries.length > 0 || (isTestMatch && table.entries.length > 0)) && (
          <div className="lookup-entry-list">
            {displayEntries.length > 0 ? (
              displayEntries.map((entry) => (
                <LookupEntryRow
                  key={entry.id}
                  entry={entry}
                  allTags={allTags}
                  onUpdate={(entryId, data) => onUpdateEntry(table.id, entryId, data)}
                  onDelete={(entryId) => onDeleteEntry(table.id, entryId)}
                />
              ))
            ) : (
              <div className="lookup-no-matches">No entries match these tags.</div>
            )}
          </div>
        )}

        {/* Add entry form or button */}
        {addingEntry ? (
          <div className="lookup-add-entry-form">
            <input
              className="input"
              value={entryForm.description}
              onChange={(e) => setEntryForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Description"
              autoFocus
            />
            <TagInput
              tags={entryForm.tags}
              onChange={(tags) => setEntryForm((f) => ({ ...f, tags }))}
              suggestions={allTags}
            />
            <input
              className="input"
              value={entryForm.url}
              onChange={(e) => setEntryForm((f) => ({ ...f, url: e.target.value }))}
              placeholder="https://…"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddEntry()
                if (e.key === 'Escape') cancelAddEntry()
              }}
            />
            <div className="form-actions">
              <button className="btn btn-ghost btn-sm" onClick={cancelAddEntry}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleAddEntry}>Add</button>
            </div>
          </div>
        ) : (
          <button className="lookup-add-entry-btn" onClick={() => setAddingEntry(true)}>
            <IconPlus /> Add entry
          </button>
        )}
      </div>
    </div>
  )
}
