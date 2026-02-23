import { useState } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import {
  addShortcut,
  updateShortcut,
  deleteShortcut,
  addRule,
  updateRule,
  deleteRule,
  reorderRules,
} from '../../utils/shortcuts.utils'
import { ShortcutList } from './ShortcutList'
import { ShortcutDetail } from './ShortcutDetail'
import { ImportExport } from './ImportExport'

const STORAGE_KEY = 'linker_shortcuts'
const INITIAL = { shortcuts: [] }

export const AdminView = ({ prefillCommand, prefillParam }) => {
  const [data, setData] = useLocalStorage(STORAGE_KEY, INITIAL)
  const [selectedId, setSelectedId] = useState(() =>
    prefillCommand ? (data.shortcuts.find((s) => s.key === prefillCommand)?.id ?? null) : null
  )

  const { shortcuts } = data
  const mutate = (newShortcuts) => setData({ shortcuts: newShortcuts })

  const handleAddShortcut = (formData) => {
    const result = addShortcut(shortcuts, formData)
    mutate(result.shortcuts)
    setSelectedId(result.newId)
  }

  const handleUpdateShortcut = (id, formData) => mutate(updateShortcut(shortcuts, id, formData))

  const handleDeleteShortcut = (id) => {
    mutate(deleteShortcut(shortcuts, id))
    if (selectedId === id) setSelectedId(null)
  }

  const handleAddRule = (shortcutId, ruleData) => mutate(addRule(shortcuts, shortcutId, ruleData))
  const handleUpdateRule = (shortcutId, ruleId, ruleData) =>
    mutate(updateRule(shortcuts, shortcutId, ruleId, ruleData))
  const handleDeleteRule = (shortcutId, ruleId) =>
    mutate(deleteRule(shortcuts, shortcutId, ruleId))
  const handleReorderRules = (shortcutId, newRules) =>
    mutate(reorderRules(shortcuts, shortcutId, newRules))

  const selectedShortcut = shortcuts.find((s) => s.id === selectedId) ?? null

  return (
    <div className="admin-page">
      <div className="page-grid">

        {/* Left card – shortcuts list */}
        <div className="card shortcuts-card">
          <ShortcutList
            shortcuts={shortcuts}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onAdd={handleAddShortcut}
            onUpdate={handleUpdateShortcut}
            onDelete={handleDeleteShortcut}
          />
          <div className="sidebar-footer">
            <ImportExport
              shortcuts={shortcuts}
              onImport={(newShortcuts) => { mutate(newShortcuts); setSelectedId(null) }}
            />
          </div>
        </div>

        {/* Right card – shortcut detail */}
        <div className="card detail-card">
          <ShortcutDetail
            shortcut={selectedShortcut}
            prefillParam={prefillParam}
            onAddRule={handleAddRule}
            onUpdateRule={handleUpdateRule}
            onDeleteRule={handleDeleteRule}
            onReorderRules={handleReorderRules}
          />
        </div>

      </div>
    </div>
  )
}
