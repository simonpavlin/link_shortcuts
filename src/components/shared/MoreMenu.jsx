import { useState, useEffect, useRef } from 'react'
import { IconTrash, IconMoreDots, IconCopy } from './icons'

export const MoreMenu = ({ onDuplicate, onDelete }) => {
  const [open, setOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (!menuRef.current?.contains(e.target)) {
        setOpen(false)
        setConfirming(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={menuRef} className="more-menu-wrap">
      <button
        className="icon-btn"
        onClick={() => { setOpen((o) => !o); setConfirming(false) }}
        title="More options"
      >
        <IconMoreDots />
      </button>
      {open && (
        <div className="more-menu-dropdown">
          <button
            className="more-menu-item"
            onClick={() => { onDuplicate(); setOpen(false) }}
          >
            <IconCopy /> Duplicate
          </button>
          {confirming ? (
            <div className="more-menu-confirm">
              <span>Delete?</span>
              <button
                className="btn-yes"
                onClick={() => { onDelete(); setOpen(false); setConfirming(false) }}
              >
                Yes
              </button>
              <button className="btn-no" onClick={() => setConfirming(false)}>No</button>
            </div>
          ) : (
            <button className="more-menu-item danger" onClick={() => setConfirming(true)}>
              <IconTrash /> Delete
            </button>
          )}
        </div>
      )}
    </div>
  )
}
