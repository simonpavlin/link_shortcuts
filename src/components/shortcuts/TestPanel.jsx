import { useState } from 'react'
import { evaluateRules } from '../../utils/shortcuts.utils'
import { Input } from '../shared/Input'

export const TestPanel = ({ rules, prefillParam = '' }) => {
  const [param, setParam] = useState(prefillParam)

  const results = param.length > 0 ? evaluateRules(rules, param) : null
  const hasMatch = results?.some((r) => r.matched)

  return (
    <div className="test-panel">
      <h3 className="test-panel-title">Test rules</h3>
      <Input
        id="test-param"
        placeholder="Enter parameter (e.g. 1234)"
        value={param}
        onChange={(e) => setParam(e.target.value)}
      />

      {results && (
        <div className="test-results">
          {results.map(({ rule, matched, resultUrl }) => (
            <div key={rule.id} className={`test-result${matched ? ' matched' : ''}`}>
              <div className="test-result-header">
                <span className={`test-result-indicator${matched ? ' match' : ''}`}>
                  {matched ? '✓' : '✗'}
                </span>
                <span className="test-result-label">{rule.label || <em className="text-muted">no label</em>}</span>
                <code className="test-result-pattern">{rule.pattern}</code>
              </div>
              {matched && resultUrl && (
                <a
                  href={resultUrl}
                  className="test-result-url"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  → {resultUrl}
                </a>
              )}
            </div>
          ))}
          {!hasMatch && <p className="test-no-match">No rule matched.</p>}
        </div>
      )}
    </div>
  )
}
