import { useState } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import {
  addCondition,
  updateCondition,
  deleteCondition,
  addRule,
  updateRule,
  deleteRule,
  reorderRules,
  duplicateCondition,
} from '../../utils/go.utils'
import { GoCard } from './GoCard'
import { DataPorter } from '../shared/DataPorter'
import { GlobalTestInput } from '../shared/GlobalTestInput'
import { AddCardForm } from '../shared/AddCardForm'
import type { GoCondition } from '../../utils/go.utils'

const STORAGE_KEY = 'linker_shortcuts'
const INITIAL: { shortcuts: GoCondition[] } = { shortcuts: [] }

type Props = {
  prefillCommand: string
  prefillParam: string
}

export const GoAdminView = ({ prefillCommand, prefillParam }: Props) => {
  const [data, setData] = useLocalStorage<{ shortcuts: GoCondition[] }>(STORAGE_KEY, INITIAL)

  // Global test field – initialised from URL params if present
  const [globalTestInput, setGlobalTestInput] = useState(() => {
    if (!prefillCommand) return ''
    return prefillParam ? `${prefillCommand} ${prefillParam}` : prefillCommand
  })
  const [globalFocused, setGlobalFocused] = useState(!!prefillCommand)

  const { shortcuts } = data
  const mutate = (newConditions: GoCondition[]) => setData({ shortcuts: newConditions })

  // Parse global test into command + param (split on first space)
  const spaceIdx = globalTestInput.indexOf(' ')
  const globalCommand = spaceIdx === -1
    ? (globalTestInput.trim() || null)
    : (globalTestInput.slice(0, spaceIdx) || null)
  const globalParam = spaceIdx === -1
    ? null
    : globalTestInput.slice(spaceIdx + 1)

  const handleAddCondition = (form: { key: string; name: string }) => {
    const result = addCondition(shortcuts, form)
    mutate(result.conditions)
  }

  return (
    <div className="admin-page module-go">

      <div className="page-hero">
        <div className="page-hero-eyebrow">
          <span className="page-hero-line" />
          go
          <span className="page-hero-line" />
        </div>
        <h1 className="page-hero-title">
          Redirect <span className="page-hero-accent">Conditions</span>
        </h1>
        <p className="page-hero-desc">
          Define regex-based conditions that map a key and input to a destination URL.
          Use <strong>?q=go key value</strong> to redirect instantly.
        </p>
      </div>

      <GlobalTestInput
        value={globalTestInput}
        onChange={setGlobalTestInput}
        onFocus={() => setGlobalFocused(true)}
        onBlur={() => setGlobalFocused(false)}
        placeholder="Test globally: mr 12345"
      />

      <div className="go-stack">
        {shortcuts.length === 0 && (
          <p className="empty-hint">No conditions yet — add one below.</p>
        )}

        {shortcuts.map((s, i) => (
          <GoCard
            key={s.id}
            condition={s}
            animationDelay={i * 0.07}
            globalCommand={globalFocused ? globalCommand : null}
            globalParam={globalFocused ? globalParam : null}
            onUpdate={(id, formData) => mutate(updateCondition(shortcuts, id, formData))}
            onDelete={(id) => mutate(deleteCondition(shortcuts, id))}
            onDuplicate={(id) => mutate(duplicateCondition(shortcuts, id))}
            onAddRule={(conditionId, ruleData) => mutate(addRule(shortcuts, conditionId, ruleData))}
            onUpdateRule={(conditionId, ruleId, ruleData) =>
              mutate(updateRule(shortcuts, conditionId, ruleId, ruleData))
            }
            onDeleteRule={(conditionId, ruleId) =>
              mutate(deleteRule(shortcuts, conditionId, ruleId))
            }
            onReorderRules={(conditionId, newRules) =>
              mutate(reorderRules(shortcuts, conditionId, newRules))
            }
          />
        ))}

        <AddCardForm
          onAdd={handleAddCondition}
          addLabel="Add condition"
        />
      </div>

      <div className="page-footer-fixed">
        <DataPorter
          data={shortcuts}
          dataKey="shortcuts"
          filename="linker-go.json"
          onImport={(newConditions) => mutate(newConditions as GoCondition[])}
        />
      </div>
    </div>
  )
}
