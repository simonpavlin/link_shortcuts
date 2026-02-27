import { useState, useRef } from 'react'

type UseInlineEditOptions = {
  allowEmpty?: boolean
}

type UseInlineEditReturn = {
  editing: boolean
  editValue: string
  setEditValue: (value: string) => void
  startEdit: () => void
  commitEdit: () => void
  cancelEdit: () => void
}

export const useInlineEdit = (
  currentValue: string,
  onCommit: (trimmed: string) => void,
  { allowEmpty = false }: UseInlineEditOptions = {},
): UseInlineEditReturn => {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(currentValue)
  const doneRef = useRef(false)

  const startEdit = () => {
    doneRef.current = false
    setEditValue(currentValue)
    setEditing(true)
  }

  const commitEdit = () => {
    if (doneRef.current) return
    doneRef.current = true
    const trimmed = editValue.trim()
    if (!allowEmpty && !trimmed) {
      setEditing(false)
      return
    }
    if (trimmed !== currentValue) {
      onCommit(trimmed)
    }
    setEditing(false)
  }

  const cancelEdit = () => {
    doneRef.current = true
    setEditValue(currentValue)
    setEditing(false)
  }

  return { editing, editValue, setEditValue, startEdit, commitEdit, cancelEdit }
}
