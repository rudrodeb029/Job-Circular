import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from '../components/Icons';
import { useAppContext } from '../context/AppContext';
import { useAdminContext } from '../context/AdminContext';
import { getLiveExams } from '../data/liveExams';
import PullToRefresh from '../components/PullToRefresh';
import ModernLoader from '../components/ModernLoader';
import LiveExamCard from '../components/LiveExamCard';
import useProgressiveList from '../hooks/useProgressiveList';
import TabBar, { TabContent } from '../components/TabBar';
import { POINTS_CONFIG, getExamPointCost, isExamUnlockedForUser } from '../utils/pointsService';

export default function LiveExams() {
  const navigate = useNavigate();
  const { state, earnPointsFromAd, unlockExamWithPoints } = useAppContext();
  const { state: adminState, refreshData } = useAdminContext();
  const isEn = state.language === 'en';
  const isDark = state.theme === 'dark';

  const livePoints = state.liveExamPoints ?? state.pointsState?.points ?? POINTS_CONFIG.WELCOME_BONUS;
  const dailyAdCount = state.pointsState?.dailyAdCount ?? 0;
  const [watchingAd, setWatchingAd] = useState(false);
  const [pointsGateModal, setPointsGateModal] = useState(null); // { exam, mode: 'register' | 'enter' }
  
  const [exams, setExams] = useState([]);
  const [now, setNow] = useState(Date.now());
  const [registrations, setRegistrations] = useState({});
  const [toastMessage, setToastMessage] = useState('');
  const [activeTab, setActiveTab] = useState('live'); // 'live' | 'history'
  const [isTabLoading, setIsTabLoading] = useState(true);
  const tabTimerRef = React.useRef(null);

  const tabs = [
    { id: 'live', label: isEn ? 'Live Exams' : 'লাইভ পরীক্ষা' },
    { id: 'history', label: isEn ? 'Exam History' : 'পরীক্ষার ইতিহাস' }
  ];

  // Initial entry: show the modern loader briefly, then reveal the exam list
  useEffect(() => {
    tabTimerRef.current = setTimeout(() => setIsTabLoading(false), 150);
    return () => clearTimeout(tabTimerRef.current);
  }, []);

  const handleTabChange = (tab) => {
    if (activeTab === tab) return;
    // Switch section instantly (header, indicator, info card), list shows loader
    setIsTabLoading(true);
    setActiveTab(tab);
    clearTimeout(tabTimerRef.current);
    tabTimerRef.current = setTimeout(() => setIsTabLoading(false), 180);
  };

  const handleBack = () => {
    navigate('/questions-hub');
  };

  // Update exams and registrations
  useEffect(() => {
    if (Array.isArray(adminState.liveExams)) {
      setExams(adminState.liveExams);
    } else {
      setExams(getLiveExams());
    }

    try {
      const saved = JSON.parse(localStorage.getItem('registered_exams')) || {};
      setRegistrations(saved);
    } catch (e) {
      console.error(e);
    }
  }, [adminState.liveExams]);

  // Ticks the clock every second ONLY when activeTab is 'live'
  useEffect(() => {
    if (activeTab !== 'live') return;

    setNow(Date.now());
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [activeTab]);

  const parseExamDate = (dateVal) => {
    if (!dateVal) return null;
    const d = new Date(dateVal);
    return isNaN(d.getTime()) ? null : d.getTime();
  };

  const getExamStatus = (exam) => {
    if (!exam) return 'completed';

    const userResult = getExamResult(exam.id);
    const startMs = parseExamDate(exam.scheduledAt) || parseExamDate(exam.startTime);
    const durationMins = typeof exam.duration === 'number' ? exam.duration : (parseInt(exam.duration) || 60);

    if (startMs) {
      const endMs = startMs + durationMins * 60 * 1000;
      if (now >= endMs) {
        return 'completed';
      }
      if (now < startMs) {
        return 'upcoming';
      }
      if (userResult) return 'completed';
      return 'running';
    }

    if (exam.status === 'completed' || exam.status === 'ended') {
      return 'completed';
    }
    if (exam.status === 'scheduled' || exam.status === 'upcoming') {
      return 'upcoming';
    }
    if (userResult) return 'completed';
    return 'running';
  };

  const getCountdownString = (startTimeMs) => {
    const diff = startTimeMs - now;
    if (diff <= 0) {
      return isEn ? '0m 00s' : '০মি: ০০সে:';
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    const pad = (num) => String(num).padStart(2, '0');

    if (hours > 0) {
      return isEn 
        ? `${hours}h ${pad(mins)}m ${pad(secs)}s` 
        : `${toBengaliNumber(hours)}ঘণ্টা ${toBengaliNumber(mins)}মি: ${toBengaliNumber(secs)}সে:`;
    } else {
      return isEn
        ? `${mins}m ${pad(secs)}s`
        : `${toBengaliNumber(mins)}মি: ${toBengaliNumber(secs)}সে:`;
    }
  };

  const handleWatchRewardAd = React.useCallback(async () => {
    if (watchingAd) return;
    setWatchingAd(true);
    try {
      const res = await earnPointsFromAd();
      if (res.ok) {
        setToastMessage(
          isEn
            ? `+${res.added} Points added! Balance: ${res.newBalance} Pts`
            : `+${toBengaliNumber(res.added)} পয়েন্ট যোগ হয়েছে! মোট: ${toBengaliNumber(res.newBalance)} পয়েন্ট`
        );
      } else if (res.reason === 'daily_limit') {
        setToastMessage(
          isEn
            ? `Daily ad limit reached (${POINTS_CONFIG.DAILY_AD_LIMIT}/${POINTS_CONFIG.DAILY_AD_LIMIT})`
            : `আজকের বিজ্ঞাপনের সীমা শেষ (${toBengaliNumber(POINTS_CONFIG.DAILY_AD_LIMIT)}/${toBengaliNumber(POINTS_CONFIG.DAILY_AD_LIMIT)})`
        );
      } else {
        setToastMessage(
          isEn
            ? 'Watch the full ad to earn points.'
            : 'পয়েন্ট পেতে সম্পূর্ণ বিজ্ঞাপনটি দেখুন।'
        );
      }
      setTimeout(() => setToastMessage(''), 3200);
    } finally {
      setWatchingAd(false);
    }
  }, [watchingAd, earnPointsFromAd, isEn]);

  const handleRegister = React.useCallback((examId) => {
    const targetExam = exams.find(e => String(e.id) === String(examId));
    const alreadyReg = Boolean(registrations[examId]);
    const alreadyUnlocked = targetExam ? isExamUnlockedForUser(targetExam, state.pointsState) : false;

    if (alreadyReg) {
      setRegistrations(prev => {
        const next = { ...prev, [examId]: false };
        localStorage.setItem('registered_exams', JSON.stringify(next));
        setToastMessage(isEn ? 'Registration cancelled.' : 'রেজিস্ট্রেশন বাতিল করা হয়েছে।');
        setTimeout(() => setToastMessage(''), 3000);
        return next;
      });
      return;
    }

    if (targetExam && !alreadyUnlocked) {
      const unlockRes = unlockExamWithPoints(targetExam);
      if (!unlockRes.ok && unlockRes.reason === 'insufficient_points') {
        setPointsGateModal({ exam: targetExam, mode: 'register' });
        return;
      }
    }

    setRegistrations(prev => {
      const next = { ...prev, [examId]: true };
      localStorage.setItem('registered_exams', JSON.stringify(next));
      const cost = getExamPointCost(targetExam);
      const msg = (!alreadyUnlocked && cost > 0)
        ? (isEn
          ? `Enrolled! ${cost} points used.`
          : `${toBengaliNumber(cost)} পয়েন্ট দিয়ে রেজিস্ট্রেশন সম্পন্ন হয়েছে!`)
        : (isEn
          ? 'Registration successful for the live exam!'
          : 'লাইভ পরীক্ষার জন্য রেজিস্ট্রেশন সম্পন্ন হয়েছে!');
      setToastMessage(msg);
      setTimeout(() => setToastMessage(''), 3000);
      return next;
    });
  }, [exams, registrations, state.pointsState, unlockExamWithPoints, isEn]);

  const handleEnter = React.useCallback((id) => {
    const targetExam = exams.find(e => String(e.id) === String(id));
    const alreadyUnlocked = Boolean(registrations[id]) || (targetExam ? isExamUnlockedForUser(targetExam, state.pointsState) : false);

    if (targetExam && !alreadyUnlocked) {
      const unlockRes = unlockExamWithPoints(targetExam);
      if (!unlockRes.ok && unlockRes.reason === 'insufficient_points') {
        setPointsGateModal({ exam: targetExam, mode: 'enter' });
        return;
      }
      setRegistrations(prev => {
        const next = { ...prev, [id]: true };
        localStorage.setItem('registered_exams', JSON.stringify(next));
        return next;
      });
    }

    navigate(`/live-exam-room/${id}`);
  }, [exams, registrations, state.pointsState, unlockExamWithPoints, navigate]);

  const handleViewResult = React.useCallback((id) => {
    navigate(`/live-exam-room/${id}`);
  }, [navigate]);

  const examResultsMap = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('live_exam_results')) || {};
    } catch (e) {
      return {};
    }
  }, [exams, activeTab]);

  const getExamResult = (examId) => {
    const res = examResultsMap[examId];
    if (!res || res.didNotAttend) return null;
    const answersObj = res.answers || {};
    if (Object.keys(answersObj).length === 0 && !res.submittedAt && !res.score) {
      return null;
    }
    return res;
  };

  // Filter exams based on selected Tab
  const filteredExams = exams.filter(exam => {
    const status = getExamStatus(exam);
    if (activeTab === 'live') {
      return status === 'running' || status === 'upcoming';
    } else {
      return status === 'completed';
    }
  });

  const { count: visibleExamsCount, hasMore: hasMoreExams, sentinelRef: examsSentinelRef } = useProgressiveList(filteredExams.length, { resetKey: activeTab });

  return (
    <div className="page" style={{
      paddingBottom: '100px',
      background: 'var(--bg-secondary)',
      WebkitOverflowScrolling: 'touch',
      overscrollBehaviorY: 'contain'
    }}>
      {/* Header */}
      <div className="page-header" style={{ borderBottom: 'none' }}>
        <button
          type="button"
          className="back-btn"
          onClick={handleBack}
          aria-label="Back"
          style={{ cursor: 'pointer', zIndex: 10 }}
        >
          <ArrowLeft size={22} />
        </button>
        <h1 style={{ flex: 1, fontSize: '15px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
          <span>{isEn ? 'Live MCQ Exam' : 'লাইভ এমসিকিউ পরীক্ষা'}</span>
        </h1>
        <div
          onClick={handleWatchRewardAd}
          title={isEn ? 'Tap to watch ad & earn points' : 'বিজ্ঞাপন দেখে পয়েন্ট অর্জন করতে ট্যাপ করুন'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 10px',
            borderRadius: '999px',
            background: isDark ? 'rgba(245, 158, 11, 0.16)' : '#fffbeb',
            border: isDark ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid #fde68a',
            color: isDark ? '#fbbf24' : '#b45309',
            fontSize: '11.5px',
            fontWeight: 800,
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          <span>⭐</span>
          <span>{isEn ? `${livePoints} Pts` : `${toBengaliNumber(livePoints)} পয়েন্ট`}</span>
        </div>
      </div>

      {/* Native Full-Width Sliding Underline Tab Bar */}
      <div style={{
        display: 'flex',
        background: 'var(--white)',
        borderBottom: '1px solid var(--border-light)',
        position: 'sticky',
        top: 'calc(52px + var(--safe-area-top))',
        zIndex: 40,
        userSelect: 'none'
      }}>
        <button
          onClick={() => handleTabChange('live')}
          type="button"
          style={{
            flex: 1,
            padding: '13px 0',
            background: 'transparent',
            border: 'none',
            color: activeTab === 'live' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: 800,
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'color 0.22s ease'
          }}
        >
          {isEn ? 'Live' : 'লাইভ'}
        </button>
        <button
          onClick={() => handleTabChange('history')}
          type="button"
          style={{
            flex: 1,
            padding: '13px 0',
            background: 'transparent',
            border: 'none',
            color: activeTab === 'history' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: 800,
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'color 0.22s ease'
          }}
        >
          {isEn ? 'History' : 'ইতিহাস'}
        </button>

        {/* Smooth Sliding Underline Indicator */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '50%',
          height: '3px',
          background: 'var(--primary)',
          borderRadius: '3px 3px 0 0',
          transform: activeTab === 'live' ? 'translate3d(0%, 0, 0)' : 'translate3d(100%, 0, 0)',
          transition: 'transform 0.30s cubic-bezier(0.22, 1, 0.36, 1)',
          willChange: 'transform'
        }} />
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '75px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          borderRadius: '5px',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: isDark ? '0 4px 14px rgba(0, 0, 0, 0.5)' : 'inset 0 1px 1.5px #ffffff, 0 4px 14px rgba(15, 23, 42, 0.08)',
          padding: '5px 12px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: isDark ? '#f8fafc' : '#1e293b',
          fontSize: '10.5px',
          fontWeight: 700,
          zIndex: 9999,
          whiteSpace: 'nowrap',
          pointerEvents: 'none'
        }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '16px',
            height: '16px',
            borderRadius: '4px',
            background: toastMessage.includes('বাতিল') || toastMessage.includes('cancelled') ? '#fef2f2' : '#ecfdf5',
            color: toastMessage.includes('বাতিল') || toastMessage.includes('cancelled') ? '#dc2626' : '#059669',
            fontSize: '9.5px',
            fontWeight: 800,
            flexShrink: 0
          }}>
            {toastMessage.includes('বাতিল') || toastMessage.includes('cancelled') ? '✕' : '✓'}
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      <PullToRefresh onRefresh={refreshData}>
        <div className="page-content" style={{ padding: '16px' }}>
          <TabContent activeTab={activeTab} tabs={tabs}>
            {/* Sleek, Premium Regulations + Live Exam Points Split Row (Shown in Live tab) */}
            {activeTab === 'live' && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1.25fr 0.95fr',
                gap: '8px',
                marginBottom: '14px',
                alignItems: 'stretch'
              }}>
                {/* Left: Live Exam Regulations Card */}
                <div style={{
                  background: 'var(--primary-bg)',
                  border: '1px solid var(--chip-primary-border)',
                  borderRadius: '10px',
                  padding: '10px 11px',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <h3 style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                      </svg>
                      <span>{isEn ? 'Live Exam Rules' : 'লাইভ পরীক্ষার নিয়াবলী'}</span>
                    </h3>
                    <p style={{ fontSize: '10px', lineHeight: 1.45, color: 'var(--text-secondary)', fontWeight: 500, margin: 0 }}>
                      {isEn
                        ? `Join real-time exams on time. Each exam requires ${POINTS_CONFIG.DEFAULT_EXAM_COST} points to unlock.`
                        : `নির্ধারিত সময়ে লাইভ পরীক্ষায় অংশ নিন। প্রতিটি পরীক্ষায় অংশ নিতে ${toBengaliNumber(POINTS_CONFIG.DEFAULT_EXAM_COST)} পয়েন্ট প্রয়োজন।`}
                    </p>
                  </div>
                </div>

                {/* Right: Marked Live Exam Points & Rewarded Ad Card */}
                <div style={{
                  background: isDark
                    ? 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)'
                    : 'linear-gradient(145deg, #fffbeb 0%, #fef3c7 100%)',
                  border: isDark ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid #fde68a',
                  borderRadius: '10px',
                  padding: '9px 10px',
                  boxShadow: isDark
                    ? '0 2px 10px rgba(0,0,0,0.3)'
                    : 'inset 0 1px 1.5px #ffffff, 0 2px 8px rgba(217, 119, 6, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '5px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: isDark ? '#fbbf24' : '#b45309', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <span>⭐</span>
                      <span>{isEn ? 'Exam Points' : 'এক্সাম পয়েন্ট'}</span>
                    </span>
                    <span style={{
                      fontSize: '12.5px',
                      fontWeight: 900,
                      color: isDark ? '#fde68a' : '#92400e',
                      background: isDark ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.85)',
                      padding: '1px 6px',
                      borderRadius: '6px',
                      border: isDark ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(251, 191, 36, 0.5)'
                    }}>
                      {isEn ? livePoints : toBengaliNumber(livePoints)}
                    </span>
                  </div>

                  <p style={{ margin: 0, fontSize: '9px', lineHeight: 1.3, color: isDark ? '#cbd5e1' : '#78350f', fontWeight: 600 }}>
                    {isEn
                      ? `Watch ad for +${POINTS_CONFIG.POINTS_PER_AD} pts (${dailyAdCount}/${POINTS_CONFIG.DAILY_AD_LIMIT})`
                      : `অ্যাড দেখে +${toBengaliNumber(POINTS_CONFIG.POINTS_PER_AD)} পয়েন্ট নিন (${toBengaliNumber(dailyAdCount)}/${toBengaliNumber(POINTS_CONFIG.DAILY_AD_LIMIT)})`}
                  </p>

                  <button
                    type="button"
                    onClick={handleWatchRewardAd}
                    disabled={watchingAd || dailyAdCount >= POINTS_CONFIG.DAILY_AD_LIMIT}
                    style={{
                      width: '100%',
                      padding: '4.5px 6px',
                      borderRadius: '6px',
                      border: 'none',
                      background: dailyAdCount >= POINTS_CONFIG.DAILY_AD_LIMIT
                        ? (isDark ? '#334155' : '#cbd5e1')
                        : 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
                      color: '#ffffff',
                      fontSize: '9.5px',
                      fontWeight: 800,
                      cursor: dailyAdCount >= POINTS_CONFIG.DAILY_AD_LIMIT ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      boxShadow: dailyAdCount >= POINTS_CONFIG.DAILY_AD_LIMIT ? 'none' : '0 2px 6px rgba(217, 119, 6, 0.3)',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <span>🎬</span>
                    <span>
                      {watchingAd
                        ? (isEn ? 'Loading...' : 'লোড হচ্ছে...')
                        : dailyAdCount >= POINTS_CONFIG.DAILY_AD_LIMIT
                          ? (isEn ? 'Limit Reached' : 'সীমা শেষ')
                          : (isEn ? `Watch Ad (+${POINTS_CONFIG.POINTS_PER_AD})` : `+${toBengaliNumber(POINTS_CONFIG.POINTS_PER_AD)} পয়েন্ট নিন`)}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Sleek, Matching History Overview Card (History tab) */}
            {activeTab === 'history' && (
              <div className="clay-details-card" style={{
                borderRadius: '12px',
                padding: '12px 14px',
                marginBottom: '14px'
              }}>
                <h3 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--primary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <span>{isEn ? 'Exam History & Past Results' : 'পরীক্ষার ইতিহাস ও পূর্ববর্তী ফলাফল'}</span>
                </h3>
                <p style={{ fontSize: '11px', lineHeight: 1.5, color: 'var(--text-secondary)', fontWeight: 500, margin: 0 }}>
                  {isEn 
                    ? 'Review your attended live exams, scores, merit positions, and detailed answer explanations. Tap on any completed exam below.'
                    : 'আপনার সম্পন্ন করা সকল লাইভ পরীক্ষার ফলাফল, মেধা স্কোর ও বিস্তারিত সমাধান দেখুন। ফলাফল দেখতে নিচের যেকোনো কার্ডে ট্যাপ করুন।'}
                </p>
              </div>
            )}

            {/* Exams Content Area */}
            {isTabLoading ? (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                minHeight: '280px',
                padding: '60px 0',
                boxSizing: 'border-box'
              }}>
                <ModernLoader size="md" icon={activeTab === 'live' ? '⏱️' : '📜'} />
              </div>
            ) : filteredExams.length === 0 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                minHeight: '240px',
                textAlign: 'center',
                padding: '50px 20px',
                color: 'var(--text-muted)',
                boxSizing: 'border-box'
              }}>
                <span style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>📅</span>
                <p style={{ fontSize: '14px', fontWeight: 600 }}>
                  {activeTab === 'live'
                    ? (isEn ? 'No live or upcoming exams' : 'কোনো লাইভ বা আসন্ন পরীক্ষা নেই')
                    : (isEn ? 'No exam history found' : 'কোনো পরীক্ষার ইতিহাস পাওয়া যায়নি')}
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '10px',
                alignItems: 'start'
              }}>
                {filteredExams.slice(0, visibleExamsCount).map(exam => {
                  const status = getExamStatus(exam);
                  const startMs = parseExamDate(exam.scheduledAt) || parseExamDate(exam.startTime) || parseExamDate(exam.createdAt) || Date.now();
                  const result = getExamResult(exam.id);
                  const isRegistered = !!registrations[exam.id];
                  const isUnlocked = isRegistered || isExamUnlockedForUser(exam, state.pointsState);
                  const pointCost = getExamPointCost(exam);
                  const durationMins = typeof exam.duration === 'number' ? exam.duration : (parseInt(exam.duration) || 60);

                  return (
                    <LiveExamCard
                      key={exam.id}
                      exam={exam}
                      status={status}
                      isHistory={activeTab === 'history'}
                      startMs={startMs}
                      countdownStr={status === 'running' 
                        ? getCountdownString(startMs + durationMins * 60 * 1000)
                        : (status === 'upcoming' ? getCountdownString(startMs) : '')}
                      isRegistered={isRegistered}
                      isUnlocked={isUnlocked}
                      pointCost={pointCost}
                      userPoints={livePoints}
                      result={result}
                      isEn={isEn}
                      onRegister={handleRegister}
                      onEnter={handleEnter}
                      onViewResult={handleViewResult}
                    />
                  );
                })}
                {hasMoreExams && <div ref={examsSentinelRef} style={{ height: '1px', gridColumn: '1 / -1' }} aria-hidden="true" />}
              </div>
            )}
          </TabContent>
        </div>
      </PullToRefresh>

      {/* Insufficient Points / Watch Rewarded Ad Gate Modal */}
      {pointsGateModal && pointsGateModal.exam && (
        <div
          onClick={() => setPointsGateModal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.72)',
            backdropFilter: 'blur(5px)',
            WebkitBackdropFilter: 'blur(5px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '18px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '350px',
              background: isDark ? '#0f172a' : '#ffffff',
              borderRadius: '18px',
              border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid #e2e8f0',
              boxShadow: '0 20px 45px rgba(0,0,0,0.35)',
              padding: '20px 18px',
              textAlign: 'center'
            }}
          >
            {(() => {
              const modalExam = pointsGateModal.exam;
              const reqPoints = getExamPointCost(modalExam);
              const enoughNow = livePoints >= reqPoints;
              const deficit = Math.max(0, reqPoints - livePoints);

              return (
                <>
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    background: enoughNow
                      ? 'linear-gradient(135deg, #10b981, #059669)'
                      : 'linear-gradient(135deg, #f59e0b, #d97706)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    margin: '0 auto 12px auto',
                    boxShadow: '0 6px 18px rgba(245, 158, 11, 0.3)'
                  }}>
                    {enoughNow ? '✅' : '🔒'}
                  </div>

                  <h3 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}>
                    {enoughNow
                      ? (isEn ? 'Enough Points Available!' : 'পর্যাপ্ত পয়েন্ট জমা হয়েছে!')
                      : (isEn ? 'Insufficient Live Exam Points' : 'পর্যাপ্ত লাইভ এক্সাম পয়েন্ট নেই')}
                  </h3>

                  <p style={{ margin: '0 0 14px 0', fontSize: '11.5px', lineHeight: 1.5, color: 'var(--text-secondary)', fontWeight: 500 }}>
                    {enoughNow
                      ? (isEn
                        ? `You now have ${livePoints} points. Tap below to unlock and join this exam.`
                        : `আপনার কাছে এখন ${toBengaliNumber(livePoints)} পয়েন্ট আছে। নিচের বাটনে ট্যাপ করে পরীক্ষায় অংশ নিন।`)
                      : (isEn
                        ? `You need ${reqPoints} points to participate in this live exam. Watch a short rewarded ad to earn +${POINTS_CONFIG.POINTS_PER_AD} points.`
                        : `এই লাইভ পরীক্ষায় অংশ নিতে ${toBengaliNumber(reqPoints)} পয়েন্ট প্রয়োজন। বিজ্ঞাপন দেখে ফ্রি +${toBengaliNumber(POINTS_CONFIG.POINTS_PER_AD)} পয়েন্ট অর্জন করুন।`)}
                  </p>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                    marginBottom: '14px',
                    background: isDark ? 'rgba(30, 41, 59, 0.7)' : '#f8fafc',
                    padding: '10px',
                    borderRadius: '12px',
                    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0'
                  }}>
                    <div>
                      <span style={{ display: 'block', fontSize: '9.5px', color: 'var(--text-muted)', fontWeight: 700 }}>
                        {isEn ? 'REQUIRED' : 'প্রয়োজনীয় পয়েন্ট'}
                      </span>
                      <span style={{ fontSize: '14px', fontWeight: 900, color: 'var(--primary)' }}>
                        ⭐ {isEn ? reqPoints : toBengaliNumber(reqPoints)}
                      </span>
                    </div>
                    <div style={{ borderLeft: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0' }}>
                      <span style={{ display: 'block', fontSize: '9.5px', color: 'var(--text-muted)', fontWeight: 700 }}>
                        {isEn ? 'YOUR BALANCE' : 'আপনার পয়েন্ট'}
                      </span>
                      <span style={{ fontSize: '14px', fontWeight: 900, color: enoughNow ? '#10b981' : '#d97706' }}>
                        ⭐ {isEn ? livePoints : toBengaliNumber(livePoints)}
                      </span>
                    </div>
                  </div>

                  {!enoughNow && (
                    <div style={{
                      fontSize: '10.5px',
                      fontWeight: 800,
                      color: isDark ? '#fca5a5' : '#dc2626',
                      marginBottom: '12px'
                    }}>
                      {isEn
                        ? `⚠️ Need ${deficit} more points to unlock this exam`
                        : `⚠️ পরীক্ষায় অংশ নিতে আরও ${toBengaliNumber(deficit)} পয়েন্ট প্রয়োজন`}
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {enoughNow ? (
                      <button
                        type="button"
                        onClick={() => {
                          const ex = pointsGateModal.exam;
                          const mode = pointsGateModal.mode;
                          setPointsGateModal(null);
                          if (mode === 'enter') {
                            handleEnter(ex.id);
                          } else {
                            handleRegister(ex.id);
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: 'none',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: '#ffffff',
                          fontSize: '12.5px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          boxShadow: '0 6px 16px rgba(16, 185, 129, 0.3)'
                        }}
                      >
                        {isEn
                          ? `⚡ Unlock & Participate (-${reqPoints} Pts)`
                          : `⚡ আনলক ও অংশগ্রহণ করুন (-${toBengaliNumber(reqPoints)} পয়েন্ট)`}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleWatchRewardAd}
                        disabled={watchingAd || dailyAdCount >= POINTS_CONFIG.DAILY_AD_LIMIT}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: 'none',
                          background: dailyAdCount >= POINTS_CONFIG.DAILY_AD_LIMIT
                            ? '#64748b'
                            : 'linear-gradient(135deg, #1a56db 0%, #2563eb 100%)',
                          color: '#ffffff',
                          fontSize: '12.5px',
                          fontWeight: 800,
                          cursor: dailyAdCount >= POINTS_CONFIG.DAILY_AD_LIMIT ? 'not-allowed' : 'pointer',
                          boxShadow: '0 6px 16px rgba(37, 99, 235, 0.3)'
                        }}
                      >
                        {watchingAd
                          ? (isEn ? '🎬 Loading Rewarded Ad...' : '🎬 বিজ্ঞাপন লোড হচ্ছে...')
                          : (isEn
                            ? `🎬 Watch Ad (+${POINTS_CONFIG.POINTS_PER_AD} Points)`
                            : `🎬 বিজ্ঞাপন দেখুন (+${toBengaliNumber(POINTS_CONFIG.POINTS_PER_AD)} পয়েন্ট)`)}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setPointsGateModal(null)}
                      style={{
                        width: '100%',
                        padding: '8px 14px',
                        borderRadius: '10px',
                        border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid #e2e8f0',
                        background: 'transparent',
                        color: 'var(--text-secondary)',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {isEn ? 'Close' : 'বন্ধ করুন'}
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

    </div>
  );
}

const safeStringify = (val, fallback = '') => {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  if (Array.isArray(val)) return val.map(v => safeStringify(v)).join(', ');
  if (typeof val === 'object') {
    if (typeof val.name === 'string') return val.name;
    if (typeof val.title === 'string') return val.title;
    if (typeof val.text === 'string') return val.text;
  }
  return fallback;
};

const toBengaliNumber = (num) => {
  if (num === undefined || num === null) return '';
  const engNum = safeStringify(num);
  const bengaliDigits = {'0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'};
  return engNum.split('').map(digit => bengaliDigits[digit] || digit).join('');
};
