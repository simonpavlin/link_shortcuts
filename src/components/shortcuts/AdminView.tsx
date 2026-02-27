import { useState } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import {
  addShortcut,
  updateShortcut,
  deleteShortcut,
  addRule,
  updateRule,
  deleteRule,
  reorderRules,
  duplicateShortcut,
} from '../../utils/shortcuts.utils'
import { ShortcutCard } from './ShortcutCard'
import { DataPorter } from '../shared/DataPorter'
import { GlobalTestInput } from '../shared/GlobalTestInput'
import { AddCardForm } from '../shared/AddCardForm'
import type { Shortcut } from '../../utils/shortcuts.utils'

const STORAGE_KEY = 'linker_shortcuts'
const INITIAL: { shortcuts: Shortcut[] } = { shortcuts: [] }

type Props = {
  prefillCommand: string
  prefillParam: string
}

export const AdminView = ({ prefillCommand, prefillParam }: Props) => {
  const [data, setData] = useLocalStorage<{ shortcuts: Shortcut[] }>(STORAGE_KEY, INITIAL)

  // Global test field – initialised from URL params if present
  const [globalTestInput, setGlobalTestInput] = useState(() => {
    if (!prefillCommand) return ''
    return prefillParam ? `${prefillCommand} ${prefillParam}` : prefillCommand
  })
  const [globalFocused, setGlobalFocused] = useState(!!prefillCommand)

  const { shortcuts } = data
  const mutate = (newShortcuts: Shortcut[]) => setData({ shortcuts: newShortcuts })

  // Parse global test into command + param (split on first space)
  const spaceIdx = globalTestInput.indexOf(' ')
  const globalCommand = spaceIdx === -1
    ? (globalTestInput.trim() || null)
    : (globalTestInput.slice(0, spaceIdx) || null)
  const globalParam = spaceIdx === -1
    ? null
    : globalTestInput.slice(spaceIdx + 1)

  const handleAddShortcut = (form: { key: string; name: string }) => {
    const result = addShortcut(shortcuts, form)
    mutate(result.shortcuts)
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

      <div className="shortcuts-stack">
        {shortcuts.length === 0 && (
          <p className="empty-hint">No shortcuts yet — add one below.</p>
        )}

        {shortcuts.map((s, i) => (
          <ShortcutCard
            key={s.id}
            shortcut={s}
            animationDelay={i * 0.07}
            globalCommand={globalFocused ? globalCommand : null}
            globalParam={globalFocused ? globalParam : null}
            onUpdate={(id, formData) => mutate(updateShortcut(shortcuts, id, formData))}
            onDelete={(id) => mutate(deleteShortcut(shortcuts, id))}
            onDuplicate={(id) => mutate(duplicateShortcut(shortcuts, id))}
            onAddRule={(shortcutId, ruleData) => mutate(addRule(shortcuts, shortcutId, ruleData))}
            onUpdateRule={(shortcutId, ruleId, ruleData) =>
              mutate(updateRule(shortcuts, shortcutId, ruleId, ruleData))
            }
            onDeleteRule={(shortcutId, ruleId) =>
              mutate(deleteRule(shortcuts, shortcutId, ruleId))
            }
            onReorderRules={(shortcutId, newRules) =>
              mutate(reorderRules(shortcuts, shortcutId, newRules))
            }
          />
        ))}

        <AddCardForm
          onAdd={handleAddShortcut}
          addLabel="Add shortcut"
        />
      </div>

      <div className="page-footer-fixed">
        <DataPorter
          data={shortcuts}
          dataKey="shortcuts"
          filename="linker-shortcuts.json"
          onImport={(newShortcuts) => mutate(newShortcuts as Shortcut[])}
        />
      </div>
    </div>
  )
}
