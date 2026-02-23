import { useState } from 'react'
import { evaluateRules } from '../../utils/shortcuts.utils'
import { Eyebrow } from '../shared/Eyebrow'

export const TestPanel = ({ rules, prefillParam = '' }) => {
  const [param, setParam] = useState(prefillParam)

  const results = param.length > 0 ? evaluateRules(rules, param) : null
  const hasMatch = results?.some((r) => r.matched)

  return (
    <div className="detail-section">
      <div className="eyebrow">
        <div className="eyebrow-line" />
        <span className="eyebrow-text">Test</span>
        <div className="eyebrow-line" style={{ maxWidth: 'none', flex: 1 }} />
      </div>
      <div className="test-panel-body">
        <input
          className="input"
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
                    → {resultUrl}
                  </a>
                )}
              </div>
            ))}
            {!hasMatch && <p className="test-no-match">No rule matched.</p>}
          </div>
        )}
      </div>
    </div>
  )
}
