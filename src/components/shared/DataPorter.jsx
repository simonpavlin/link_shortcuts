import { useRef } from 'react'
import { IconDownload, IconUpload } from './icons'

/**
 * Universal import / export for any module's data.
 *
 * Exports:  { [dataKey]: data }  → <filename>.json
 * Imports:  reads JSON, validates parsed[dataKey], calls onImport(parsed[dataKey])
 *
 * @param {any}      data       – array / object to export
 * @param {string}   dataKey    – top-level key in the JSON file (e.g. "shortcuts", "tables")
 * @param {string}   filename   – download filename  (e.g. "linker-shortcuts.json")
 * @param {Function} onImport   – called with parsed[dataKey] after validation passes
 * @param {Function} [validate] – (val) => boolean  – extra validation; defaults to Array.isArray
 */
export const DataPorter = ({
  data,
  dataKey,
  filename,
  onImport,
  validate = Array.isArray,
}) => {
  const fileRef = useRef()

  const handleExport = () => {
    const blob = new Blob([JSON.stringify({ [dataKey]: data }, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
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
        const value = parsed[dataKey]
        if (validate(value)) {
          onImport(value)
        } else {
          alert(`Invalid file format. Expected a "${dataKey}" field.`)
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
        <IconDownload /> Export
      </button>
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => fileRef.current.click()}
        title="Import from JSON"
      >
        <IconUpload /> Import
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
