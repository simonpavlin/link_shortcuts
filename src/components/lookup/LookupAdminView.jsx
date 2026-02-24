import { useState } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import {
  addTable,
  updateTable,
  deleteTable,
  addEntry,
  updateEntry,
  deleteEntry,
} from '../../utils/lookup.utils'
import { LookupTableCard } from './LookupTableCard'
import { IconPlus } from '../shared/icons'

const STORAGE_KEY = 'linker_lookup'
const INITIAL = { tables: [] }

export const LookupAdminView = () => {
  const [data, setData] = useLocalStorage(STORAGE_KEY, INITIAL)
  const [addingNew, setAddingNew] = useState(false)
  const [newForm, setNewForm] = useState({ key: '', name: '' })

  const { tables } = data
  const mutate = (newTables) => setData({ tables: newTables })

  const handleAdd = () => {
    if (!newForm.key.trim()) return
    const result = addTable(tables, newForm)
    mutate(result.tables)
    setAddingNew(false)
    setNewForm({ key: '', name: '' })
  }

  const handleNewKeyDown = (e) => {
    if (e.key === 'Enter') handleAdd()
    if (e.key === 'Escape') { setAddingNew(false); setNewForm({ key: '', name: '' }) }
  }

  return (
    <div className="admin-page">
      <div className="page-hero">
        <div className="page-hero-eyebrow">
          <span className="page-hero-line" />
          lookup
          <span className="page-hero-line" />
        </div>
        <h1 className="page-hero-title">
          Lookup <span className="page-hero-accent">Tables</span>
        </h1>
        <p className="page-hero-desc">
          Create <strong>tagged entries</strong> and link them to URLs.
          Navigate to <strong>?param=key+tag1+tag2</strong> to find and jump to matching links.
        </p>
      </div>

      <div className="shortcuts-stack">
        {tables.length === 0 && !addingNew && (
          <p className="empty-hint">No tables yet — add one below.</p>
        )}

        {tables.map((t, i) => (
          <LookupTableCard
            key={t.id}
            table={t}
            animationDelay={i * 0.07}
            onUpdate={(id, data) => mutate(updateTable(tables, id, data))}
            onDelete={(id) => mutate(deleteTable(tables, id))}
            onAddEntry={(tableId, entryData) => mutate(addEntry(tables, tableId, entryData))}
            onUpdateEntry={(tableId, entryId, entryData) =>
              mutate(updateEntry(tables, tableId, entryId, entryData))
            }
            onDeleteEntry={(tableId, entryId) =>
              mutate(deleteEntry(tables, tableId, entryId))
            }
          />
        ))}

        {addingNew ? (
          <div className="shortcut-card">
            <div className="add-shortcut-form">
              <input
                className="input input-key"
                value={newForm.key}
                onChange={(e) => setNewForm((f) => ({ ...f, key: e.target.value }))}
                onKeyDown={handleNewKeyDown}
                placeholder="key"
                autoFocus
              />
              <input
                className="input"
                value={newForm.name}
                onChange={(e) => setNewForm((f) => ({ ...f, name: e.target.value }))}
                onKeyDown={handleNewKeyDown}
                placeholder="name (optional)"
                style={{ flex: 1 }}
              />
              <button className="btn btn-primary btn-sm" onClick={handleAdd}>Add</button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => { setAddingNew(false); setNewForm({ key: '', name: '' }) }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button className="add-card-btn" onClick={() => setAddingNew(true)}>
            <IconPlus /> Add table
          </button>
        )}
      </div>
    </div>
  )
}
