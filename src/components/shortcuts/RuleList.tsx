import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { RuleRow } from './RuleRow'
import { PendingRows } from './PendingRows'
import type { Rule, RuleResult } from '../../utils/shortcuts.utils'

type Props = {
  rules: Rule[]
  testResults: Record<string, RuleResult> | null
  testParam: string
  onReorder: (newRules: Rule[]) => void
  onAdd: (ruleData: Partial<Rule>) => void
  onUpdate: (ruleId: string, ruleData: Partial<Rule>) => void
  onDelete: (ruleId: string) => void
}

export const RuleList = ({
  rules,
  testResults,
  testParam,
  onReorder,
  onAdd,
  onUpdate,
  onDelete,
}: Props) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    const oldIndex = rules.findIndex((r) => r.id === active.id)
    const newIndex = rules.findIndex((r) => r.id === over.id)
    onReorder(arrayMove(rules, oldIndex, newIndex))
  }

  const sortableIds = rules.map((r) => r.id)

  return (
    <div className="rule-table">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
          {rules.map((rule, idx) => (
            <RuleRow
              key={rule.id}
              rule={rule}
              matchResult={testResults ? (testResults[rule.id] ?? null) : null}
              testParam={testParam}
              testIndex={idx}
              onSave={(data) => onUpdate(rule.id, data)}
              onDelete={() => onDelete(rule.id)}
            />
          ))}
        </SortableContext>
      </DndContext>

      <PendingRows onAdd={onAdd} />
    </div>
  )
}
