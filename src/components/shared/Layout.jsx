import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { IconSun, IconMoon } from './icons'

export const Layout = ({ children }) => {
  const [theme, setTheme] = useLocalStorage('linker_theme', 'dark')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="layout-header-inner">
          <span className="layout-logo">Linker</span>
          <nav className="layout-nav">
            <NavLink
              to="/shortcuts/"
              className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
            >
              Shortcuts
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
    </div>
  )
}
