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
import { initializeOneSignal, setupOneSignalClickHandler } from './utils/oneSignalWrapper'
import { syncCoreDataOnStartup } from './services/supabaseService'
import { triggerDeltaSync } from './services/sqliteService'

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
import Feed from './pages/Feed'
import OfflineFeed from './pages/OfflineFeed'

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
import ManageFeed from './pages/admin/ManageFeed'

function App() {
  const { state } = useAppContext()
  const location = useLocation()
  const navigate = useNavigate()

  const [updateInfo, setUpdateInfo] = useState(null)
  const [showUpdateModal, setShowUpdateModal] = useState(false)

  // Check if current route is an admin route
  const isAdminRoute = location.pathname.startsWith('/admin')
  const hasBootedRef = useRef(false)
  const isNotificationProcessingRef = useRef(false)

  // STRICT ONCE-PER-BOOT INITIALIZATION (Protected against React 18 StrictMode Double-Mount)
  useEffect(() => {
    if (hasBootedRef.current || isAdminRoute) return;
    hasBootedRef.current = true;

    console.log('⚡ App Boot: Executing fresh background data sync from Cloudflare Worker...');
    syncCoreDataOnStartup(true).catch(err => console.error('App launch refresh failed:', err));
    triggerDeltaSync().catch(err => console.error('SQLite delta sync failed:', err));
    initializePushNotifications();
    initializeOneSignal();

    // Handle OneSignal Notification Clicks (Protected by Notification Processing Lock)
    setupOneSignalClickHandler(async (data) => {
      console.log('⚡ Push Notification Clicked! Payload:', data);
      if (!data) {
        navigate('/notifications');
        return;
      }

      if (isNotificationProcessingRef.current) {
        console.warn('🔒 Push Notification Lock Active: Skipping duplicate click event.');
        return;
      }
      isNotificationProcessingRef.current = true;

      // Execute unified background sync from Cloudflare Worker & SQLite delta update on push click
      try {
        await Promise.all([
          syncCoreDataOnStartup(true),
          triggerDeltaSync()
        ]);
        console.log('✅ Push Notification Click Sync Complete!');
      } catch (err) {
        console.error('Data refresh from push click failed:', err);
      }

      setTimeout(() => {
        isNotificationProcessingRef.current = false;
      }, 1500);

      const targetType = data.type || data.feedType || '';
      const targetId = data.jobId || data.examId || data.paperId || data.questionId || data.postId || data.id;

      // 1. Live Exam Push
      if (data.examId || targetType === 'live_exam' || targetType === 'exam_reminder') {
        const examId = data.examId || targetId;
        if (examId) {
          navigate(`/live-exam-room/${examId}`);
          return;
        }
      }

      // 2. Question Bank Push
      if (data.paperId || data.questionId || targetType === 'new_paper' || targetType === 'new_question') {
        const paperId = data.paperId || data.questionId || targetId;
        if (paperId) {
          navigate(`/question-details/${paperId}`);
          return;
        }
      }

      // 3. Admit Card / Exam Date Push
      if (targetType === 'admit_card' || targetType === 'exam_date' || targetType === 'admit') {
        const jobId = data.jobId || targetId;
        if (jobId) {
          navigate(`/exam-details/${jobId}`);
          return;
        }
      }

      // 4. Exam Result Push
      if (targetType === 'result') {
        const jobId = data.jobId || targetId;
        if (jobId) {
          navigate(`/result-details/${jobId}`);
          return;
        }
      }

      // 5. Job Circular Push
      if (data.jobId || targetType === 'new_job' || targetType === 'job') {
        const jobId = data.jobId || targetId;
        if (jobId) {
          navigate(`/job/${jobId}`);
          return;
        }
      }

      // 6. Feed Post Push
      if (data.postId || targetType === 'feed_update') {
        navigate('/feed');
        return;
      }

      // Default fallback
      navigate('/notifications');
    });
  }, [isAdminRoute, navigate]);

  useEffect(() => {
    // Set StatusBar - prevent overlay and set proper colors
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
          <Route path="feed" element={<ManageFeed />} />
        </Route>
      </Routes>
    )
  }

  const navigationType = useNavigationType();
  const prevPathRef = useRef(location.pathname);

  // Smart Tab Index Mapping:
  // Home (0) -> Feed (1) -> Saved (2) -> Notifications (3) -> Profile (4)
  const TAB_ORDER = {
    '/': 0,
    '/home': 0,
    '/feed': 1,
    '/saved': 2,
    '/notifications': 3,
    '/profile': 4
  };

  const prevIndex = TAB_ORDER[prevPathRef.current] ?? -1;
  const currentIndex = TAB_ORDER[location.pathname] ?? -1;

  let isBackNavigation = navigationType === 'POP';

  // Rule 1 & 2: Tab-to-Tab Index comparison (Forward: Right-to-Left, Back: Left-to-Right)
  if (prevIndex !== -1 && currentIndex !== -1) {
    if (currentIndex < prevIndex) {
      isBackNavigation = true; // Higher -> Lower Index (Left to Right)
    } else if (currentIndex > prevIndex) {
      isBackNavigation = false; // Lower -> Higher Index (Right to Left)
    }
  } 
  // Rule 3: Returning to Homepage from any secondary or detail page (Left to Right)
  else if (currentIndex === 0) {
    isBackNavigation = true;
  }

  useEffect(() => {
    prevPathRef.current = location.pathname;
  }, [location.pathname]);

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
          <Route path="/feed" element={<Feed />} />
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
          <Route path="/offline-feed" element={<OfflineFeed />} />
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
