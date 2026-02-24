import { useState, useEffect, useRef } from 'react'
import { evaluateRules } from '../../utils/shortcuts.utils'
import { RuleList } from './RuleList'
import { BrowserUrlBanner } from './BrowserUrlBanner'
import { IconTrash, IconLock, IconLockOpen } from '../shared/icons'

export const ShortcutCard = ({
  shortcut,
  animationDelay,
  globalCommand,
  globalParam,
  onEditStart,
  onEditEnd,
  onUpdate,
  onDelete,
  onAddRule,
  onUpdateRule,
  onDeleteRule,
  onReorderRules,
}) => {
  const [locked, setLocked] = useState(false)
  const [lockFlash, setLockFlash] = useState(0)
  const [testParam, setTestParam] = useState('')
  const [isRuleEditing, setIsRuleEditing] = useState(false)
  const ruleListRef = useRef(null)

  // Inline key editing
  const [editingKey, setEditingKey] = useState(false)
  const [editKey, setEditKey] = useState(shortcut.key)
  const keyDoneRef = useRef(false)

  // Inline name editing (label above the card)
  const [editingName, setEditingName] = useState(false)
  const [editName, setEditName] = useState(shortcut.name)
  const nameDoneRef = useRef(false)

  // Notify parent when rule editing starts/stops
  useEffect(() => {
    if (isRuleEditing) {
      onEditStart?.(
        shortcut.id,
        () => ruleListRef.current?.saveEditing(),
        () => ruleListRef.current?.cancelEditing(),
      )
    } else {
      onEditEnd?.(shortcut.id)
    }
  }, [isRuleEditing, shortcut.id])

  // ── Key edit helpers ──────────────────────────────────────────────────────
  const startKeyEdit = () => {
    if (locked) { flashLock(); return }
    keyDoneRef.current = false
    setEditKey(shortcut.key)
    setEditingKey(true)
  }

  const commitKey = () => {
    if (keyDoneRef.current) return
    keyDoneRef.current = true
    const trimmed = editKey.trim()
    if (trimmed && trimmed !== shortcut.key) {
      onUpdate(shortcut.id, { key: trimmed, name: shortcut.name })
    }
    setEditingKey(false)
  }

  const cancelKey = () => {
    keyDoneRef.current = true
    setEditKey(shortcut.key)
    setEditingKey(false)
  }

  // ── Name edit helpers ─────────────────────────────────────────────────────
  const startNameEdit = () => {
    if (locked) { flashLock(); return }
    nameDoneRef.current = false
    setEditName(shortcut.name)
    setEditingName(true)
  }

  const commitName = () => {
    if (nameDoneRef.current) return
    nameDoneRef.current = true
    const trimmed = editName.trim()
    if (trimmed !== shortcut.name) {
      onUpdate(shortcut.id, { key: shortcut.key, name: trimmed })
    }
    setEditingName(false)
  }

  const cancelName = () => {
    nameDoneRef.current = true
    setEditName(shortcut.name)
    setEditingName(false)
  }

  // ── Lock ──────────────────────────────────────────────────────────────────
  const flashLock = () => setLockFlash((n) => n + 1)

  const handleLockToggle = () => {
    setLocked((l) => !l)
    setEditingKey(false)
    setEditingName(false)
  }

  // ── Rule test results ─────────────────────────────────────────────────────
  const isGlobalMatch = globalCommand === shortcut.key && !!globalParam
  const activeTestParam = testParam || (isGlobalMatch ? (globalParam ?? '') : '')

  const testResults = activeTestParam.length > 0
    ? Object.fromEntries(
        evaluateRules(shortcut.rules, activeTestParam).map((r) => [r.rule.id, r])
      )
    : null

  return (
    <div
      className="shortcut-card-wrap"
      style={animationDelay ? { animationDelay: `${animationDelay}s` } : undefined}
    >
      {/* Name label above the card */}
      <div className="shortcut-card-label">
        {editingName ? (
          <input
            className="shortcut-card-label-input"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); commitName() }
              if (e.key === 'Escape') cancelName()
            }}
            placeholder="name"
            autoFocus
          />
        ) : shortcut.name ? (
          <span
            className={`shortcut-card-label-text${!locked ? ' editable' : ''}`}
            onClick={!locked ? startNameEdit : undefined}
            title={locked ? undefined : 'Click to edit name'}
          >
            {shortcut.name}
          </span>
        ) : !locked ? (
          <span className="shortcut-card-label-ghost" onClick={startNameEdit}>
            add name
          </span>
        ) : null}
      </div>

      <div className={`shortcut-card${locked ? ' locked' : ''}${isGlobalMatch ? ' card-global-match' : ''}`}>
        {lockFlash > 0 && (
          <div key={lockFlash} className="lock-notify" onAnimationEnd={() => setLockFlash(0)}>
            Card is locked — click the lock icon to unlock.
          </div>
        )}

        <div className="shortcut-card-header">
          {/* Key badge – click to edit inline */}
          {editingKey ? (
            <input
              className="shortcut-key-badge shortcut-key-input"
              value={editKey}
              onChange={(e) => setEditKey(e.target.value)}
              onBlur={commitKey}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); commitKey() }
                if (e.key === 'Escape') cancelKey()
              }}
              autoFocus
            />
          ) : (
            <span
              className={`shortcut-key-badge${!locked ? ' shortcut-key-badge--editable' : ''}`}
              onClick={startKeyEdit}
              title={locked ? undefined : 'Click to edit key'}
            >
              {shortcut.key}
            </span>
          )}

          {/* Test input – always visible */}
          <input
            className="test-inline-input"
            value={testParam}
            onChange={(e) => setTestParam(e.target.value)}
            placeholder="12345"
          />

          <BrowserUrlBanner shortcutKey={shortcut.key} />

          <div className="header-actions">
            {!locked && (
              <button
                className="icon-btn danger"
                onClick={() => onDelete(shortcut.id)}
                title="Delete shortcut"
              >
                <IconTrash />
              </button>
            )}
          </div>

          <button
            className={`lock-btn${locked ? ' active' : ''}`}
            onClick={handleLockToggle}
            title={locked ? 'Unlock card' : 'Lock card'}
          >
            {locked ? <IconLock /> : <IconLockOpen />}
          </button>
        </div>

        <RuleList
          ref={ruleListRef}
          rules={shortcut.rules}
          testResults={testResults}
          locked={locked}
          onLockedClick={flashLock}
          onEditingChange={setIsRuleEditing}
          onReorder={(newRules) => onReorderRules(shortcut.id, newRules)}
          onAdd={(ruleData) => onAddRule(shortcut.id, ruleData)}
          onUpdate={(ruleId, ruleData) => onUpdateRule(shortcut.id, ruleId, ruleData)}
          onDelete={(ruleId) => onDeleteRule(shortcut.id, ruleId)}
        />
      </div>
    </div>
  )
}
