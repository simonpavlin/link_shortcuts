import { useSortable } from '@dnd-kit/sortable'

export const RuleRow = ({ rule, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: rule.id })

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 1 : undefined,
  }

  return (
    <div ref={setNodeRef} style={style} className={`rule-row${isDragging ? ' dragging' : ''}`}>
      <span className="rule-drag-handle" {...attributes} {...listeners} title="Drag to reorder">⠿</span>
      <span className="rule-label">{rule.label || <em style={{ color: 'var(--text-label)' }}>—</em>}</span>
      <code className="rule-pattern">{rule.pattern}</code>
      <span className="rule-url">{rule.url}</span>
      <div className="rule-row-actions">
        <button className="btn-icon-bare" onClick={onEdit} title="Edit">edit</button>
        <button className="btn-icon-bare danger" onClick={onDelete} title="Delete">del</button>
      </div>
    </div>
  )
}
