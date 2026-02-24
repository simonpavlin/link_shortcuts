import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { parseSearchParams } from '../../utils/url.utils'
import { findTable, searchEntries } from '../../utils/lookup.utils'
import { LookupAdminView } from './LookupAdminView'
import { LookupPickerView } from './LookupPickerView'

const STORAGE_KEY = 'linker_lookup'

const readTablesFromStorage = () => {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null')
    return Array.isArray(parsed?.tables) ? parsed.tables : []
  } catch {
    return []
  }
}

export const LookupPage = () => {
  const [searchParams] = useSearchParams()
  const [view, setView] = useState(null) // null=loading, 'admin', 'picker', 'redirect'
  const [pickerData, setPickerData] = useState(null)

  useEffect(() => {
    const { command, param } = parseSearchParams(searchParams)
    const tags = param && param !== '?' ? param.split(' ').filter(Boolean) : []

    if (command && tags.length > 0) {
      const tables = readTablesFromStorage()
      const table = findTable(tables, command)
      if (table) {
        const matches = searchEntries(table, tags)
        if (matches.length === 1) {
          window.location.replace(matches[0].url)
          setView('redirect')
          return
        }
        if (matches.length > 1) {
          setPickerData({ table, entries: matches, tags })
          setView('picker')
          return
        }
      }
    }
    setView('admin')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (view === null) return null

  if (view === 'redirect') {
    return <div className="redirect-screen"><span>Redirecting…</span></div>
  }

  if (view === 'picker') {
    return (
      <LookupPickerView
        table={pickerData.table}
        entries={pickerData.entries}
        tags={pickerData.tags}
      />
    )
  }

  return <LookupAdminView />
}
