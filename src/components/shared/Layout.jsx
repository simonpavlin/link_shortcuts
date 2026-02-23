import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'

export const Layout = ({ children }) => {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('linker_theme') || 'light'
  )

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('linker_theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="layout-header-left">
          <span className="layout-logo">Linker</span>
          <nav className="layout-nav">
            <NavLink
              to="/shortcuts/"
              className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
            >
              Shortcuts
            </NavLink>
          </nav>
        </div>
        <button className="btn-icon theme-toggle" onClick={toggleTheme} title="Toggle theme">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </header>
      <main className="layout-content">{children}</main>
    </div>
  )
}
