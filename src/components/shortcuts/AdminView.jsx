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
  duplicateShortcut,
} from '../../utils/shortcuts.utils'
import { ShortcutCard } from './ShortcutCard'
import { ImportExport } from './ImportExport'
import { IconPlus, IconX } from '../shared/icons'

const STORAGE_KEY = 'linker_shortcuts'
const INITIAL = { shortcuts: [] }

export const AdminView = ({ prefillCommand, prefillParam }) => {
  const [data, setData] = useLocalStorage(STORAGE_KEY, INITIAL)
  const [addingNew, setAddingNew] = useState(false)
  const [newForm, setNewForm] = useState({ key: '', name: '' })

  // Global test field – initialised from URL params if present
  const [globalTestInput, setGlobalTestInput] = useState(() => {
    if (!prefillCommand) return ''
    return prefillParam ? `${prefillCommand} ${prefillParam}` : prefillCommand
  })
  const [globalFocused, setGlobalFocused] = useState(!!prefillCommand)

  const { shortcuts } = data
  const mutate = (newShortcuts) => setData({ shortcuts: newShortcuts })

  // Parse global test into command + param (split on first space)
  const spaceIdx = globalTestInput.indexOf(' ')
  const globalCommand = spaceIdx === -1
    ? (globalTestInput.trim() || null)
    : (globalTestInput.slice(0, spaceIdx) || null)
  const globalParam = spaceIdx === -1
    ? null
    : globalTestInput.slice(spaceIdx + 1)

  const handleAddShortcut = () => {
    if (!newForm.key.trim()) return
    const result = addShortcut(shortcuts, newForm)
    mutate(result.shortcuts)
    setAddingNew(false)
    setNewForm({ key: '', name: '' })
  }

  const handleNewKeyDown = (e) => {
    if (e.key === 'Enter') handleAddShortcut()
    if (e.key === 'Escape') { setAddingNew(false); setNewForm({ key: '', name: '' }) }
  }

  return (
    <div className="admin-page module-shortcuts">

      <div className="page-hero">
        <div className="page-hero-eyebrow">
          <span className="page-hero-line" />
          shortcuts
          <span className="page-hero-line" />
        </div>
        <h1 className="page-hero-title">
          Regex <span className="page-hero-accent">Rules</span>
        </h1>
        <p className="page-hero-desc">
          Map <strong>command keys</strong> to URL patterns via regex rules.
          Navigate to <strong>?q=shortcuts+key+value</strong> to redirect instantly.
        </p>
      </div>

      {/* Global test field */}
      <div className="global-test-wrap">
        <input
          className="global-test-input"
          value={globalTestInput}
          onChange={(e) => setGlobalTestInput(e.target.value)}
          onFocus={() => setGlobalFocused(true)}
          onBlur={() => setGlobalFocused(false)}
          placeholder="Test globally: mr 12345"
          spellCheck={false}
        />
        {globalTestInput && (
          <button
            className="icon-btn"
            onClick={() => setGlobalTestInput('')}
            title="Clear"
          >
            <IconX />
          </button>
        )}
      </div>

      <div className="shortcuts-stack">
        {shortcuts.length === 0 && !addingNew && (
          <p className="empty-hint">No shortcuts yet — add one below.</p>
        )}

        {shortcuts.map((s, i) => (
          <ShortcutCard
            key={s.id}
            shortcut={s}
            animationDelay={i * 0.07}
            globalCommand={globalFocused ? globalCommand : null}
            globalParam={globalFocused ? globalParam : null}
            onUpdate={(id, formData) => mutate(updateShortcut(shortcuts, id, formData))}
            onDelete={(id) => mutate(deleteShortcut(shortcuts, id))}
            onDuplicate={(id) => mutate(duplicateShortcut(shortcuts, id))}
            onAddRule={(shortcutId, ruleData) => mutate(addRule(shortcuts, shortcutId, ruleData))}
            onUpdateRule={(shortcutId, ruleId, ruleData) =>
              mutate(updateRule(shortcuts, shortcutId, ruleId, ruleData))
            }
            onDeleteRule={(shortcutId, ruleId) =>
              mutate(deleteRule(shortcuts, shortcutId, ruleId))
            }
            onReorderRules={(shortcutId, newRules) =>
              mutate(reorderRules(shortcuts, shortcutId, newRules))
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
              <button className="btn btn-primary btn-sm" onClick={handleAddShortcut}>Add</button>
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
            <IconPlus /> Add shortcut
          </button>
        )}
      </div>

      <div className="page-footer-fixed">
        <ImportExport
          shortcuts={shortcuts}
          onImport={(newShortcuts) => mutate(newShortcuts)}
        />
      </div>
    </div>
  )
}
