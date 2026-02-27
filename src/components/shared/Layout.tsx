import { useEffect, useState, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { IconSun, IconMoon } from './icons'

type Props = {
  children: React.ReactNode
}

export const Layout = ({ children }: Props) => {
  const [theme, setTheme] = useLocalStorage<string>('linker_theme', 'dark')
  const [toast, setToast] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        const tag = document.activeElement?.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA') return
        e.preventDefault()
        if (toastTimer.current) clearTimeout(toastTimer.current)
        setToast(true)
        toastTimer.current = setTimeout(() => setToast(false), 2000)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="layout-header-inner">
          <NavLink to="/" className="layout-logo">Linker</NavLink>
          <nav className="layout-nav">
            <NavLink
              to="/go/"
              className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
            >
              Conditions<span className="nav-link-cmd nav-link-cmd--go">[go]</span>
            </NavLink>
            <NavLink
              to="/find/"
              className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
            >
              Tables<span className="nav-link-cmd nav-link-cmd--find">[find]</span>
            </NavLink>
          </nav>
          <div style={{ flex: 1 }} />
          <button
            className="icon-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <IconSun /> : <IconMoon />}
          </button>
        </div>
      </header>
      <main className="layout-content">{children}</main>
      {toast && (
        <div className="toast-saved">
          <svg className="toast-check-svg" viewBox="0 0 16 16" fill="none">
            <polyline className="toast-check-path" points="3,8.5 6.5,12 13,4" />
          </svg>
          Saved
        </div>
      )}
    </div>
  )
}
