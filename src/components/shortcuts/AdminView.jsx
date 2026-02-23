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
import { ShortcutEditor } from './ShortcutEditor'
import { ImportExport } from './ImportExport'

const STORAGE_KEY = 'linker_shortcuts'
const INITIAL = { shortcuts: [] }

export const AdminView = ({ prefillCommand, prefillParam }) => {
  const [data, setData] = useLocalStorage(STORAGE_KEY, INITIAL)
  const [selectedId, setSelectedId] = useState(() =>
    prefillCommand ? (data.shortcuts.find((s) => s.key === prefillCommand)?.id ?? null) : null
  )
  const [editingShortcut, setEditingShortcut] = useState(null) // null | 'new' | shortcut object

  const { shortcuts } = data
  const mutate = (newShortcuts) => setData({ shortcuts: newShortcuts })

  const handleAddShortcut = (formData) => {
    const result = addShortcut(shortcuts, formData)
    mutate(result.shortcuts)
    setSelectedId(result.newId)
    setEditingShortcut(null)
  }

  const handleUpdateShortcut = (formData) => {
    mutate(updateShortcut(shortcuts, editingShortcut.id, formData))
    setEditingShortcut(null)
  }

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
    <div className="admin-view">
      <ShortcutList
        shortcuts={shortcuts}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onAdd={() => setEditingShortcut('new')}
        onEdit={(s) => setEditingShortcut(s)}
        onDelete={handleDeleteShortcut}
      />

      <div className="admin-main">
        <ShortcutDetail
          shortcut={selectedShortcut}
          prefillParam={prefillParam}
          onAddRule={handleAddRule}
          onUpdateRule={handleUpdateRule}
          onDeleteRule={handleDeleteRule}
          onReorderRules={handleReorderRules}
        />
        <div className="admin-footer">
          <ImportExport
            shortcuts={shortcuts}
            onImport={(newShortcuts) => { mutate(newShortcuts); setSelectedId(null) }}
          />
        </div>
      </div>

      {editingShortcut && (
        <ShortcutEditor
          shortcut={editingShortcut === 'new' ? null : editingShortcut}
          onSave={editingShortcut === 'new' ? handleAddShortcut : handleUpdateShortcut}
          onCancel={() => setEditingShortcut(null)}
        />
      )}
    </div>
  )
}
