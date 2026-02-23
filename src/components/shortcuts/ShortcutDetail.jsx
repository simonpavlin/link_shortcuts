import { BrowserUrlBanner } from './BrowserUrlBanner'
import { RuleList } from './RuleList'
import { TestPanel } from './TestPanel'

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
      <div className="detail-empty">
        select a shortcut or add a new one
      </div>
    )
  }

  return (
    <>
      <div className="detail-header">
        <span className="detail-key-badge">{shortcut.key}</span>
        {shortcut.name && <span className="detail-name">{shortcut.name}</span>}
        <BrowserUrlBanner shortcutKey={shortcut.key} />
      </div>

      <div className="detail-body">
        <RuleList
          rules={shortcut.rules}
          onAdd={(data) => onAddRule(shortcut.id, data)}
          onUpdate={(ruleId, data) => onUpdateRule(shortcut.id, ruleId, data)}
          onDelete={(ruleId) => onDeleteRule(shortcut.id, ruleId)}
          onReorder={(newRules) => onReorderRules(shortcut.id, newRules)}
        />
        <TestPanel rules={shortcut.rules} prefillParam={prefillParam} />
      </div>
    </>
  )
}
