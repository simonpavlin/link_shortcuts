import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { RuleRow } from './RuleRow'
import { RuleEditor } from './RuleEditor'
import { Button } from '../shared/Button'

export const RuleList = ({ rules, onReorder, onAdd, onUpdate, onDelete }) => {
  const [editing, setEditing] = useState(null) // null | 'new' | rule object

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return
    const oldIndex = rules.findIndex((r) => r.id === active.id)
    const newIndex = rules.findIndex((r) => r.id === over.id)
    onReorder(arrayMove(rules, oldIndex, newIndex))
  }

  const handleSave = (formData) => {
    editing === 'new' ? onAdd(formData) : onUpdate(editing.id, formData)
    setEditing(null)
  }

  return (
    <div className="rule-list">
      <div className="rule-list-header">
        <h3>Rules</h3>
        <Button variant="primary" size="sm" onClick={() => setEditing('new')}>
          + Add rule
        </Button>
      </div>

      {rules.length === 0 ? (
        <p className="empty-state">No rules yet. Add your first rule.</p>
      ) : (
        <div className="rule-list-table">
          <div className="rule-list-thead">
            <span />
            <span>Label</span>
            <span>Pattern</span>
            <span>Target URL</span>
            <span />
          </div>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={rules.map((r) => r.id)} strategy={verticalListSortingStrategy}>
              {rules.map((rule) => (
                <RuleRow
                  key={rule.id}
                  rule={rule}
                  onEdit={() => setEditing(rule)}
                  onDelete={() => onDelete(rule.id)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}

      {editing && (
        <RuleEditor
          rule={editing === 'new' ? null : editing}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  )
}
