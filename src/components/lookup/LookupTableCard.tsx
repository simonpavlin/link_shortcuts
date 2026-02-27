import { useState } from 'react'
import type { LookupTable, LookupEntry } from '../../utils/lookup.utils'
import { getAllTagsForTable, searchEntries } from '../../utils/lookup.utils'
import { buildLookupUrl } from '../../utils/url.utils'
import { useInlineEdit } from '../../hooks/useInlineEdit'
import { LookupEntryRow } from './LookupEntryRow'
import { TagInput } from './TagInput'
import { MoreMenu } from '../shared/MoreMenu'
import { IconPlus, IconLink } from '../shared/icons'

type Props = {
  table: LookupTable
  animationDelay?: number
  testKey: string | null
  testTags: string[]
  onUpdate: (id: string, data: { key: string; name: string }) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onAddEntry: (tableId: string, data: Partial<LookupEntry>) => void
  onUpdateEntry: (tableId: string, entryId: string, data: Partial<LookupEntry>) => void
  onDeleteEntry: (tableId: string, entryId: string) => void
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
}: Props) => {
  const [addingEntry, setAddingEntry] = useState(false)
  const [entryForm, setEntryForm] = useState({ description: '', tags: [] as string[], url: '' })
  const [copied, setCopied] = useState(false)

  const keyEdit = useInlineEdit(
    table.key,
    (trimmed) => onUpdate(table.id, { key: trimmed, name: table.name }),
    { allowEmpty: false },
  )

  const nameEdit = useInlineEdit(
    table.name,
    (trimmed) => onUpdate(table.id, { key: table.key, name: trimmed }),
    { allowEmpty: true },
  )

  const allTags = getAllTagsForTable(table)

  const isTestMatch = testKey === table.key && testTags.length > 0
  const displayEntries = isTestMatch
    ? searchEntries(table, testTags)
    : table.entries

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

  const handleCopy = () => {
    navigator.clipboard.writeText(buildLookupUrl(window.location.origin, table.key)).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div
      className="shortcut-card-wrap"
      style={animationDelay ? { animationDelay: `${animationDelay}s` } : undefined}
    >
      <div className="shortcut-card-label">
        {nameEdit.editing ? (
          <input
            className="shortcut-card-label-input"
            value={nameEdit.editValue}
            onChange={(e) => nameEdit.setEditValue(e.target.value)}
            onBlur={nameEdit.commitEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); nameEdit.commitEdit() }
              if (e.key === 'Escape') nameEdit.cancelEdit()
            }}
            placeholder="Table name"
            autoFocus
          />
        ) : table.name ? (
          <span
            className="shortcut-card-label-text editable"
            onClick={nameEdit.startEdit}
            title="Click to edit name"
          >
            {table.name}
          </span>
        ) : (
          <span className="shortcut-card-label-ghost" onClick={nameEdit.startEdit}>
            add name
          </span>
        )}
      </div>

      <div className={`shortcut-card${isTestMatch ? ' card-global-match' : ''}`}>
        <div className="shortcut-card-header">
          {keyEdit.editing ? (
            <input
              className="shortcut-key-badge shortcut-key-input"
              value={keyEdit.editValue}
              onChange={(e) => keyEdit.setEditValue(e.target.value)}
              onBlur={keyEdit.commitEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); keyEdit.commitEdit() }
                if (e.key === 'Escape') keyEdit.cancelEdit()
              }}
              autoFocus
            />
          ) : (
            <span
              className="shortcut-key-badge shortcut-key-badge--editable"
              onClick={keyEdit.startEdit}
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
              placeholder="https://\u2026"
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
