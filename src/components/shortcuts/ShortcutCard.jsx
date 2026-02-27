import { useState, useEffect, useRef } from 'react'
import { evaluateRules } from '../../utils/shortcuts.utils'
import { RuleList } from './RuleList'
import { BrowserUrlBanner } from './BrowserUrlBanner'
import { IconTrash, IconMoreDots, IconCopy } from '../shared/icons'

// ── 3-dot menu with duplicate + delete confirmation ───────────────────────────
const MoreMenu = ({ onDuplicate, onDelete }) => {
  const [open, setOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (!menuRef.current?.contains(e.target)) {
        setOpen(false)
        setConfirming(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={menuRef} className="more-menu-wrap">
      <button
        className="icon-btn"
        onClick={() => { setOpen((o) => !o); setConfirming(false) }}
        title="More options"
      >
        <IconMoreDots />
      </button>
      {open && (
        <div className="more-menu-dropdown">
          <button
            className="more-menu-item"
            onClick={() => { onDuplicate(); setOpen(false) }}
          >
            <IconCopy /> Duplicate
          </button>
          {confirming ? (
            <div className="more-menu-confirm">
              <span>Delete?</span>
              <button
                className="btn-yes"
                onClick={() => { onDelete(); setOpen(false); setConfirming(false) }}
              >
                Yes
              </button>
              <button className="btn-no" onClick={() => setConfirming(false)}>No</button>
            </div>
          ) : (
            <button className="more-menu-item danger" onClick={() => setConfirming(true)}>
              <IconTrash /> Delete
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export const ShortcutCard = ({
  shortcut,
  animationDelay,
  globalCommand,
  globalParam,
  onUpdate,
  onDelete,
  onDuplicate,
  onAddRule,
  onUpdateRule,
  onDeleteRule,
  onReorderRules,
}) => {
  const [testParam, setTestParam] = useState('')
  const [testFocused, setTestFocused] = useState(false)

  // Inline key editing
  const [editingKey, setEditingKey] = useState(false)
  const [editKey, setEditKey] = useState(shortcut.key)
  const keyDoneRef = useRef(false)

  // Inline name editing (label above the card)
  const [editingName, setEditingName] = useState(false)
  const [editName, setEditName] = useState(shortcut.name)
  const nameDoneRef = useRef(false)

  // ── Key edit helpers ──────────────────────────────────────────────────────
  const startKeyEdit = () => {
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

  // ── Rule test results ─────────────────────────────────────────────────────
  const isGlobalMatch = globalCommand === shortcut.key && globalParam !== null
  const activeTestParam = testParam || (isGlobalMatch ? (globalParam ?? '') : '')
  const isTesting = testFocused || isGlobalMatch

  const allResults = isTesting
    ? evaluateRules(shortcut.rules, activeTestParam)
    : null
  const firstMatchIdx = allResults ? allResults.findIndex((r) => r.matched) : -1
  const testResults = allResults
    ? Object.fromEntries(
        allResults.map((r, idx) => [
          r.rule.id,
          idx === firstMatchIdx
            ? r
            : { ...r, matched: false, skipped: firstMatchIdx >= 0 && idx > firstMatchIdx },
        ])
      )
    : null
  const hasNoMatch = allResults !== null && firstMatchIdx === -1

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
            className="shortcut-card-label-text editable"
            onClick={startNameEdit}
            title="Click to edit name"
          >
            {shortcut.name}
          </span>
        ) : (
          <span className="shortcut-card-label-ghost" onClick={startNameEdit}>
            add name
          </span>
        )}
      </div>

      <div className={`shortcut-card${isTesting && !hasNoMatch ? ' card-global-match' : ''}${isTesting && hasNoMatch ? ' card-no-match' : ''}`}>
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
              className="shortcut-key-badge shortcut-key-badge--editable"
              onClick={startKeyEdit}
              title="Click to edit key"
            >
              {shortcut.key}
            </span>
          )}

          {/* Test input – always visible */}
          <input
            className="test-inline-input"
            value={testParam}
            onChange={(e) => setTestParam(e.target.value)}
            onFocus={() => setTestFocused(true)}
            onBlur={() => setTestFocused(false)}
            placeholder="test…"
          />

          <BrowserUrlBanner shortcutKey={shortcut.key} />

          <div className="header-actions">
            <MoreMenu
              onDuplicate={() => onDuplicate(shortcut.id)}
              onDelete={() => onDelete(shortcut.id)}
            />
          </div>
        </div>

        <RuleList
          rules={shortcut.rules}
          testResults={testResults}
          testParam={activeTestParam}
          onReorder={(newRules) => onReorderRules(shortcut.id, newRules)}
          onAdd={(ruleData) => onAddRule(shortcut.id, ruleData)}
          onUpdate={(ruleId, ruleData) => onUpdateRule(shortcut.id, ruleId, ruleData)}
          onDelete={(ruleId) => onDeleteRule(shortcut.id, ruleId)}
        />
      </div>
    </div>
  )
}
