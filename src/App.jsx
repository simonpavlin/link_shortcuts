import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/shared/Layout'
import { CommandRouter } from './components/CommandRouter'
import { ShortcutsPage } from './components/shortcuts/ShortcutsPage'
import { LookupPage } from './components/lookup/LookupPage'

export const App = () => (
  <BrowserRouter>
    <Layout>
      <Routes>
        <Route path="/" element={<CommandRouter />} />
        <Route path="/go/*" element={<ShortcutsPage />} />
        <Route path="/find/*" element={<LookupPage />} />
      </Routes>
    </Layout>
  </BrowserRouter>
)
