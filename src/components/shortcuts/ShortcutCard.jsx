import { useState, useEffect } from 'react'
import { evaluateRules } from '../../utils/shortcuts.utils'
import { RuleList } from './RuleList'
import { BrowserUrlBanner } from './BrowserUrlBanner'
import { IconPencil, IconTrash, IconLock, IconLockOpen } from '../shared/icons'

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
  const [locked, setLocked] = useState(false)
  const [lockFlash, setLockFlash] = useState(0)
  const [testParam, setTestParam] = useState(prefillParam ?? '')
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ key: shortcut.key, name: shortcut.name })

  useEffect(() => {
    if (prefillParam) setTestParam(prefillParam)
  }, [prefillParam])

  const testResults = testParam.length > 0
    ? Object.fromEntries(evaluateRules(shortcut.rules, testParam).map((r) => [r.rule.id, r]))
    : null

  const flashLock = () => setLockFlash((n) => n + 1)

  const handleLockToggle = () => {
    setLocked((l) => !l)
    if (editing) setEditing(false)
  }

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
    if (locked) { flashLock(); return }
    setForm({ key: shortcut.key, name: shortcut.name })
    setEditing(true)
  }

  return (
    <div className={`shortcut-card${locked ? ' locked' : ''}`}>

      {lockFlash > 0 && (
        <div key={lockFlash} className="lock-notify" onAnimationEnd={() => setLockFlash(0)}>
          Card is locked — click the lock icon to unlock.
        </div>
      )}

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
              {!locked && (
                <>
                  <button className="icon-btn" onClick={startEdit} title="Edit shortcut">
                    <IconPencil />
                  </button>
                  <button className="icon-btn danger" onClick={() => onDelete(shortcut.id)} title="Delete shortcut">
                    <IconTrash />
                  </button>
                </>
              )}
            </div>
            <button
              className={`lock-btn${locked ? ' active' : ''}`}
              onClick={handleLockToggle}
              title={locked ? 'Unlock card' : 'Lock card'}
            >
              {locked ? <IconLock /> : <IconLockOpen />}
            </button>
          </>
        )}
      </div>

      <div className="card-test-bar">
        <input
          className="test-input"
          placeholder="Test parameter…"
          value={testParam}
          onChange={(e) => setTestParam(e.target.value)}
        />
      </div>

      <RuleList
        rules={shortcut.rules}
        testResults={testResults}
        locked={locked}
        onLockedClick={flashLock}
        onReorder={(newRules) => onReorderRules(shortcut.id, newRules)}
        onAdd={(ruleData) => onAddRule(shortcut.id, ruleData)}
        onUpdate={(ruleId, ruleData) => onUpdateRule(shortcut.id, ruleId, ruleData)}
        onDelete={(ruleId) => onDeleteRule(shortcut.id, ruleId)}
      />
    </div>
  )
}
