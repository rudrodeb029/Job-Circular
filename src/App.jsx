import { Routes, Route, useLocation } from 'react-router-dom'
import { useAppContext } from './context/AppContext'
import SplashScreen from './pages/SplashScreen'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import JobDetails from './pages/JobDetails'
import Categories from './pages/Categories'
import SearchFilter from './pages/SearchFilter'
import SavedJobs from './pages/SavedJobs'
import Notifications from './pages/Notifications'
import AdmitCardResult from './pages/AdmitCardResult'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'

function App() {
  const { state } = useAppContext()
  const location = useLocation()

  return (
    <div className="container" data-theme={state.theme}>
      <Routes location={location}>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/home" element={<Home />} />
        <Route path="/job/:id" element={<JobDetails />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/search" element={<SearchFilter />} />
        <Route path="/saved" element={<SavedJobs />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/admit-card" element={<AdmitCardResult />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default App
