import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { evaluateQuery } from '../utils/evaluate'
import { LookupPickerView } from './lookup/LookupPickerView'
import { IconCheck, IconX, IconReturn } from './shared/icons'

const SHORTCUTS_KEY = 'linker_shortcuts'
const LOOKUP_KEY = 'linker_lookup'

const readShortcuts = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(SHORTCUTS_KEY) ?? 'null')
    return Array.isArray(parsed?.shortcuts) ? parsed.shortcuts : []
  } catch { return [] }
}

const readTables = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(LOOKUP_KEY) ?? 'null')
    return Array.isArray(parsed?.tables) ? parsed.tables : []
  } catch { return [] }
}

// ─── Row builders ─────────────────────────────────────────────────────────────

const fnRow = (id, label, arg, mc) => (
  <div key={id} className={`eval-step eval-step--child ${mc}`}>
    <span className="eval-step-label">{label}</span>
    <span className="eval-step-desc">{arg}</span>
  </div>
)


const resOkRow = (id, desc, mc) => (
  <div key={id} className={`eval-step eval-step--child-2 ${mc}`}>
    <span className="eval-step-label"><IconReturn /></span>
    <span className="eval-step-desc">{desc}</span>
  </div>
)

const resMatchRow = (id, mc) => (
  <div key={id} className={`eval-step eval-step--child-2 ${mc}`}>
    <span className="eval-step-label"><IconReturn /></span>
    <span className="eval-step-desc eval-res--ok"><IconCheck /></span>
  </div>
)

const resFailRow = (id, mc) => (
  <div key={id} className={`eval-step eval-step--child-2 ${mc}`}>
    <span className="eval-step-label"><IconReturn /></span>
    <span className="eval-step-desc eval-res--fail"><IconX /></span>
  </div>
)

// ─── EvalTrace ────────────────────────────────────────────────────────────────

const EvalTrace = ({ steps, result }) => {
  if (!steps.length) return null

  let currentModule = null
  let currentParam = null
  const rows = []

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]
    if (step.type === 'parse') {
      currentModule = step.module
      currentParam = step.param ?? null
      const mCls = step.module ? `eval-module-${step.module}` : ''
      rows.push(
        <div key={i} className={`eval-step eval-step--parse ${mCls}`}>
          <span className="eval-step-label">{step.module ?? '—'}</span>
          <span className="eval-step-desc">{step.command ?? '—'} {step.param ?? '—'}</span>
        </div>
      )
      continue
    }

    const mc = currentModule ? `eval-module-${currentModule}` : ''

    switch (step.type) {
      case 'shortcut_found':
        rows.push(fnRow(`${i}f`, 'hasKey', step.shortcut.key, mc))
        rows.push(resMatchRow(`${i}r`, mc))
        break

      case 'shortcut_not_found':
        rows.push(fnRow(`${i}f`, 'hasKey', step.command, mc))
        rows.push(resFailRow(`${i}r`, mc))
        break

      case 'lookup_found':
        rows.push(fnRow(`${i}f`, 'hasKey', step.table.key, mc))
        rows.push(resMatchRow(`${i}r`, mc))
        break

      case 'lookup_not_found':
        rows.push(fnRow(`${i}f`, 'hasKey', step.command, mc))
        rows.push(resFailRow(`${i}r`, mc))
        break

      case 'shortcut_rule_fail':
        rows.push(fnRow(`${i}f`, 'matches', step.rule.label || step.rule.patternType, mc))
        rows.push(resFailRow(`${i}r`, mc))
        break

      case 'shortcut_match':
        rows.push(fnRow(`${i}f`, 'matches', step.rule.label || step.rule.patternType, mc))
        rows.push(resMatchRow(`${i}r`, mc))
        break

      case 'lookup_no_match':
        rows.push(fnRow(`${i}f`, 'hasTags', `[${step.tags.join('], [')}]`, mc))
        rows.push(resFailRow(`${i}r`, mc))
        break

      case 'lookup_match': {
        const e = step.entry
        const desc = e.description ? `${e.description} (${e.url})` : e.url
        rows.push(fnRow(`${i}f`, 'hasTags', `[${step.tags.join('], [')}]`, mc))
        rows.push(resOkRow(`${i}r`, desc, mc))
        break
      }

      case 'lookup_multi':
        rows.push(fnRow(`${i}f`, 'hasTags', `[${step.tags.join('], [')}]`, mc))
        step.entries.forEach((entry, j) => {
          const desc = entry.description ? `${entry.description} (${entry.url})` : entry.url
          rows.push(resOkRow(`${i}r${j}`, desc, mc))
        })
        break

      case 'chain':
        rows.push(
          <div key={i} className={`eval-step eval-step--child eval-step--action eval-step--navigate ${mc}`}>
            <span className="eval-step-label">redirect</span>
            <span className="eval-step-desc">{step.fromRaw}</span>
          </div>
        )
        break

      case 'sentinel':
        rows.push(
          <div key={i} className={`eval-step eval-step--child eval-step--navigate ${mc}`}>
            <span className="eval-step-label">sentinel</span>
            <span className="eval-step-desc">{step.navigateTo}</span>
          </div>
        )
        break

      case 'error':
        rows.push(
          <div key={i} className={`eval-step eval-step--child eval-step--no-match ${mc}`}>
            <span className="eval-step-label">error</span>
            <span className="eval-step-desc">{step.message}</span>
          </div>
        )
        break

      default: break
    }
  }

  // Action (result) — level 1 label + level 2 detail, same hierarchy as function calls
  const mc = currentModule ? `eval-module-${currentModule}` : ''
  if (result) {
    let label, desc, cls
    switch (result.type) {
      case 'redirect':
        label = 'redirect'; desc = result.url; cls = 'eval-step--match'; break
      case 'navigate':
        label = 'navigate'; desc = result.to; cls = 'eval-step--navigate'; break
      case 'picker':
        label = 'picker'
        desc = `${result.entries.length} entries in "${result.table.name || result.table.key}"`
        cls = 'eval-step--navigate'; break
      case 'error':
        label = 'error'; desc = result.message; cls = 'eval-step--no-match'; break
      default: break
    }
    if (label) {
      rows.push(
        <div key="act" className={`eval-step eval-step--child eval-step--action ${cls} ${mc}`}>
          <span className="eval-step-label">{label}</span>
          <span className="eval-step-desc">{desc}</span>
        </div>
      )
    }
  }

  return <div className="eval-trace">{rows}</div>
}

// ─── HomePage ─────────────────────────────────────────────────────────────────

export const HomePage = ({ initialQ = '' }) => {
  const [input, setInput] = useState(initialQ)
  const navigate = useNavigate()

  const { steps, result } = useMemo(() => {
    return evaluateQuery(input, readShortcuts(), readTables(), window.location.origin)
  }, [input])

  const canExecute = result.type === 'redirect' || result.type === 'navigate'

  const execute = useCallback(() => {
    if (result.type === 'redirect') {
      window.location.replace(result.url)
    } else if (result.type === 'navigate') {
      navigate(result.to)
    }
  }, [result, navigate])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && canExecute) execute()
  }

  return (
    <div className="home-page">
      <div className="home-input-row">
        <input
          type="text"
          className="home-input"
          placeholder="shortcuts mr 1234"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          spellCheck={false}
          autoComplete="off"
        />
        <button
          className="home-go-btn"
          onClick={execute}
          disabled={!canExecute}
        >
          Go ↵
        </button>
      </div>

      <EvalTrace steps={steps} result={result} />

      {result.type === 'picker' && (
        <div className="home-picker">
          <LookupPickerView
            table={result.table}
            entries={result.entries}
            tags={result.tags ?? []}
          />
        </div>
      )}
    </div>
  )
}
