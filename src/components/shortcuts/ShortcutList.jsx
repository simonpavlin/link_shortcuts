import { useState } from 'react'
import { Eyebrow } from '../shared/Eyebrow'

// Internal inline form – no modal
const ShortcutForm = ({ shortcut, onSave, onCancel }) => {
  const [form, setForm] = useState({ key: shortcut?.key ?? '', name: shortcut?.name ?? '' })
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.key.trim()) return
    onSave(form)
  }

  return (
    <div className="shortcut-inline-form">
      <div className="shortcut-form-fields">
        <div className="field">
          <label className="field-label">Key</label>
          <input
            className="input"
            value={form.key}
            onChange={(e) => set('key', e.target.value)}
            placeholder="mr"
            required
            autoFocus
          />
        </div>
        <div className="field">
          <label className="field-label">Name</label>
          <input
            className="input"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Merge Requests"
          />
        </div>
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>cancel</button>
        <button className="btn btn-primary btn-sm" onClick={handleSubmit}>save</button>
      </div>
    </div>
  )
}

export const ShortcutList = ({ shortcuts, selectedId, onSelect, onAdd, onUpdate, onDelete }) => {
  const [editing, setEditing] = useState(null) // null | 'new' | shortcut.id string

  const handleSave = (form) => {
    if (editing === 'new') {
      onAdd(form)
    } else {
      onUpdate(editing, form)
    }
    setEditing(null)
  }

  return (
    <div className="shortcut-list-container">
      <Eyebrow>Shortcuts</Eyebrow>

      <ul className="shortcut-list">
        {shortcuts.length === 0 && editing !== 'new' && (
          <li className="shortcut-list-empty">No shortcuts yet.</li>
        )}

        {shortcuts.map((s) => (
          <li key={s.id}>
            {editing === s.id ? (
              <ShortcutForm
                shortcut={s}
                onSave={handleSave}
                onCancel={() => setEditing(null)}
              />
            ) : (
              <div
                className={`shortcut-item${s.id === selectedId ? ' selected' : ''}`}
                onClick={() => onSelect(s.id)}
              >
                <div className="shortcut-item-main">
                  <span className="shortcut-key-badge">{s.key}</span>
                  <span className="shortcut-item-name">{s.name}</span>
                  <span className="shortcut-item-meta">
                    {s.rules.length} {s.rules.length === 1 ? 'rule' : 'rules'}
                  </span>
                </div>
                <div className="shortcut-item-actions">
                  <button
                    className="btn-icon-bare"
                    onClick={(e) => { e.stopPropagation(); setEditing(s.id) }}
                    title="Edit"
                  >
                    edit
                  </button>
                  <button
                    className="btn-icon-bare danger"
                    onClick={(e) => { e.stopPropagation(); onDelete(s.id) }}
                    title="Delete"
                  >
                    del
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}

        {editing === 'new' && (
          <li>
            <ShortcutForm onSave={handleSave} onCancel={() => setEditing(null)} />
          </li>
        )}
      </ul>

      {editing !== 'new' && (
        <button className="add-shortcut-btn" onClick={() => setEditing('new')}>
          + add shortcut
        </button>
      )}
    </div>
  )
}
