import { useState } from 'react'
import { IconPlus } from './icons'

export const AddCardForm = ({ onAdd, addLabel }) => {
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ key: '', name: '' })

  const handleAdd = () => {
    if (!form.key.trim()) return
    onAdd(form)
    setForm({ key: '', name: '' })
    setAdding(false)
  }

  const handleCancel = () => {
    setAdding(false)
    setForm({ key: '', name: '' })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAdd()
    if (e.key === 'Escape') handleCancel()
  }

  if (adding) {
    return (
      <div className="shortcut-card">
        <div className="add-shortcut-form">
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
          <button className="btn btn-primary btn-sm" onClick={handleAdd}>Add</button>
          <button className="btn btn-ghost btn-sm" onClick={handleCancel}>Cancel</button>
        </div>
      </div>
    )
  }

  return (
    <button className="add-card-btn" onClick={() => setAdding(true)}>
      <IconPlus /> {addLabel}
    </button>
  )
}
