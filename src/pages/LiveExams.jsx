import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from '../components/Icons';
import { useAppContext } from '../context/AppContext';
import { useAdminContext } from '../context/AdminContext';
import { getLiveExams } from '../data/liveExams';
import BottomNav from '../components/BottomNav';
import PullToRefresh from '../components/PullToRefresh';
import ModernLoader from '../components/ModernLoader';

export default function LiveExams() {
  const navigate = useNavigate();
  const { state } = useAppContext();
  const { state: adminState, refreshData } = useAdminContext();
  const isEn = state.language === 'en';
  
  const [exams, setExams] = useState([]);
  const [now, setNow] = useState(Date.now());
  const [registrations, setRegistrations] = useState({});
  const [toastMessage, setToastMessage] = useState('');
  const [activeTab, setActiveTab] = useState('live'); // 'live' | 'history'
  const [isSwitchingTab, setIsSwitchingTab] = useState(false);

  const handleTabChange = (tab) => {
    if (activeTab === tab) return;
    setIsSwitchingTab(true);
    setActiveTab(tab);
    setTimeout(() => {
      setIsSwitchingTab(false);
    }, 180);
  };

  // Ticks the clock every second and reads databases reactively
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

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [adminState.liveExams]);

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

  const handleRegister = (examId) => {
    const next = { ...registrations, [examId]: !registrations[examId] };
    setRegistrations(next);
    localStorage.setItem('registered_exams', JSON.stringify(next));

    const msg = next[examId]
      ? (isEn ? 'Registration successful for the live exam!' : 'লাইভ পরীক্ষার জন্য রেজিস্ট্রেশন সম্পন্ন হয়েছে!')
      : (isEn ? 'Registration cancelled.' : 'রেজিস্ট্রেশন বাতিল করা হয়েছে।');

    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const getExamResult = (examId) => {
    try {
      const results = JSON.parse(localStorage.getItem('live_exam_results')) || {};
      const res = results[examId];
      if (!res || res.didNotAttend) return null;
      const answersObj = res.answers || {};
      if (Object.keys(answersObj).length === 0 && !res.submittedAt && !res.score) {
        return null;
      }
      return res;
    } catch (e) {
      return null;
    }
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

  return (
    <div className="page" style={{ paddingBottom: '100px', background: 'var(--bg-secondary)' }}>
      {/* Header */}
      <div className="page-header" style={{ borderBottom: 'none' }}>
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
        </button>
        <h1 style={{ flex: 1, fontSize: '15px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
          <span>{isEn ? 'Live MCQ Exam' : 'লাইভ এমসিকিউ পরীক্ষা'}</span>
        </h1>
      </div>

      {/* Tab Selector */}
      <div style={{
        display: 'flex',
        background: 'var(--white)',
        borderBottom: '1px solid var(--border-light)',
        padding: '0 8px'
      }}>
        <button
          onClick={() => handleTabChange('live')}
          style={{
            flex: 1,
            padding: '14px 0',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'live' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'live' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: 800,
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {isEn ? 'Live & Upcoming' : 'লাইভ ও আসন্ন'}
        </button>
        <button
          onClick={() => handleTabChange('history')}
          style={{
            flex: 1,
            padding: '14px 0',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'history' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'history' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: 800,
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {isEn ? 'Exam History & Results' : 'পরীক্ষার ইতিহাস ও ফলাফল'}
        </button>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--primary)',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '30px',
          boxShadow: '0 8px 30px rgba(26, 86, 219, 0.3)',
          fontSize: '12px',
          fontWeight: 700,
          zIndex: 9999,
          animation: 'slideDown 0.3s ease'
        }}>
          {toastMessage}
        </div>
      )}

      <PullToRefresh onRefresh={refreshData}>
        <div className="page-content animate-fade-in" style={{ padding: '16px' }}>
        
        {/* Sleek, Premium Regulations Card (Only shown in Live tab) */}
        {activeTab === 'live' && (
          <div style={{
            background: 'var(--primary-bg)',
            border: '1px solid var(--chip-primary-border)',
            borderRadius: '20px',
            padding: '18px',
            marginBottom: '20px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <span>{isEn ? 'Live Exam Regulations' : 'লাইভ পরীক্ষার নিয়াবলী'}</span>
            </h3>
            <p style={{ fontSize: '12px', lineHeight: 1.6, color: 'var(--text-secondary)', fontWeight: 500, margin: 0 }}>
              {isEn 
                ? 'Participate in real-time competitive exams. The exam starts exactly at the scheduled time. Results will be calculated instantly upon submission.'
                : 'নির্ধারিত সময়ে সরাসরি লাইভ পরীক্ষায় অংশ নিন। পরীক্ষা শুরু হওয়ার পর সময়ের মধ্যে সাবমিট করতে হবে। সময় শেষ হলে স্বয়ংক্রিয়ভাবে সাবমিট হয়ে যাবে।'}
            </p>
          </div>
        )}

        {/* Exams List: 2-Column Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
          minHeight: '220px'
        }}>
          {isSwitchingTab ? (
            <div style={{ padding: '60px 20px', gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '220px' }}>
              <ModernLoader size="md" icon={activeTab === 'live' ? '🏆' : '📜'} />
            </div>
          ) : (
            <>
              {filteredExams.map(exam => {
            const status = getExamStatus(exam);
            const startMs = parseExamDate(exam.scheduledAt) || parseExamDate(exam.startTime) || parseExamDate(exam.createdAt) || Date.now();
            const result = getExamResult(exam.id);
            const isRegistered = !!registrations[exam.id];

            // Define colors dynamically based on status
            const theme = status === 'running'
              ? {
                  borderLeft: '4px solid #ef4444',
                  badgeColor: '#dc2626',
                  badgeBg: '#fee2e2',
                  accentColor: '#ef4444',
                  boxBg: 'rgba(239, 68, 68, 0.03)'
                }
              : status === 'upcoming'
                ? {
                    borderLeft: '4px solid #d97706',
                    badgeColor: '#b45309',
                    badgeBg: '#fef3c7',
                    accentColor: '#d97706',
                    boxBg: '#fffbeb'
                  }
                : {
                    borderLeft: '4px solid #64748b',
                    badgeColor: '#475569',
                    badgeBg: '#f1f5f9',
                    accentColor: '#2563eb',
                    boxBg: '#f8fafc'
                  };

            const isCompleted = status === 'completed';
            const cardBgColor = 'var(--white)';
            const cardBorderColor = state.theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.8)';

            return (
              <div
                key={exam.id}
                style={{
                  background: cardBgColor,
                  border: `1px solid ${cardBorderColor}`,
                  borderLeft: theme.borderLeft,
                  borderRadius: '16px',
                  padding: '16px',
                  boxShadow: '0 4px 16px rgba(15, 23, 42, 0.02)',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.3s'
                }}
              >
                <div>
                  {/* Card Header row 1: Badges */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    {/* Status Badge */}
                    {status === 'running' && (
                      <span style={{
                        fontSize: '9.5px',
                        fontWeight: 800,
                        color: theme.badgeColor,
                        background: theme.badgeBg,
                        padding: '4px 10px',
                        borderRadius: '30px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <span style={{
                          width: '5px',
                          height: '5px',
                          borderRadius: '50%',
                          background: '#ef4444',
                          display: 'inline-block',
                          animation: 'pulse 1.5s infinite'
                        }}></span>
                        {isEn ? 'LIVE NOW' : 'লাইভ চলছে'}
                      </span>
                    )}

                    {status === 'upcoming' && (
                      <span style={{
                        fontSize: '9.5px',
                        fontWeight: 800,
                        color: theme.badgeColor,
                        background: theme.badgeBg,
                        padding: '4px 10px',
                        borderRadius: '30px'
                      }}>
                        {isEn ? 'UPCOMING' : 'আসন্ন পরীক্ষা'}
                      </span>
                    )}

                    {status === 'completed' && (
                      <span style={{
                        fontSize: '9.5px',
                        fontWeight: 800,
                        color: theme.badgeColor,
                        background: theme.badgeBg,
                        padding: '4px 10px',
                        borderRadius: '30px'
                      }}>
                        {isEn ? 'COMPLETED' : 'শেষ হয়েছে'}
                      </span>
                    )}

                    {/* Duration Badge */}
                    <span style={{
                      fontSize: '9.5px',
                      fontWeight: 800,
                      color: '#2563eb',
                      background: 'rgba(37, 99, 235, 0.08)',
                      padding: '4px 10px',
                      borderRadius: '30px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      whiteSpace: 'nowrap'
                    }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      {isEn ? `${exam.duration} Mins` : `${toBengaliNumber(exam.duration)} মিনিট`}
                    </span>
                  </div>

                  {/* Card Header row 2: Start Date & Countdown (Upcoming) */}
                  {status === 'upcoming' && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: theme.boxBg,
                      borderRadius: '10px',
                      padding: '6px 10px',
                      marginBottom: '10px'
                    }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        {startMs ? new Date(startMs).toLocaleString(isEn ? 'en-US' : 'bn-BD', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : ''}
                      </span>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: '#d97706', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
                          {isEn ? 'Starts in:' : 'বাকি:'}
                        </span>
                        <span style={{ fontFamily: 'monospace' }}>
                          {getCountdownString(startMs)}
                        </span>
                      </span>
                    </div>
                  )}

                  {/* Card Header row 2: Live Remaining Countdown (Running) */}
                  {status === 'running' && startMs && (
                    <div style={{
                      display: 'flex',
                      justify: 'space-between',
                      alignItems: 'center',
                      background: 'rgba(239, 68, 68, 0.06)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      borderRadius: '10px',
                      padding: '6px 10px',
                      marginBottom: '10px'
                    }}>
                      <span style={{ fontSize: '10px', color: '#dc2626', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite', display: 'inline-block' }}></span>
                        {isEn ? 'Live Remaining:' : 'পরীক্ষা শেষ হতে বাকি:'}
                      </span>
                      <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#dc2626', fontFamily: 'monospace' }}>
                        {getCountdownString(startMs + (typeof exam.duration === 'number' ? exam.duration : (parseInt(exam.duration) || 60)) * 60 * 1000)}
                      </span>
                    </div>
                  )}

                  <h4 style={{
                    fontSize: '13.5px',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    marginBottom: '10px',
                    lineHeight: '1.4'
                  }}>
                    {isEn ? (exam.titleEn || exam.title) : exam.title}
                  </h4>

                  {/* Subjects & Topics separately */}
                  <div style={{
                    background: isCompleted ? (state.theme === 'dark' ? '#152238' : '#eff6ff') : 'var(--bg-secondary)',
                    borderRadius: '12px',
                    padding: '10px 12px',
                    marginBottom: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    border: isCompleted ? (state.theme === 'dark' ? '1px solid rgba(59, 130, 246, 0.15)' : '1px solid #dbeafe') : '1px solid var(--border-light)'
                  }}>
                    {(() => {
                      const activeSubjectTopics = (exam.subjectTopics && exam.subjectTopics.length > 0)
                        ? exam.subjectTopics
                        : (Array.isArray(exam.subjects) && exam.subjects.length > 0 ? exam.subjects : null);

                      if (activeSubjectTopics) {
                        return activeSubjectTopics.map((st, idx) => {
                          const subjText = safeStringify(isEn ? (st.subjectEn || st.subject) : st.subject, 'General');
                          const rawTopics = isEn ? (st.topicsEn || st.topics) : st.topics;
                          const topicsList = Array.isArray(rawTopics) 
                            ? rawTopics.map(t => safeStringify(t)) 
                            : safeStringify(rawTopics).split(',').map(t => t.trim()).filter(Boolean);

                          return (
                            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <span style={{ fontSize: '10px', color: theme.accentColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px', borderLeft: `2px solid ${theme.accentColor}`, paddingLeft: '6px' }}>
                                {subjText}
                              </span>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', paddingLeft: '2px' }}>
                                {topicsList.map((t, tIdx) => (
                                  <span key={tIdx} style={{
                                    fontSize: '9.5px',
                                    fontWeight: 600,
                                    background: 'var(--white)',
                                    border: '1px solid var(--border)',
                                    color: 'var(--text-primary)',
                                    padding: '2px 7px',
                                    borderRadius: '5px'
                                  }}>
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        });
                      }

                      return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '10px', color: theme.accentColor, fontWeight: 700, borderLeft: `2px solid ${theme.accentColor}`, paddingLeft: '6px' }}>
                          {safeStringify(isEn ? (exam.subjectsEn || exam.subjects || 'General') : (exam.subjects || 'সাধারণ'))}
                        </span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {(Array.isArray(isEn ? (exam.topicsEn || exam.topics) : exam.topics)
                            ? (isEn ? (exam.topicsEn || exam.topics) : exam.topics)
                            : safeStringify(isEn ? (exam.topicsEn || exam.topics) : exam.topics).split(',').map(t => t.trim()).filter(Boolean)
                          ).map((t, idx) => (
                            <span key={idx} style={{
                              fontSize: '9.5px',
                              fontWeight: 600,
                              background: 'var(--white)',
                              border: '1px solid var(--border)',
                              color: 'var(--text-primary)',
                              padding: '2px 7px',
                              borderRadius: '5px'
                            }}>
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

                {/* Bottom Actions Row */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
                  
                  {status === 'upcoming' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <button
                        onClick={() => handleRegister(exam.id)}
                        style={{
                          width: '100%',
                          padding: '8px 20px',
                          borderRadius: '10px',
                          border: isRegistered ? '1px solid #10b981' : 'none',
                          background: isRegistered ? '#ecfdf5' : 'linear-gradient(135deg, var(--primary) 0%, #3b82f6 100%)',
                          color: isRegistered ? '#065f46' : 'white',
                          fontWeight: 800,
                          fontSize: '11.5px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          boxShadow: isRegistered ? 'none' : '0 4px 10px rgba(26, 86, 219, 0.12)'
                        }}
                      >
                        {isRegistered ? (
                          <>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '2px' }}>
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            <span>{isEn ? 'Registered & Participating' : 'অংশগ্রহণ নিশ্চিত করা হয়েছে'}</span>
                          </>
                        ) : (
                          <>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '2px' }}>
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                            </svg>
                            <span>{isEn ? 'Participate in Exam' : 'পরীক্ষায় অংশগ্রহণ করুন'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {status === 'running' && (
                    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                      <button
                        onClick={() => navigate(`/live-exam-room/${exam.id}`)}
                        style={{
                          width: '100%',
                          padding: '8px 24px',
                          borderRadius: '10px',
                          border: 'none',
                          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                          color: 'white',
                          fontWeight: 800,
                          fontSize: '11.5px',
                          cursor: 'pointer',
                          boxShadow: '0 4px 10px rgba(239, 68, 68, 0.15)'
                        }}
                      >
                        {isEn ? 'Enter Exam Room Now' : 'পরীক্ষায় অংশ নিন (লাইভ)'} ➔
                      </button>
                    </div>
                  )}

                  {status === 'completed' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {result ? (
                        <div style={{ fontSize: '11.5px', color: '#10b981', fontWeight: 800 }}>
                          🏆 {isEn 
                            ? `Score: ${result.score}/${result.total}`
                            : `স্কোর: ${toBengaliNumber(result.score)}/${toBengaliNumber(result.total)}`}
                        </div>
                      ) : (
                        <span style={{ fontSize: '10px', color: '#dc2626', fontWeight: 700, background: '#fee2e2', padding: '3px 8px', borderRadius: '12px' }}>
                          {isEn ? 'Did Not Participate' : 'অংশগ্রহণ করেননি'}
                        </span>
                      )}
                      
                      <button
                        onClick={() => navigate(`/live-exam-room/${exam.id}`)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: '1px solid rgba(226, 232, 240, 0.8)',
                          background: 'transparent',
                          color: 'var(--primary)',
                          fontSize: '10.5px',
                          fontWeight: 800,
                          cursor: 'pointer'
                        }}
                      >
                        {result
                          ? (isEn ? 'Results & Leaderboard' : 'ফলাফল ও লিডারবোর্ড')
                          : (isEn ? 'Solutions & Leaderboard' : 'সমাধান ও লিডারবোর্ড')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

            {filteredExams.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', gridColumn: '1 / -1' }}>
                <span style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>📅</span>
                <p style={{ fontSize: '14px', fontWeight: 600 }}>
                  {activeTab === 'live'
                    ? (isEn ? 'No live or upcoming exams' : 'কোনো লাইভ বা আসন্ন পরীক্ষা নেই')
                    : (isEn ? 'No exam history found' : 'কোনো পরীক্ষার ইতিহাস পাওয়া যায়নি')}
                </p>
              </div>
            )}
          </>
        )}
        </div>
      </div>
      </PullToRefresh>

      <BottomNav />
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
