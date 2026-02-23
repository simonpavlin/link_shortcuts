import { RuleList } from './RuleList'
import { TestPanel } from './TestPanel'
import { BrowserUrlBanner } from './BrowserUrlBanner'

export const ShortcutDetail = ({
  shortcut,
  prefillParam,
  onAddRule,
  onUpdateRule,
  onDeleteRule,
  onReorderRules,
}) => {
  if (!shortcut) {
    return (
      <div className="shortcut-detail-empty">
        <p className="text-muted">Select a shortcut on the left or add a new one.</p>
      </div>
    )
  }

  return (
    <div className="shortcut-detail">
      <div className="shortcut-detail-header">
        <h2 className="shortcut-detail-title">
          <code>{shortcut.key}</code>
          {shortcut.name && <span> – {shortcut.name}</span>}
        </h2>
        <BrowserUrlBanner shortcutKey={shortcut.key} />
      </div>

      <div className="shortcut-detail-body">
        <RuleList
          rules={shortcut.rules}
          onAdd={(data) => onAddRule(shortcut.id, data)}
          onUpdate={(ruleId, data) => onUpdateRule(shortcut.id, ruleId, data)}
          onDelete={(ruleId) => onDeleteRule(shortcut.id, ruleId)}
          onReorder={(newRules) => onReorderRules(shortcut.id, newRules)}
        />
        <TestPanel rules={shortcut.rules} prefillParam={prefillParam} />
      </div>
    </div>
  )
}
