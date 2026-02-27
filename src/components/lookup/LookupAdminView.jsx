import { useState } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import {
  addTable,
  updateTable,
  deleteTable,
  duplicateTable,
  addEntry,
  updateEntry,
  deleteEntry,
} from '../../utils/lookup.utils'
import { LookupTableCard } from './LookupTableCard'
import { DataPorter } from '../shared/DataPorter'
import { GlobalTestInput } from '../shared/GlobalTestInput'
import { AddCardForm } from '../shared/AddCardForm'

const STORAGE_KEY = 'linker_lookup'
const INITIAL = { tables: [] }

export const LookupAdminView = () => {
  const [data, setData] = useLocalStorage(STORAGE_KEY, INITIAL)
  const [testInput, setTestInput] = useState('')

  const { tables } = data
  const mutate = (newTables) => setData({ tables: newTables })

  // Parse test input: first word = table key, rest = tags
  const spaceIdx = testInput.indexOf(' ')
  const testKey = spaceIdx === -1 ? (testInput.trim() || null) : (testInput.slice(0, spaceIdx) || null)
  const testTags = spaceIdx === -1 ? [] : testInput.slice(spaceIdx + 1).split(' ').filter(Boolean)

  const handleAddTable = (form) => {
    const result = addTable(tables, form)
    mutate(result.tables)
  }

  return (
    <div className="admin-page module-find">
      <div className="page-hero">
        <div className="page-hero-eyebrow">
          <span className="page-hero-line" />
          find
          <span className="page-hero-line" />
        </div>
        <h1 className="page-hero-title">
          Tagged <span className="page-hero-accent">Tables</span>
        </h1>
        <p className="page-hero-desc">
          Organize entries with tags and link them to URLs.
          Use <strong>?q=find key tag1 tag2</strong> to jump to matching results.
        </p>
      </div>

      <GlobalTestInput
        value={testInput}
        onChange={setTestInput}
        placeholder="Test: projects react typescript"
      />

      <div className="shortcuts-stack">
        {tables.length === 0 && (
          <p className="empty-hint">No tables yet — add one below.</p>
        )}

        {tables.map((t, i) => (
          <LookupTableCard
            key={t.id}
            table={t}
            animationDelay={i * 0.07}
            testKey={testKey}
            testTags={testTags}
            onUpdate={(id, data) => mutate(updateTable(tables, id, data))}
            onDelete={(id) => mutate(deleteTable(tables, id))}
            onDuplicate={(id) => mutate(duplicateTable(tables, id))}
            onAddEntry={(tableId, entryData) => mutate(addEntry(tables, tableId, entryData))}
            onUpdateEntry={(tableId, entryId, entryData) =>
              mutate(updateEntry(tables, tableId, entryId, entryData))
            }
            onDeleteEntry={(tableId, entryId) =>
              mutate(deleteEntry(tables, tableId, entryId))
            }
          />
        ))}

        <AddCardForm
          onAdd={handleAddTable}
          addLabel="Add table"
        />
      </div>

      <div className="page-footer-fixed">
        <DataPorter
          data={tables}
          dataKey="tables"
          filename="linker-lookup.json"
          onImport={(newTables) => mutate(newTables)}
        />
      </div>
    </div>
  )
}
