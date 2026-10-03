import { useState, useEffect, useRef } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate, useNavigationType } from 'react-router-dom'
import { App as CapacitorApp } from '@capacitor/app'
import { Network } from '@capacitor/network'
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
import { Capacitor } from '@capacitor/core'

import BottomNav from './components/BottomNav'
import { showNativeBannerAd, hideNativeBannerAd } from './utils/admobUtils'

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
import SplashScreen from './pages/SplashScreen'

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
import PageTransition, { useNavigationTracker } from './components/NavigationTransition'
import { GlobalLoaderProvider } from './context/GlobalLoaderContext'


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

  // ═══ Phase 3: Native Network Monitoring (Offline Guard) ═══
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    let networkHandler = null;
    const setupNetwork = async () => {
      try {
        const status = await Network.getStatus();
        setIsOffline(!status.connected);
      } catch (e) {
        setIsOffline(!navigator.onLine);
      }
      networkHandler = await Network.addListener('networkStatusChange', (status) => {
        const wasOffline = isOffline;
        setIsOffline(!status.connected);
        // Auto-sync when connectivity RESTORES (offline → online)
        if (status.connected && wasOffline) {
          console.log('🌐 Network restored! Triggering auto-sync...');
          syncCoreDataOnStartup(true).catch(console.error);
          triggerDeltaSync().catch(console.error);
        }
      });
    };
    if (!isAdminRoute) setupNetwork();
    return () => { networkHandler?.remove(); };
  }, [isAdminRoute]);

  // App Resume Sync — catches background → foreground transitions
  useEffect(() => {
    const resumeListener = CapacitorApp.addListener('appStateChange', async ({ isActive }) => {
      if (isActive && !isAdminRoute) {
        console.log('📱 App resumed! Checking for updates...');
        const status = await Network.getStatus().catch(() => ({ connected: navigator.onLine }));
        if (status.connected) {
          syncCoreDataOnStartup().catch(console.error);
          triggerDeltaSync().catch(console.error);
        }
      }
    });
    return () => { resumeListener.remove(); };
  }, [isAdminRoute]);

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
    if (!isAdminRoute && Capacitor.isNativePlatform()) {
      try {
        // CRITICAL: Prevent status bar from overlapping WebView content
        StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {});
        
        // Set status bar appearance based on theme
        const isDark = state.theme === 'dark';
        StatusBar.setBackgroundColor({ color: isDark ? '#0f172a' : '#ffffff' }).catch(() => {});
        StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light }).catch(() => {});
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
  const { direction, isBack } = useNavigationTracker(location, navigationType);

  const hasSeenOnboarding = state.hasSeenOnboarding || JSON.parse(localStorage.getItem('hasSeenOnboarding') || 'false');
  const isHomeOrFeed = location.pathname === '/' || location.pathname === '/home' || location.pathname === '/feed';

  const isTabRoute = (
    (location.pathname === '/' && hasSeenOnboarding) ||
    ['/home', '/feed', '/saved', '/profile', '/notifications'].includes(location.pathname)
  );

  // ═══ Native Banner Ad Visibility Controller ═══
  // Hidden on 5 main tab pages (Home, Feed, Saved, Notifications, Profile), Splash, Onboarding, Admin & Live Exam Room
  // Shown at bottom navbar position on ALL other pages
  useEffect(() => {
    const isExcludedPage = 
      isTabRoute || 
      isAdminRoute || 
      location.pathname === '/splash' || 
      location.pathname === '/onboarding' ||
      location.pathname.startsWith('/live-exam-room');

    if (isExcludedPage) {
      hideNativeBannerAd();
    } else {
      showNativeBannerAd(state.theme === 'dark');
    }
  }, [location.pathname, isTabRoute, isAdminRoute, state.theme]);

  return (
    <ErrorBoundary>
      <GlobalLoaderProvider>
        <div 
          className={`container ${isBack ? 'nav-direction-back' : 'nav-direction-forward'}`} 
          data-theme={state.theme}
          data-nav-direction={direction}
        >
        {!isAdminRoute && <ConnectivityBanner />}

        {/* ═══ Phase 3: Selective Offline Overlay (AdMob Protected) ═══ */}
        {/* Blocks new content browsing offline but allows cached personal pages */}
        {isOffline && !isAdminRoute && (() => {
          const OFFLINE_ALLOWED = ['/saved', '/profile', '/settings', '/about', '/privacy', '/terms', '/edit-profile'];
          const isAllowed = OFFLINE_ALLOWED.some(r => location.pathname.startsWith(r));
          if (!isAllowed) {
            return (
              <div style={{
                position:'fixed',top:0,left:0,right:0,
                bottom:'calc(56px + var(--safe-area-bottom, 0px))',
                zIndex:99999,
                background:'var(--bg)',
                display:'flex',alignItems:'center',justifyContent:'center',
                textAlign:'center',color:'var(--text-primary)',padding:'24px',
                flexDirection:'column',maxWidth:'430px',margin:'0 auto'
              }}>
                <div style={{
                  width:'112px',height:'112px',borderRadius:'50%',
                  background:'linear-gradient(135deg, rgba(26,86,219,0.12) 0%, rgba(59,130,246,0.06) 100%)',
                  border:'1px solid rgba(26,86,219,0.18)',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  marginBottom:'24px'
                }}>
                  <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#1a56db" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="2" y1="2" x2="22" y2="22"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.56 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>
                  </svg>
                </div>
                <h2 style={{margin:'0 0 8px',fontSize:'19px',fontWeight:700,color:'var(--text-primary)',letterSpacing:0}}>
                  {state.language === 'en' ? 'No Internet Connection' : 'ইন্টারনেট সংযোগ নেই'}
                </h2>
                <p style={{margin:'0 0 22px',color:'var(--text-secondary)',fontSize:'14px',lineHeight:1.7,maxWidth:'290px'}}>
                  {state.language === 'en'
                    ? 'An internet connection is required to view new content. Your saved jobs are available from the bottom menu.'
                    : 'নতুন তথ্য দেখতে ইন্টারনেট সংযোগ প্রয়োজন। সংরক্ষিত চাকরি নিচের মেনু থেকে দেখতে পারবেন।'}
                </p>
                <div style={{
                  display:'inline-flex',alignItems:'center',gap:'8px',
                  padding:'8px 16px',borderRadius:'999px',
                  background:'rgba(245,158,11,0.12)',color:'#b45309',
                  fontSize:'12.5px',fontWeight:600
                }}>
                  <span style={{width:'8px',height:'8px',borderRadius:'50%',background:'#f59e0b',animation:'pulse 1.4s ease-in-out infinite'}} />
                  {state.language === 'en' ? 'Waiting for connection…' : 'সংযোগের অপেক্ষায়…'}
                </div>
              </div>
            );
          }
          return null;
        })()}

        <PageTransition isBack={isBack} locationKey={location.key} pathname={location.pathname}>
          <Routes location={location}>
            <Route path="/" element={
              hasSeenOnboarding ? <Home /> : <SplashScreen />
            } />
            <Route path="/splash" element={<SplashScreen />} />
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
        </PageTransition>

        {/* ═══ Phase 5: Centralized BottomNav — on 5 main tab pages ═══ */}
        {isTabRoute && (
          <BottomNav />
        )}

        <VersionUpdateModal 
          isOpen={showUpdateModal}
          updateInfo={updateInfo}
          currentVersion={CURRENT_VERSION}
          onClose={() => setShowUpdateModal(false)}
        />
      </div>
    </GlobalLoaderProvider>
  </ErrorBoundary>
  )
}

export default App
