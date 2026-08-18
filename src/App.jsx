import { useState, useEffect, useRef } from 'react'
import { Routes, Route, useLocation, useNavigate, useNavigationType } from 'react-router-dom'
import { App as CapacitorApp } from '@capacitor/app'
import { StatusBar, Style } from '@capacitor/status-bar'
import { useAppContext } from './context/AppContext'
import VersionUpdateModal from './components/VersionUpdateModal'
import ConnectivityBanner from './components/ConnectivityBanner'
import ErrorBoundary from './components/ErrorBoundary'
import ModernLoader from './components/ModernLoader'
import { initializePushNotifications } from './utils/notifications'
import { initializeOneSignal } from './utils/oneSignalWrapper'
import { syncCoreDataOnStartup } from './services/supabaseService'

const CURRENT_VERSION = "1.0.9";
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
import EditProfile from './pages/EditProfile'
import Settings from './pages/Settings'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsConditions from './pages/TermsConditions'
import ShareApp from './pages/ShareApp'
import RateUs from './pages/RateUs'
import ContactUs from './pages/ContactUs'
import AboutApp from './pages/AboutApp'
import NotFound from './pages/NotFound'
import QuestionsList from './pages/QuestionsList'
import QuestionDetails from './pages/QuestionDetails'
import LiveExams from './pages/LiveExams'
import LiveExamsPage from './pages/LiveExamsPage'
import LiveExamRoom from './pages/LiveExamRoom'
import QuestionsHub from './pages/QuestionsHub'
import CircularWebViewScreen from './pages/CircularWebViewScreen'

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin'
import AdminLayout from './pages/admin/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import ManageJobs from './pages/admin/ManageJobs'
import ManageNotifications from './pages/admin/ManageNotifications'
import ManageLiveExams from './pages/admin/ManageLiveExams'
import ManageQuestions from './pages/admin/ManageQuestions'
import Statistics from './pages/admin/Statistics'
import Reports from './pages/admin/Reports'
import AdminSettings from './pages/admin/AdminSettings'
import AiManager from './pages/admin/AiManager'

function App() {
  const { state } = useAppContext()
  const location = useLocation()
  const navigate = useNavigate()

  const [updateInfo, setUpdateInfo] = useState(null)
  const [showUpdateModal, setShowUpdateModal] = useState(false)

  // Check if current route is an admin route
  const isAdminRoute = location.pathname.startsWith('/admin')

  useEffect(() => {
    // 0. Strict Startup Sync - Fetch all core data exactly once
    if (!isAdminRoute) {
      syncCoreDataOnStartup();
    }

    // 1. Initialize Push Notifications for non-admin users
    if (!isAdminRoute) {
      initializePushNotifications();
      initializeOneSignal();
    }

    // 2. Set StatusBar - prevent overlay and set proper colors
    if (!isAdminRoute) {
      try {
        // CRITICAL: Prevent status bar from overlapping WebView content
        StatusBar.setOverlaysWebView({ overlay: false });
        
        // Set status bar appearance based on theme
        const isDark = state.theme === 'dark';
        StatusBar.setBackgroundColor({ color: isDark ? '#0f172a' : '#ffffff' });
        StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
      } catch (e) {
        // StatusBar plugin not available on web
      }
    }

    // 3. Handle Android Hardware Back Button
    const backButtonListener = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      if (location.pathname === '/home' || location.pathname === '/' || location.pathname === '/onboarding') {
        // Exit app if on root pages
        CapacitorApp.exitApp();
      } else {
        // Otherwise, navigate back in history
        navigate(-1);
      }
    });

    return () => {
      backButtonListener.remove();
    };
  }, [isAdminRoute, location.pathname, navigate, state.theme]);

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
      <Routes location={location}>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="jobs" element={<ManageJobs />} />
          <Route path="live-exams" element={<ManageLiveExams />} />
          <Route path="questions" element={<ManageQuestions />} />
          <Route path="notifications" element={<ManageNotifications />} />
          <Route path="stats" element={<Statistics />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="ai-manager" element={<AiManager />} />
        </Route>
      </Routes>
    )
  }

  const navigationType = useNavigationType()
  const isBackNavigation = navigationType === 'POP'

  return (
    <ErrorBoundary>
      <div 
        className={`container ${isBackNavigation ? 'nav-direction-back' : 'nav-direction-forward'}`} 
        data-theme={state.theme}
        data-nav-direction={isBackNavigation ? 'back' : 'forward'}
      >
        {!isAdminRoute && <ConnectivityBanner />}
        <Routes location={location}>
          <Route path="/" element={state.hasSeenOnboarding ? <Home /> : <Onboarding />} />
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
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/share" element={<ShareApp />} />
          <Route path="/rate" element={<RateUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/about" element={<AboutApp />} />
          <Route path="/questions/:category" element={<QuestionsList />} />
          <Route path="/question-details/:id" element={<QuestionDetails />} />
          <Route path="/questions-hub" element={<QuestionsHub />} />
          <Route path="/live-exams" element={<LiveExams />} />
          <Route path="/live-exams-list" element={<LiveExams />} />
          <Route path="/live-exam-room/:id" element={<LiveExamRoom />} />
          <Route path="/apply-webview" element={<CircularWebViewScreen />} />
          <Route path="/webview" element={<CircularWebViewScreen />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <VersionUpdateModal 
          isOpen={showUpdateModal}
          updateInfo={updateInfo}
          currentVersion={CURRENT_VERSION}
          onClose={() => setShowUpdateModal(false)}
        />
      </div>
    </ErrorBoundary>
  )
}

export default App
