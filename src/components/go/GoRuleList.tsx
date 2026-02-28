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
import { GoRuleRow } from './GoRuleRow'
import { PendingRows } from './PendingRows'
import type { GoRule, GoRuleResult } from '../../utils/go.utils'

type Props = {
  rules: GoRule[]
  testResults: Record<string, GoRuleResult> | null
  testParam: string
  onReorder: (newRules: GoRule[]) => void
  onAdd: (ruleData: Partial<GoRule>) => void
  onUpdate: (ruleId: string, ruleData: Partial<GoRule>) => void
  onDelete: (ruleId: string) => void
}

export const GoRuleList = ({
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
            <GoRuleRow
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
