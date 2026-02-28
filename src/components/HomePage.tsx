import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { evaluateQuery } from '../utils/evaluate'
import { EvalTrace } from './EvalTrace'
import { FindPickerView } from './find/FindPickerView'
import type { GoCondition } from '../utils/go.utils'
import type { FindTable } from '../utils/find.utils'

const SHORTCUTS_KEY = 'linker_shortcuts'
const LOOKUP_KEY = 'linker_lookup'

const readConditions = (): GoCondition[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(SHORTCUTS_KEY) ?? 'null')
    return Array.isArray(parsed?.shortcuts) ? parsed.shortcuts : []
  } catch { return [] }
}

const readTables = (): FindTable[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(LOOKUP_KEY) ?? 'null')
    return Array.isArray(parsed?.tables) ? parsed.tables : []
  } catch { return [] }
}

type Props = {
  initialQ?: string
}

export const HomePage = ({ initialQ = '' }: Props) => {
  const [input, setInput] = useState(initialQ)
  const navigate = useNavigate()

  const { steps, result } = useMemo(() => {
    return evaluateQuery(input, readConditions(), readTables(), window.location.origin)
  }, [input])

  const canExecute = result.type === 'redirect' || result.type === 'navigate'

  const execute = useCallback(() => {
    if (result.type === 'redirect') {
      window.location.replace(result.url)
    } else if (result.type === 'navigate') {
      navigate(result.to)
    }
  }, [result, navigate])

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
          <FindPickerView
            table={result.table}
            entries={result.entries}
            tags={result.tags ?? []}
            params={result.params ?? {}}
          />
        </div>
      )}
    </div>
  )
}
