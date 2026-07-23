import { useState, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { useAppContext } from './context/AppContext'
import { AdminProvider } from './context/AdminContext'
import SplashScreen from './pages/SplashScreen'
import VersionUpdateModal from './components/VersionUpdateModal'

const CURRENT_VERSION = "1.0.0";
const VERSION_CHECK_URL = "https://raw.githubusercontent.com/rudrodeb029/Job-Circular/master/version.json";
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import JobDetails from './pages/JobDetails'
import ExamDetails from './pages/ExamDetails'
import ResultDetails from './pages/ResultDetails'
import AllCirculars from './pages/AllCirculars'
import Categories from './pages/Categories'
import SearchFilter from './pages/SearchFilter'
import SavedJobs from './pages/SavedJobs'
import Notifications from './pages/Notifications'
import AdmitCardResult from './pages/AdmitCardResult'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'
import QuestionsList from './pages/QuestionsList'
import QuestionDetails from './pages/QuestionDetails'

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin'
import AdminLayout from './pages/admin/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import ManageJobs from './pages/admin/ManageJobs'
import ManageNotifications from './pages/admin/ManageNotifications'
import Statistics from './pages/admin/Statistics'
import Reports from './pages/admin/Reports'
import AdminSettings from './pages/admin/AdminSettings'

function App() {
  const { state } = useAppContext()
  const location = useLocation()
  
  const [updateInfo, setUpdateInfo] = useState(null)
  const [showUpdateModal, setShowUpdateModal] = useState(false)

  // Check if current route is an admin route
  const isAdminRoute = location.pathname.startsWith('/admin')

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const response = await fetch(VERSION_CHECK_URL)
        if (!response.ok) return
        const data = await response.json()
        
        // Semantic version comparison: e.g., '1.0.1' > '1.0.0'
        const latest = data.latestVersion.split('.').map(Number)
        const current = CURRENT_VERSION.split('.').map(Number)
        
        let hasUpdate = false;
        for (let i = 0; i < Math.max(latest.length, current.length); i++) {
          const l = latest[i] || 0
          const c = current[i] || 0
          if (l > c) {
            hasUpdate = true
            break
          } else if (l < c) {
            break
          }
        }

        if (hasUpdate) {
          setUpdateInfo(data)
          setShowUpdateModal(true)
        }
      } catch (error) {
        console.error("Failed to check app version:", error)
      }
    }

    if (!isAdminRoute) {
      checkVersion()
    }
  }, [isAdminRoute])

  // Admin routes don't use the mobile container
  if (isAdminRoute) {
    return (
      <AdminProvider>
        <Routes location={location}>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="jobs" element={<ManageJobs />} />
            <Route path="notifications" element={<ManageNotifications />} />
            <Route path="stats" element={<Statistics />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </AdminProvider>
    )
  }

  return (
    <div className="container" data-theme={state.theme}>
      <Routes location={location}>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/home" element={<Home />} />
        <Route path="/job/:id" element={<JobDetails />} />
        <Route path="/exam-details/:id" element={<ExamDetails />} />
        <Route path="/result-details/:id" element={<ResultDetails />} />
        <Route path="/all-circulars" element={<AllCirculars />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/search" element={<SearchFilter />} />
        <Route path="/saved" element={<SavedJobs />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/admit-card" element={<AdmitCardResult />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/questions/:category" element={<QuestionsList />} />
        <Route path="/question-details/:id" element={<QuestionDetails />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <VersionUpdateModal 
        isOpen={showUpdateModal}
        updateInfo={updateInfo}
        currentVersion={CURRENT_VERSION}
        onClose={() => setShowUpdateModal(false)}
      />
    </div>
  )
}

export default App
