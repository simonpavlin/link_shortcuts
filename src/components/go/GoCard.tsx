import { useState } from 'react'
import { evaluateRules } from '../../utils/go.utils'
import { buildGoUrl } from '../../utils/url.utils'
import { useInlineEdit } from '../../hooks/useInlineEdit'
import { GoRuleList } from './GoRuleList'
import { MoreMenu } from '../shared/MoreMenu'
import { IconLink, IconCheck } from '../shared/icons'
import type { GoCondition, GoRule } from '../../utils/go.utils'

type Props = {
  condition: GoCondition
  animationDelay?: number
  globalCommand: string | null
  globalParam: string | null
  onUpdate: (id: string, data: { key: string; name: string }) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onAddRule: (conditionId: string, ruleData: Partial<GoRule>) => void
  onUpdateRule: (conditionId: string, ruleId: string, ruleData: Partial<GoRule>) => void
  onDeleteRule: (conditionId: string, ruleId: string) => void
  onReorderRules: (conditionId: string, newRules: GoRule[]) => void
}

export const GoCard = ({
  condition,
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
}: Props) => {
  const [testParam, setTestParam] = useState('')
  const [testFocused, setTestFocused] = useState(false)
  const [copied, setCopied] = useState(false)

  const keyEdit = useInlineEdit(
    condition.key,
    (trimmed) => onUpdate(condition.id, { key: trimmed, name: condition.name }),
    { allowEmpty: false },
  )

  const nameEdit = useInlineEdit(
    condition.name,
    (trimmed) => onUpdate(condition.id, { key: condition.key, name: trimmed }),
    { allowEmpty: true },
  )

  // ── Copy browser URL ────────────────────────────────────────────────────
  const handleCopy = () => {
    navigator.clipboard.writeText(buildGoUrl(window.location.origin, condition.key)).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // ── Rule test results ─────────────────────────────────────────────────────
  const isGlobalMatch = globalCommand === condition.key && globalParam !== null
  const activeTestParam = testParam || (isGlobalMatch ? (globalParam ?? '') : '')
  const isTesting = testFocused || isGlobalMatch

  const allResults = isTesting
    ? evaluateRules(condition.rules, activeTestParam)
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
      className="go-card-wrap"
      style={animationDelay ? { animationDelay: `${animationDelay}s` } : undefined}
    >
      {/* Name label above the card */}
      <div className="go-card-label">
        {nameEdit.editing ? (
          <input
            className="go-card-label-input"
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
        ) : condition.name ? (
          <span
            className="go-card-label-text editable"
            onClick={nameEdit.startEdit}
            title="Click to edit name"
          >
            {condition.name}
          </span>
        ) : (
          <span className="go-card-label-ghost" onClick={nameEdit.startEdit}>
            add name
          </span>
        )}
      </div>

      <div className={`go-card${isTesting && !hasNoMatch ? ' card-global-match' : ''}${isTesting && hasNoMatch ? ' card-no-match' : ''}`}>
        <div className="go-card-header">
          {/* Key badge – click to edit inline */}
          {keyEdit.editing ? (
            <input
              className="go-key-badge go-key-input"
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
              className="go-key-badge go-key-badge--editable"
              onClick={keyEdit.startEdit}
              title="Click to edit key"
            >
              {condition.key}
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
              onDuplicate={() => onDuplicate(condition.id)}
              onDelete={() => onDelete(condition.id)}
            />
          </div>
        </div>

        <GoRuleList
          rules={condition.rules}
          testResults={testResults}
          testParam={activeTestParam}
          onReorder={(newRules) => onReorderRules(condition.id, newRules)}
          onAdd={(ruleData) => onAddRule(condition.id, ruleData)}
          onUpdate={(ruleId, ruleData) => onUpdateRule(condition.id, ruleId, ruleData)}
          onDelete={(ruleId) => onDeleteRule(condition.id, ruleId)}
        />
      </div>
    </div>
  )
}
