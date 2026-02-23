import { useSortable } from '@dnd-kit/sortable'
import { Button } from '../shared/Button'

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
      <span className="rule-drag-handle" {...attributes} {...listeners} title="Drag to reorder">
        ⠿
      </span>
      <span className="rule-label">
        {rule.label || <em className="text-muted">no label</em>}
      </span>
      <code className="rule-pattern">{rule.pattern}</code>
      <span className="rule-url">{rule.url}</span>
      <div className="rule-actions">
        <Button variant="ghost" size="sm" onClick={onEdit}>Edit</Button>
        <Button variant="danger" size="sm" onClick={onDelete}>Delete</Button>
      </div>
    </div>
  )
}
