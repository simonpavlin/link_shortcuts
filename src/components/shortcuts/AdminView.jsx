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
import { ShortcutCard } from './ShortcutCard'
import { ImportExport } from './ImportExport'
import { IconPlus } from '../shared/icons'

const STORAGE_KEY = 'linker_shortcuts'
const INITIAL = { shortcuts: [] }

export const AdminView = ({ prefillCommand, prefillParam }) => {
  const [data, setData] = useLocalStorage(STORAGE_KEY, INITIAL)
  const [addingNew, setAddingNew] = useState(false)
  const [newForm, setNewForm] = useState({ key: '', name: '' })

  const { shortcuts } = data
  const mutate = (newShortcuts) => setData({ shortcuts: newShortcuts })

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
    <div className="admin-page">

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
          Navigate to <strong>?command=key&amp;param=value</strong> to redirect instantly.
        </p>
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
            prefillParam={s.key === prefillCommand ? prefillParam : undefined}
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
              <button className="btn btn-primary btn-sm" onClick={handleAddShortcut}>add</button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => { setAddingNew(false); setNewForm({ key: '', name: '' }) }}
              >
                cancel
              </button>
            </div>
          </div>
        ) : (
          <button className="add-card-btn" onClick={() => setAddingNew(true)}>
            <IconPlus /> add shortcut
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
