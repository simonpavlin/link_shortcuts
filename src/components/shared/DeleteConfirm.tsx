import { useState } from 'react'
import { IconTrash } from './icons'

type Props = {
  onDelete: () => void
  className?: string
  iconTitle?: string
  stopPropagation?: boolean
}

export const DeleteConfirm = ({ onDelete, className, iconTitle = 'Delete', stopPropagation = false }: Props) => {
  const [confirming, setConfirming] = useState(false)

  const stop = (e: React.MouseEvent) => { if (stopPropagation) e.stopPropagation() }

  return (
    <div
      className={className}
      style={confirming ? { opacity: 1 } : undefined}
      onClick={stop}
    >
      {confirming ? (
        <div className="confirm-delete-inline">
          <span className="confirm-text">Delete?</span>
          <button className="btn-yes" onClick={(e) => { stop(e); onDelete() }}>Yes</button>
          <button className="btn-no" onClick={(e) => { stop(e); setConfirming(false) }}>No</button>
        </div>
      ) : (
        <button
          className="icon-btn danger"
          title={iconTitle}
          onClick={(e) => { stop(e); setConfirming(true) }}
        >
          <IconTrash />
        </button>
      )}
    </div>
  )
}
