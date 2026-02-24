import { useState, useRef, useCallback, useEffect } from 'react'
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

  // Global save/cancel – collects functions from all cards that are currently editing
  const activeCardSaves   = useRef(new Map()) // shortcutId → saveFn
  const activeCardCancels = useRef(new Map()) // shortcutId → cancelFn
  const [hasActiveEdit, setHasActiveEdit] = useState(false)
  const [saveFlash, setSaveFlash] = useState(0)

  const handleCardEditStart = useCallback((id, saveFn, cancelFn) => {
    activeCardSaves.current.set(id, saveFn)
    activeCardCancels.current.set(id, cancelFn)
    setHasActiveEdit(true)
  }, [])

  const handleCardEditEnd = useCallback((id) => {
    activeCardSaves.current.delete(id)
    activeCardCancels.current.delete(id)
    setHasActiveEdit(activeCardSaves.current.size > 0)
  }, [])

  const handleGlobalSave = useCallback(() => {
    activeCardSaves.current.forEach((fn) => fn())
    setSaveFlash((n) => n + 1)
  }, [])

  const handleGlobalCancel = useCallback(() => {
    activeCardCancels.current.forEach((fn) => fn())
  }, [])

  // Ctrl+S / ⌘S anywhere on the page
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        if (hasActiveEdit) handleGlobalSave()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [hasActiveEdit, handleGlobalSave])

  const { shortcuts } = data
  const mutate = (newShortcuts) => setData({ shortcuts: newShortcuts })

  // Parse global test into command + param (split on first space)
  const spaceIdx = globalTestInput.indexOf(' ')
  const globalCommand = spaceIdx === -1
    ? (globalTestInput.trim() || null)
    : (globalTestInput.slice(0, spaceIdx) || null)
  const globalParam = spaceIdx === -1
    ? null
    : (globalTestInput.slice(spaceIdx + 1) || null)

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

      {/* Save / Cancel – fixed in navbar area; Save always visible */}
      <div className="navbar-actions-fixed">
        {hasActiveEdit && (
          <button className="btn btn-ghost btn-sm" onClick={handleGlobalCancel}>
            Cancel
          </button>
        )}
        <button
          key={saveFlash}
          className={`btn btn-accent btn-sm${saveFlash > 0 ? ' save-boom' : ''}`}
          onClick={handleGlobalSave}
          disabled={!hasActiveEdit}
        >
          Save
        </button>
      </div>

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
          Navigate to <strong>?param=key+value</strong> to redirect instantly.
        </p>
      </div>

      {/* Global test field */}
      <div className="global-test-wrap">
        <input
          className="global-test-input"
          value={globalTestInput}
          onChange={(e) => setGlobalTestInput(e.target.value)}
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
            globalCommand={globalCommand}
            globalParam={globalParam}
            onEditStart={handleCardEditStart}
            onEditEnd={handleCardEditEnd}
            onUpdate={(id, formData) => mutate(updateShortcut(shortcuts, id, formData))}
            onDelete={(id) => mutate(deleteShortcut(shortcuts, id))}
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
