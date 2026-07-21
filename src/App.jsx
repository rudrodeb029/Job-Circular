import { Routes, Route, useLocation } from 'react-router-dom'
import { useAppContext } from './context/AppContext'
import { AdminProvider } from './context/AdminContext'
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

  // Check if current route is an admin route
  const isAdminRoute = location.pathname.startsWith('/admin')

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
