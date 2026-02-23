import { useState } from 'react'
import { RuleList } from './RuleList'
import { TestPanel } from './TestPanel'
import { BrowserUrlBanner } from './BrowserUrlBanner'
import { IconPencil, IconTrash } from '../shared/icons'

export const ShortcutCard = ({
  shortcut,
  prefillParam,
  onUpdate,
  onDelete,
  onAddRule,
  onUpdateRule,
  onDeleteRule,
  onReorderRules,
}) => {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ key: shortcut.key, name: shortcut.name })

  const handleSave = () => {
    if (!form.key.trim()) return
    onUpdate(shortcut.id, form)
    setEditing(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') setEditing(false)
  }

  const startEdit = () => {
    setForm({ key: shortcut.key, name: shortcut.name })
    setEditing(true)
  }

  return (
    <div className="shortcut-card">
      <div className="shortcut-card-header">
        {editing ? (
          <div className="header-edit-form">
            <input
              className="input input-key"
              value={form.key}
              onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))}
              onKeyDown={handleKeyDown}
              placeholder="key"
              autoFocus
            />
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              onKeyDown={handleKeyDown}
              placeholder="name (optional)"
              style={{ flex: 1 }}
            />
            <div className="header-edit-actions">
              <button className="btn btn-primary btn-sm" onClick={handleSave}>save</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>cancel</button>
            </div>
          </div>
        ) : (
          <>
            <span className="shortcut-key-badge">{shortcut.key}</span>
            {shortcut.name && <span className="shortcut-card-name">{shortcut.name}</span>}
            <div className="header-spacer" />
            <BrowserUrlBanner shortcutKey={shortcut.key} />
            <div className="header-actions">
              <button className="icon-btn" onClick={startEdit} title="Edit">
                <IconPencil />
              </button>
              <button className="icon-btn danger" onClick={() => onDelete(shortcut.id)} title="Delete">
                <IconTrash />
              </button>
            </div>
          </>
        )}
      </div>

      <RuleList
        rules={shortcut.rules}
        onReorder={(newRules) => onReorderRules(shortcut.id, newRules)}
        onAdd={(ruleData) => onAddRule(shortcut.id, ruleData)}
        onUpdate={(ruleId, ruleData) => onUpdateRule(shortcut.id, ruleId, ruleData)}
        onDelete={(ruleId) => onDeleteRule(shortcut.id, ruleId)}
      />

      <TestPanel rules={shortcut.rules} prefillParam={prefillParam} />
    </div>
  )
}
