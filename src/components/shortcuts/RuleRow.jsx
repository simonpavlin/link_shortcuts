import { useSortable } from '@dnd-kit/sortable'
import { IconDrag, IconPencil, IconTrash, IconArrowRight } from '../shared/icons'

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
        <IconDrag />
      </span>
      <span className="rule-pattern-text">{rule.pattern}</span>
      <span className="rule-arrow-icon"><IconArrowRight /></span>
      <span className="rule-url-text">{rule.url}</span>
      <div className="rule-row-actions">
        <button className="icon-btn" onClick={onEdit} title="Edit"><IconPencil /></button>
        <button className="icon-btn danger" onClick={onDelete} title="Delete"><IconTrash /></button>
      </div>
    </div>
  )
}
