import { useState } from 'react'
import { evaluateRules } from '../../utils/shortcuts.utils'
import { buildBrowserUrl } from '../../utils/url.utils'
import { useInlineEdit } from '../../hooks/useInlineEdit'
import { RuleList } from './RuleList'
import { MoreMenu } from '../shared/MoreMenu'
import { IconLink, IconCheck } from '../shared/icons'

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
  const [copied, setCopied] = useState(false)

  const keyEdit = useInlineEdit(
    shortcut.key,
    (trimmed) => onUpdate(shortcut.id, { key: trimmed, name: shortcut.name }),
    { allowEmpty: false },
  )

  const nameEdit = useInlineEdit(
    shortcut.name,
    (trimmed) => onUpdate(shortcut.id, { key: shortcut.key, name: trimmed }),
    { allowEmpty: true },
  )

  // ── Copy browser URL ────────────────────────────────────────────────────
  const handleCopy = () => {
    navigator.clipboard.writeText(buildBrowserUrl(window.location.origin, shortcut.key)).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
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
        {nameEdit.editing ? (
          <input
            className="shortcut-card-label-input"
            value={nameEdit.editValue}
            onChange={(e) => nameEdit.setEditValue(e.target.value)}
            onBlur={nameEdit.commitEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); nameEdit.commitEdit() }
              if (e.key === 'Escape') nameEdit.cancelEdit()
            }}
            placeholder="name"
            autoFocus
          />
        ) : shortcut.name ? (
          <span
            className="shortcut-card-label-text editable"
            onClick={nameEdit.startEdit}
            title="Click to edit name"
          >
            {shortcut.name}
          </span>
        ) : (
          <span className="shortcut-card-label-ghost" onClick={nameEdit.startEdit}>
            add name
          </span>
        )}
      </div>

      <div className={`shortcut-card${isTesting && !hasNoMatch ? ' card-global-match' : ''}${isTesting && hasNoMatch ? ' card-no-match' : ''}`}>
        <div className="shortcut-card-header">
          {/* Key badge – click to edit inline */}
          {keyEdit.editing ? (
            <input
              className="shortcut-key-badge shortcut-key-input"
              value={keyEdit.editValue}
              onChange={(e) => keyEdit.setEditValue(e.target.value)}
              onBlur={keyEdit.commitEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); keyEdit.commitEdit() }
                if (e.key === 'Escape') keyEdit.cancelEdit()
              }}
              autoFocus
            />
          ) : (
            <span
              className="shortcut-key-badge shortcut-key-badge--editable"
              onClick={keyEdit.startEdit}
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

          <button
            className={`url-copy-btn${copied ? ' copied' : ''}`}
            onClick={handleCopy}
            title="Copy browser search engine URL"
          >
            {copied ? <IconCheck /> : <IconLink />}
            {copied ? 'Copied' : 'Browser URL'}
          </button>

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
