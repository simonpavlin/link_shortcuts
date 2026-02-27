import { useState, useMemo, useCallback, Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import { evaluateQuery } from '../utils/evaluate'
import { LookupPickerView } from './lookup/LookupPickerView'
import { IconCheck, IconX, IconReturn, IconChevronDown } from './shared/icons'

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

const entryDesc = (entry) => entry.description
  ? <>{entry.description} <span className="eval-url-muted">({entry.url})</span></>
  : entry.url

const EvalTrace = ({ steps, result }) => {
  if (!steps.length) return null

  const [collapsed, setCollapsed] = useState({})
  const toggle = (id) => setCollapsed(p => ({ ...p, [id]: !p[id] }))

  let currentModule = null
  const items = [] // { kind:'flat', id, row } | { kind:'block', id, fnLabel, fnArg, mc, resultRows, summaryType, summaryValue }

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]

    if (step.type === 'parse') {
      currentModule = step.module
      const mCls = step.module ? `eval-module-${step.module}` : ''
      items.push({ kind: 'flat', id: `p${i}`, row:
        <div key={i} className={`eval-step eval-step--parse ${mCls}`}>
          <span className="eval-step-label">{step.module ?? '—'}</span>
          <span className="eval-step-desc">{step.command ?? '—'} {step.param ?? '—'}</span>
        </div>
      })
      continue
    }

    const mc = currentModule ? `eval-module-${currentModule}` : ''
    const block = (fnLabel, fnArg, resultRows, summaryType, summaryValue) =>
      items.push({ kind: 'block', id: `b${i}`, fnLabel, fnArg, mc, resultRows, summaryType, summaryValue })

    switch (step.type) {
      case 'shortcut_found':
        block('hasKey', step.shortcut.key, [resMatchRow(`${i}r`, mc)], 'boolean', true); break
      case 'shortcut_not_found':
        block('hasKey', step.command, [resFailRow(`${i}r`, mc)], 'boolean', false); break
      case 'lookup_found':
        block('hasKey', step.table.key, [resMatchRow(`${i}r`, mc)], 'boolean', true); break
      case 'lookup_not_found':
        block('hasKey', step.command, [resFailRow(`${i}r`, mc)], 'boolean', false); break
      case 'shortcut_rule_fail':
        block('matches', step.rule.label || step.rule.patternType, [resFailRow(`${i}r`, mc)], 'boolean', false); break
      case 'shortcut_match':
        block('matches', step.rule.label || step.rule.patternType, [resMatchRow(`${i}r`, mc)], 'boolean', true); break
      case 'lookup_no_match':
        block('withTags', `[${step.tags.join('], [')}]`, [resFailRow(`${i}r`, mc)], 'boolean', false); break
      case 'lookup_match':
        block('withTags', `[${step.tags.join('], [')}]`, [resOkRow(`${i}r`, entryDesc(step.entry), mc)], 'count', 1); break
      case 'lookup_multi': {
        const resRows = step.entries.map((e, j) => resOkRow(`${i}r${j}`, entryDesc(e), mc))
        block('withTags', `[${step.tags.join('], [')}]`, resRows, 'count', step.entries.length); break
      }
      case 'chain':
        items.push({ kind: 'flat', id: `c${i}`, row:
          <div key={i} className={`eval-step eval-step--child eval-step--action eval-step--navigate ${mc}`}>
            <span className="eval-step-label">redirect</span>
            <span className="eval-step-desc">{step.fromRaw}</span>
          </div>
        }); break
      case 'sentinel':
        items.push({ kind: 'flat', id: `s${i}`, row:
          <div key={i} className={`eval-step eval-step--child eval-step--navigate ${mc}`}>
            <span className="eval-step-label">sentinel</span>
            <span className="eval-step-desc">{step.navigateTo}</span>
          </div>
        }); break
      case 'error':
        items.push({ kind: 'flat', id: `e${i}`, row:
          <div key={i} className={`eval-step eval-step--child eval-step--no-match ${mc}`}>
            <span className="eval-step-label">error</span>
            <span className="eval-step-desc">{step.message}</span>
          </div>
        }); break
      default: break
    }
  }

  // Final action row
  const mc = currentModule ? `eval-module-${currentModule}` : ''
  if (result) {
    let label, desc, cls
    switch (result.type) {
      case 'redirect':  label = 'redirect'; desc = result.url;   cls = 'eval-step--match';    break
      case 'navigate':  label = 'navigate'; desc = result.to;    cls = 'eval-step--navigate'; break
      case 'picker':    label = 'picker';   desc = `${result.entries.length} entries in "${result.table.name || result.table.key}"`; cls = 'eval-step--navigate'; break
      case 'error':     label = 'error';    desc = result.message; cls = 'eval-step--no-match'; break
      default: break
    }
    if (label) items.push({ kind: 'flat', id: 'act', row:
      <div key="act" className={`eval-step eval-step--child eval-step--action ${cls} ${mc}`}>
        <span className="eval-step-label">{label}</span>
        <span className="eval-step-desc">{desc}</span>
      </div>
    })
  }

  return (
    <div className="eval-trace">
      {items.map((item) => {
        if (item.kind === 'flat') return item.row
        const isCollapsed = collapsed[item.id] ?? (item.summaryType === 'boolean')
        return (
          <Fragment key={item.id}>
            <div className={`eval-step eval-step--child eval-step--collapsible ${item.mc}`} onClick={() => toggle(item.id)}>
              <span className="eval-step-label">{item.fnLabel}</span>
              <span className="eval-step-desc">
                {item.fnArg}
                {isCollapsed && item.summaryType === 'boolean' && (
                  <span className="eval-collapsed-count">→ <span className={item.summaryValue ? 'eval-res--ok' : 'eval-res--fail'}>{item.summaryValue ? <IconCheck /> : <IconX />}</span></span>
                )}
                {isCollapsed && item.summaryType === 'count' && (
                  <span className="eval-collapsed-count">→ {item.resultRows.length} {item.resultRows.length === 1 ? 'item' : 'items'}</span>
                )}
              </span>
              <IconChevronDown className={`eval-chevron${isCollapsed ? ' eval-chevron--collapsed' : ''}`} />
            </div>
            {!isCollapsed && item.resultRows}
          </Fragment>
        )
      })}
    </div>
  )
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
          placeholder="go mr 1234"
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
