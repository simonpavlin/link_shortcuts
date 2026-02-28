import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/shared/Layout'
import { CommandRouter } from './components/CommandRouter'
import { GoPage } from './components/go/GoPage'
import { FindPage } from './components/find/FindPage'

export const App = () => (
  <BrowserRouter>
    <Layout>
      <Routes>
        <Route path="/" element={<CommandRouter />} />
        <Route path="/go/*" element={<GoPage />} />
        <Route path="/find/*" element={<FindPage />} />
      </Routes>
    </Layout>
  </BrowserRouter>
)
