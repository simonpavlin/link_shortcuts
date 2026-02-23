import { useState } from 'react'
import { Button } from '../shared/Button'
import { Input } from '../shared/Input'

export const ShortcutEditor = ({ shortcut, onSave, onCancel }) => {
  const [form, setForm] = useState({
    key: shortcut?.key ?? '',
    name: shortcut?.name ?? '',
  })

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.key.trim()) return
    onSave(form)
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">{shortcut ? 'Edit shortcut' : 'Add shortcut'}</h2>
        <form onSubmit={handleSubmit}>
          <Input
            label="Key"
            id="shortcut-key"
            value={form.key}
            onChange={(e) => set('key', e.target.value)}
            placeholder="e.g. mr"
            required
          />
          <Input
            label="Name"
            id="shortcut-name"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. Merge Requests"
          />
          <div className="modal-actions">
            <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
            <Button type="submit" variant="primary">Save</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
