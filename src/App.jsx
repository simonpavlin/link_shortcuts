import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/shared/Layout'
import { ShortcutsPage } from './components/shortcuts/ShortcutsPage'

export const App = () => (
  <BrowserRouter>
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/shortcuts/" replace />} />
        <Route path="/shortcuts/*" element={<ShortcutsPage />} />
      </Routes>
    </Layout>
  </BrowserRouter>
)
