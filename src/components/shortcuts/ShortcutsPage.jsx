import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { resolveRedirect } from '../../utils/shortcuts.utils'
import { parseSearchParams } from '../../utils/url.utils'
import { AdminView } from './AdminView'

const STORAGE_KEY = 'linker_shortcuts'

const readShortcutsFromStorage = () => {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null')
    return Array.isArray(parsed?.shortcuts) ? parsed.shortcuts : []
  } catch {
    return []
  }
}

export const ShortcutsPage = () => {
  const [searchParams] = useSearchParams()
  const { command, param } = parseSearchParams(searchParams)
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    // Redirect mode: both command and param present, param is not the sentinel "?"
    if (command && param && param !== '?') {
      const result = resolveRedirect(readShortcutsFromStorage(), command, param)
      if (result.found && result.url) {
        setRedirecting(true)
        window.location.replace(result.url)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (redirecting) {
    return (
      <div className="redirect-screen">
        <span>Redirecting…</span>
      </div>
    )
  }

  // Admin mode – prefill test panel if param was provided (but redirect didn't fire)
  const prefillParam = param && param !== '?' ? param : ''

  return <AdminView prefillCommand={command} prefillParam={prefillParam} />
}
