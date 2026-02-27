import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { evaluateQuery } from '../utils/evaluate'
import { LookupPickerView } from './lookup/LookupPickerView'
import { HomePage } from './HomePage'

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

  const rawQ = searchParams.get('q') ?? ''

  // Collect all non-q query params as named URL parameters
  const urlParams = useMemo(() => {
    const params = {}
    for (const [key, value] of searchParams.entries()) {
      if (key !== 'q') params[key] = value
    }
    return params
  }, [searchParams])
  const urlParamsStr = JSON.stringify(urlParams)

  const { result } = useMemo(
    () => evaluateQuery(rawQ, readShortcuts(), readTables(), window.location.origin, urlParams),
    [rawQ, urlParamsStr], // eslint-disable-line react-hooks/exhaustive-deps
  )

  useEffect(() => {
    if (result.type === 'redirect') {
      window.location.replace(result.url)
    } else if (result.type === 'navigate') {
      navigate(result.to, { replace: true })
    } else if (result.type === 'picker') {
      setPickerData(result)
    }
  }, [result]) // eslint-disable-line react-hooks/exhaustive-deps

  if (pickerData) {
    return (
      <LookupPickerView
        table={pickerData.table}
        entries={pickerData.entries}
        tags={pickerData.tags}
        params={pickerData.params ?? {}}
      />
    )
  }

  if (result.type === 'none') {
    return <HomePage initialQ={rawQ} />
  }

  return null
}
