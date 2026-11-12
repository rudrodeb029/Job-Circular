import { useState, useEffect, useRef } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate, useNavigationType } from 'react-router-dom'
import { App as CapacitorApp } from '@capacitor/app'
import { Network } from '@capacitor/network'
import { StatusBar, Style } from '@capacitor/status-bar'
import { useAppContext } from './context/AppContext'
import VersionUpdateModal from './components/VersionUpdateModal'
import ConnectivityBanner from './components/ConnectivityBanner'
import ModernOfflineIcon from './components/ModernOfflineIcon'
import ErrorBoundary from './components/ErrorBoundary'
import ModernLoader from './components/ModernLoader'
import { initializePushNotifications } from './utils/notifications'
import { initializeOneSignal, setupOneSignalClickHandler, setupOneSignalForegroundHandler, loginOneSignal } from './utils/oneSignalWrapper'
import { syncCoreDataOnStartup } from './services/supabaseService'
import { triggerDeltaSync } from './services/sqliteService'
import { Capacitor } from '@capacitor/core'

import BottomNav from './components/BottomNav'
import { showNativeBannerAd, hideNativeBannerAd, navigateWithAdOnReturn } from './utils/admobUtils'
import { handleAppBackButton } from './utils/backButtonManager'
import { logAnalyticsEvent } from './firebase'

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
import UserMessages from './pages/admin/UserMessages'
import PageTransition, { useNavigationTracker } from './components/NavigationTransition'
import { GlobalLoaderProvider } from './context/GlobalLoaderContext'


function App() {
  const { state } = useAppContext()
  const location = useLocation()
  const navigate = useNavigate()

  // Check if current route is an admin route
  const isAdminRoute = location.pathname.startsWith('/admin')
  const hasBootedRef = useRef(false)
  const isNotificationProcessingRef = useRef(false)

  const [updateInfo, setUpdateInfo] = useState(null)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [exitToast, setExitToast] = useState(null)

  // Context Ref for zero-stale back button navigation
  const backNavContextRef = useRef({
    location,
    navigate,
    showUpdateModal,
    state,
    isAdminRoute
  })

  useEffect(() => {
    backNavContextRef.current = {
      location,
      navigate,
      showUpdateModal,
      state,
      isAdminRoute
    }
  }, [location, navigate, showUpdateModal, state, isAdminRoute])

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
    let handle = null;
    let isSubscribed = true;

    CapacitorApp.addListener('appStateChange', async ({ isActive }) => {
      if (isActive && !isAdminRoute) {
        console.log('📱 App resumed! Checking for updates...');
        const status = await Network.getStatus().catch(() => ({ connected: navigator.onLine }));
        if (status.connected) {
          syncCoreDataOnStartup(true).catch(console.error);
          triggerDeltaSync().catch(console.error);
        }
      }
    }).then(h => {
      if (!isSubscribed) {
        h.remove();
      } else {
        handle = h;
      }
    }).catch(console.error);

    return () => {
      isSubscribed = false;
      handle?.remove();
    };
  }, [isAdminRoute]);

  // STRICT ONCE-PER-BOOT INITIALIZATION (Protected against React 18 StrictMode Double-Mount)
  useEffect(() => {
    if (hasBootedRef.current || isAdminRoute) return;
    hasBootedRef.current = true;

    // Reset initial splash inline background so theme CSS smoothly takes over
    if (typeof document !== 'undefined') {
      document.documentElement.style.backgroundColor = '';
      document.body.style.backgroundColor = '';
    }

    console.log('⚡ App Boot: Executing fresh background data sync from Cloudflare Worker...');
    syncCoreDataOnStartup(true).catch(err => console.error('App launch refresh failed:', err));
    triggerDeltaSync().catch(err => console.error('SQLite delta sync failed:', err));
    initializePushNotifications();
    initializeOneSignal();
    if (state.user?.id) {
      loginOneSignal(state.user.id);
    }

    // Handle OneSignal Foreground Push Reception (Auto-update app data immediately when push arrives)
    setupOneSignalForegroundHandler(async (data) => {
      console.log('⚡ Push Notification Arrived in Foreground! Auto-syncing new content:', data);
      try {
        await Promise.all([
          syncCoreDataOnStartup('push_force'),
          triggerDeltaSync()
        ]);
        window.dispatchEvent(new CustomEvent('force_app_data_reload'));
        console.log('✅ Foreground Push Auto-Sync Complete!');
      } catch (err) {
        console.error('Data refresh from foreground push failed:', err);
      }
    });

    // Handle OneSignal Notification Clicks (Protected by Notification Processing Lock)
    setupOneSignalClickHandler(async (data) => {
      console.log('⚡ Push Notification Clicked! Payload:', data);
      if (isNotificationProcessingRef.current) {
        console.warn('🔒 Push Notification Lock Active: Skipping duplicate click event.');
        return;
      }
      isNotificationProcessingRef.current = true;

      // Execute unified background sync from Cloudflare Worker & SQLite delta update on push click
      try {
        await Promise.all([
          syncCoreDataOnStartup('push_force'),
          triggerDeltaSync()
        ]);
        window.dispatchEvent(new CustomEvent('force_app_data_reload'));
        console.log('✅ Push Notification Click Sync Complete!');
      } catch (err) {
        console.error('Data refresh from push click failed:', err);
      }

      setTimeout(() => {
        isNotificationProcessingRef.current = false;
      }, 1500);

      if (!data) {
        navigate('/notifications');
        return;
      }

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
  }, [isAdminRoute, state.theme]);

  // ═══ Global Android Hardware & Gesture Back Button Handler ═══
  useEffect(() => {
    let isMounted = true;
    let listenerHandle = null;

    const setupBackButton = async () => {
      try {
        listenerHandle = await CapacitorApp.addListener('backButton', ({ canGoBack }) => {
          const ctx = backNavContextRef.current;
          handleAppBackButton({
            canGoBack,
            location: ctx.location,
            navigate: ctx.navigate,
            showUpdateModal: ctx.showUpdateModal,
            closeUpdateModal: () => setShowUpdateModal(false),
            language: ctx.state?.language || 'bn',
            onShowExitToast: () => {
              const msg = ctx.state?.language === 'en'
                ? 'Press back again to exit'
                : 'অ্যাপ থেকে বের হতে আবার ব্যাক প্রেস করুন';
              setExitToast({ message: msg });
              setTimeout(() => {
                setExitToast(null);
              }, 2000);
            },
            onExitApp: () => {
              CapacitorApp.exitApp();
            },
            navigateWithAdOnReturn
          });
        });

        if (!isMounted && listenerHandle) {
          listenerHandle.remove();
        }
      } catch (err) {
        console.warn('Capacitor backButton setup error:', err);
      }
    };

    setupBackButton();

    return () => {
      isMounted = false;
      if (listenerHandle) {
        listenerHandle.remove();
      }
    };
  }, []);

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
      <ErrorBoundary>
        <Routes location={location}>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="jobs" element={<ManageJobs />} />
            <Route path="live-exams" element={<ManageLiveExams />} />
            <Route path="questions" element={<ManageQuestions />} />
            <Route path="notifications" element={<ManageNotifications />} />
            <Route path="messages" element={<UserMessages />} />
            <Route path="stats" element={<Statistics />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="ai-manager" element={<AiManager />} />
            <Route path="feed" element={<ManageFeed />} />
          </Route>
        </Routes>
      </ErrorBoundary>
    )
  }

  const navigationType = useNavigationType();
  const { direction, isBack } = useNavigationTracker(location, navigationType);

  const hasSeenOnboarding = state.hasSeenOnboarding || JSON.parse(localStorage.getItem('hasSeenOnboarding') || 'false');
  const isHomeOrFeed = location.pathname === '/' || location.pathname === '/home' || location.pathname === '/feed';

  const isTabRoute = (
    (location.pathname === '/' && hasSeenOnboarding) ||
    ['/home', '/feed', '/saved', '/notifications', '/profile'].includes(location.pathname)
  );

  // ═══ Native Banner Ad Visibility Controller ═══
  // Play Store & AdMob Policy Compliance:
  // 1. Tab pages (/home, /feed, /saved, /notifications, /profile) NEVER show banner ads
  //    to prevent accidental clicks and navigation button overlap with BottomNav.
  // 2. Non-tab content pages (JobDetails, ExamDetails, ResultDetails, Categories, Search, etc.)
  //    show a clean, fixed bottom Adaptive Banner with dedicated bottom page padding.
  // 3. Splash, Onboarding, Admin, and Live Exam Room always hide banner ads.
  useEffect(() => {
    const isHiddenPage = 
      isAdminRoute || 
      isTabRoute ||
      location.pathname === '/splash' || 
      location.pathname === '/onboarding' ||
      location.pathname.startsWith('/live-exam-room');

    if (isHiddenPage) {
      hideNativeBannerAd();
    } else {
      showNativeBannerAd(state.theme === 'dark');
    }
  }, [location.pathname, isTabRoute, isAdminRoute, state.theme]);

  // Log page view to Firebase Analytics on route change
  useEffect(() => {
    logAnalyticsEvent('page_view', {
      page_path: location.pathname,
      page_title: document.title || 'Live Circular'
    });
  }, [location.pathname]);

  const isDark = state.theme === 'dark';
  const OFFLINE_ALLOWED = ['/saved', '/profile', '/settings', '/about', '/privacy', '/terms', '/edit-profile'];
  const isOfflineAllowed = OFFLINE_ALLOWED.some(r => location.pathname.startsWith(r));
  const showOfflineOverlay = isOffline && !isAdminRoute && !isOfflineAllowed;

  return (
    <ErrorBoundary>
      <GlobalLoaderProvider>
        <div 
          className={`container ${isBack ? 'nav-direction-back' : 'nav-direction-forward'}`} 
          data-theme={state.theme}
          data-nav-direction={direction}
        >
        {!isAdminRoute && !showOfflineOverlay && <ConnectivityBanner />}

        {/* ═══ Phase 3: Modern Layer-by-Layer Offline Overlay ═══ */}
        {showOfflineOverlay && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 99999,
              background: isDark ? '#0b0f19' : '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              color: 'var(--text-primary)',
              padding: '24px',
              flexDirection: 'column',
              maxWidth: '430px',
              margin: '0 auto'
            }}
          >
            <ModernOfflineIcon isDark={isDark} size={84} />
            <h2 style={{
              margin: '18px 0 0',
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em'
            }}>
              {state.language === 'en' ? 'No Internet Connection' : 'ইন্টারনেট সংযোগ নেই'}
            </h2>
          </div>
        )}

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
        {isTabRoute && !showOfflineOverlay && (
          <BottomNav />
        )}

        <VersionUpdateModal 
          isOpen={showUpdateModal}
          updateInfo={updateInfo}
          currentVersion={CURRENT_VERSION}
          onClose={() => setShowUpdateModal(false)}
        />

        {/* ═══ Android Back-to-Exit Floating Claymorphism Toast ═══ */}
        {exitToast && (
          <div style={{
            position: 'fixed',
            bottom: isTabRoute ? '76px' : '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
            color: '#ffffff',
            padding: '10px 20px',
            borderRadius: '14px',
            border: '1.2px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 24px -2px rgba(0, 0, 0, 0.35), inset 0 1.5px 2px rgba(255, 255, 255, 0.3), inset 0 -1.5px 2px rgba(0, 0, 0, 0.4)',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'fadeIn 0.2s ease-out',
            pointerEvents: 'none',
            whiteSpace: 'nowrap'
          }}>
            <span>📱</span>
            <span>{exitToast.message}</span>
          </div>
        )}
      </div>
    </GlobalLoaderProvider>
  </ErrorBoundary>
  )
}

export default App
