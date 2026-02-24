import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/shared/Layout'
import { ShortcutsPage } from './components/shortcuts/ShortcutsPage'
import { LookupPage } from './components/lookup/LookupPage'

export const App = () => (
  <BrowserRouter>
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/shortcuts/" replace />} />
        <Route path="/shortcuts/*" element={<ShortcutsPage />} />
        <Route path="/lookup/*" element={<LookupPage />} />
      </Routes>
    </Layout>
  </BrowserRouter>
)
