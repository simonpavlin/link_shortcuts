import { useState, useEffect } from 'react'
import { evaluateRules } from '../../utils/shortcuts.utils'
import { Eyebrow } from '../shared/Eyebrow'
import { IconChevronDown, IconCheck, IconMinus, IconArrowRight } from '../shared/icons'

export const TestPanel = ({ rules, prefillParam = '' }) => {
  const [open, setOpen] = useState(false)
  const [param, setParam] = useState(prefillParam)

  // Auto-open when a prefill is provided (e.g. from URL ?param=?)
  useEffect(() => {
    if (prefillParam) setOpen(true)
  }, [prefillParam])

  const results = param.length > 0 ? evaluateRules(rules, param) : null
  const hasMatch = results?.some((r) => r.matched)

  const chevron = (
    <span className={`collapse-chevron${open ? ' open' : ''}`}>
      <IconChevronDown />
    </span>
  )

  return (
    <div className="detail-section">
      <Eyebrow onClick={() => setOpen((o) => !o)} right={chevron}>
        Test
      </Eyebrow>

      {open && (
        <div className="test-panel-body">
          <input
            className="input"
            placeholder="Enter parameter (e.g. 1234)"
            value={param}
            onChange={(e) => setParam(e.target.value)}
            autoFocus
          />

          {results && (
            <div className="test-results">
              {results.map(({ rule, matched, resultUrl }) => (
                <div key={rule.id} className={`test-result${matched ? ' matched' : ''}`}>
                  <div className="test-result-header">
                    <span className={`test-result-indicator${matched ? ' match' : ''}`}>
                      {matched ? <IconCheck /> : <IconMinus />}
                    </span>
                    <span className="test-result-label">
                      {rule.label || <em style={{ color: 'var(--text-label)' }}>no label</em>}
                    </span>
                    <code className="test-result-pattern">{rule.pattern}</code>
                  </div>
                  {matched && resultUrl && (
                    <a
                      href={resultUrl}
                      className="test-result-url"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <IconArrowRight /> {resultUrl}
                    </a>
                  )}
                </div>
              ))}
              {!hasMatch && <p className="test-no-match">No rule matched.</p>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
