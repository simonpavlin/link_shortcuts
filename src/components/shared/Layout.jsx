import { NavLink } from 'react-router-dom'

export const Layout = ({ children }) => (
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
      </div>
    </header>
    <main className="layout-content">{children}</main>
  </div>
)
