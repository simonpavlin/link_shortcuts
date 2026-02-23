import { Button } from '../shared/Button'

export const ShortcutList = ({ shortcuts, selectedId, onSelect, onAdd, onEdit, onDelete }) => (
  <aside className="shortcut-sidebar">
    <div className="shortcut-sidebar-header">
      <h2>Shortcuts</h2>
      <Button variant="primary" size="sm" onClick={onAdd}>
        + Add
      </Button>
    </div>

    <ul className="shortcut-list">
      {shortcuts.length === 0 && (
        <li className="shortcut-list-empty">
          <p className="text-muted text-sm">No shortcuts yet.</p>
        </li>
      )}
      {shortcuts.map((s) => (
        <li
          key={s.id}
          className={`shortcut-item${s.id === selectedId ? ' selected' : ''}`}
          onClick={() => onSelect(s.id)}
        >
          <div className="shortcut-item-content">
            <code className="shortcut-item-key">{s.key}</code>
            <span className="shortcut-item-name">{s.name}</span>
            <span className="shortcut-item-count text-muted text-xs">
              {s.rules.length} {s.rules.length === 1 ? 'rule' : 'rules'}
            </span>
          </div>
          <div className="shortcut-item-actions">
            <button
              className="btn-icon-sm"
              onClick={(e) => { e.stopPropagation(); onEdit(s) }}
              title="Edit"
            >
              ✎
            </button>
            <button
              className="btn-icon-sm danger"
              onClick={(e) => { e.stopPropagation(); onDelete(s.id) }}
              title="Delete"
            >
              ✕
            </button>
          </div>
        </li>
      ))}
    </ul>
  </aside>
)
