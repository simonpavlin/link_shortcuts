import { useRef } from 'react'
import { IconDownload, IconUpload } from '../shared/icons'

export const ImportExport = ({ shortcuts, onImport }) => {
  const fileRef = useRef()

  const handleExport = () => {
    const blob = new Blob([JSON.stringify({ shortcuts }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'linker-shortcuts.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result)
        if (Array.isArray(parsed.shortcuts)) {
          onImport(parsed.shortcuts)
        } else {
          alert('Invalid file format. Expected a "shortcuts" array.')
        }
      } catch {
        alert('Failed to read file. Make sure it is valid JSON.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="import-export">
      <button className="btn btn-ghost btn-sm" onClick={handleExport} title="Export to JSON">
        <IconDownload /> export
      </button>
      <button className="btn btn-ghost btn-sm" onClick={() => fileRef.current.click()} title="Import from JSON">
        <IconUpload /> import
      </button>
      <input
        ref={fileRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  )
}
