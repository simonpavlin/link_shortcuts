import { useRef } from 'react'
import { IconDownload, IconUpload } from './icons'

type Props = {
  data: unknown
  dataKey: string
  filename: string
  onImport: (value: unknown) => void
  validate?: (value: unknown) => boolean
}

export const DataPorter = ({
  data,
  dataKey,
  filename,
  onImport,
  validate = Array.isArray,
}: Props) => {
  const fileRef = useRef<HTMLInputElement>(null)

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string)
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
        onClick={() => fileRef.current?.click()}
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
