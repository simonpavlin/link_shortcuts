import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { parseSearchParams, resolveUrl } from '../utils/url.utils'
import { resolveRedirect } from '../utils/shortcuts.utils'
import { findTable, searchEntries } from '../utils/lookup.utils'
import { LookupPickerView } from './lookup/LookupPickerView'

const SHORTCUTS_KEY = 'linker_shortcuts'
const LOOKUP_KEY = 'linker_lookup'

const readShortcuts = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(SHORTCUTS_KEY) ?? 'null')
    return Array.isArray(parsed?.shortcuts) ? parsed.shortcuts : []
  } catch { return [] }
}

const readTables = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(LOOKUP_KEY) ?? 'null')
    return Array.isArray(parsed?.tables) ? parsed.tables : []
  } catch { return [] }
}

export const CommandRouter = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [pickerData, setPickerData] = useState(null)

  useEffect(() => {
    const { module, command, param } = parseSearchParams(searchParams)

    // Sentinel: go to admin, optionally prefill the key field
    if (param === '?') {
      const prefill = command ? `?key=${encodeURIComponent(command)}` : ''
      navigate(module === 'lookup' ? `/lookup/${prefill}` : `/shortcuts/${prefill}`, { replace: true })
      return
    }

    if (module === 'shortcuts' && command && param) {
      const result = resolveRedirect(readShortcuts(), command, param)
      if (result.found && result.url) {
        window.location.replace(resolveUrl(result.url))
        return
      }
      navigate(`/shortcuts/?key=${encodeURIComponent(command)}`, { replace: true })
      return
    }

    if (module === 'lookup' && command && param) {
      const tags = param.split(' ').filter(Boolean)
      const table = findTable(readTables(), command)
      if (table) {
        const matches = searchEntries(table, tags)
        if (matches.length === 1) {
          window.location.replace(resolveUrl(matches[0].url))
          return
        }
        if (matches.length > 1) {
          setPickerData({ table, entries: matches, tags })
          return
        }
      }
      navigate(`/lookup/?key=${encodeURIComponent(command)}`, { replace: true })
      return
    }

    // No match or just module with no command → go to admin
    navigate(module === 'lookup' ? '/lookup/' : '/shortcuts/', { replace: true })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (pickerData) {
    return (
      <LookupPickerView
        table={pickerData.table}
        entries={pickerData.entries}
        tags={pickerData.tags}
      />
    )
  }

  return null
}
