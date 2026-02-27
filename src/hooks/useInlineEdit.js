import { useState, useRef } from 'react'

/**
 * Hook for inline editing of a single value (key or name).
 * @param {string} currentValue – the live value from parent state
 * @param {(trimmed: string) => void} onCommit – called with the trimmed value when editing finishes
 * @param {{ allowEmpty?: boolean }} options – allowEmpty: false rejects blank commits (default false)
 * @returns {{ editing, editValue, setEditValue, startEdit, commitEdit, cancelEdit }}
 */
export const useInlineEdit = (currentValue, onCommit, { allowEmpty = false } = {}) => {
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
