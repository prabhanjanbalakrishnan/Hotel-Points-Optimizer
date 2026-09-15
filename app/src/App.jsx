import { HashRouter, Routes, Route } from 'react-router-dom'
import { OptimizerProvider } from './context/OptimizerContext.jsx'
import SiteHeader from './components/SiteHeader.jsx'
import Home from './pages/Home.jsx'
import MembershipsPage from './pages/MembershipsPage.jsx'
import DestinationPage from './pages/DestinationPage.jsx'
import ResultsPage from './pages/ResultsPage.jsx'
import StatsPage from './pages/StatsPage.jsx'
import './App.css'

export default function App() {
  return (
    <HashRouter>
      <OptimizerProvider>
        <SiteHeader />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/memberships" element={<MembershipsPage />} />
            <Route path="/destination" element={<DestinationPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/stats" element={<StatsPage />} />
          </Routes>
        </main>
      </OptimizerProvider>
    </HashRouter>
  )
}
