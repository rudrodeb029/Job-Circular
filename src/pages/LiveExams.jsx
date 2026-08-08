import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from '../components/Icons';
import { useAppContext } from '../context/AppContext';
import { getLiveExams } from '../data/liveExams';
import BottomNav from '../components/BottomNav';
import { onCollectionSnapshot, COLLECTIONS } from '../services/firestoreService';

export default function LiveExams() {
  const navigate = useNavigate();
  const { state } = useAppContext();
  const isEn = state.language === 'en';
  
  const [exams, setExams] = useState([]);
  const [now, setNow] = useState(Date.now());
  const [registrations, setRegistrations] = useState({});
  const [toastMessage, setToastMessage] = useState('');
  const [activeTab, setActiveTab] = useState('live'); // 'live' | 'history'

  // Ticks the clock every second and reads databases reactively
  useEffect(() => {
    // 1. Initial load from local cache/defaults
    setExams(getLiveExams());

    // 2. Real-time Firestore sync
    const unsubscribe = onCollectionSnapshot(COLLECTIONS.LIVE_EXAMS, (data) => {
      if (data && data.length > 0) {
        const sorted = [...data].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setExams(sorted);
      }
    });
    
    // 3. Load registrations
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
      unsubscribe && unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const getExamStatus = (exam) => {
    const startMs = new Date(exam.startTime).getTime();
    const endMs = startMs + exam.duration * 60 * 1000;

    if (now >= startMs && now < endMs) {
      return 'running';
    } else if (now < startMs) {
      return 'upcoming';
    } else {
      return 'completed';
    }
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
      return results[examId];
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
        <h1 style={{ flex: 1, fontSize: '18px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
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
          onClick={() => setActiveTab('live')}
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
          onClick={() => setActiveTab('history')}
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

      <div className="page-content animate-fade-in" style={{ padding: '16px' }}>
        
        {/* Sleek, Premium Regulations Card (Only shown in Live tab) */}
        {activeTab === 'live' && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.09) 0%, rgba(220, 38, 38, 0.04) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.15)',
            borderRadius: '20px',
            padding: '18px',
            marginBottom: '20px',
            boxShadow: '0 4px 20px rgba(239, 68, 68, 0.03)'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#991b1b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <span>{isEn ? 'Live Exam Regulations' : 'লাইভ পরীক্ষার নিয়াবলী'}</span>
            </h3>
            <p style={{ fontSize: '12px', lineHeight: 1.6, color: '#b91c1c', fontWeight: 500, margin: 0 }}>
              {isEn 
                ? 'Participate in real-time competitive exams. The exam starts exactly at the scheduled time. Results will be calculated instantly upon submission.'
                : 'নির্ধারিত সময়ে সরাসরি লাইভ পরীক্ষায় অংশ নিন। পরীক্ষা শুরু হওয়ার পর সময়ের মধ্যে সাবমিট করতে হবে। সময় শেষ হলে স্বয়ংক্রিয়ভাবে সাবমিট হয়ে যাবে।'}
            </p>
          </div>
        )}

        {/* Exams List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filteredExams.map(exam => {
            const status = getExamStatus(exam);
            const startMs = new Date(exam.startTime).getTime();
            const result = getExamResult(exam.id);
            const isRegistered = !!registrations[exam.id];

            return (
              <div
                key={exam.id}
                style={{
                  background: 'var(--white)',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  borderLeft: status === 'running'
                    ? '4px solid #ef4444'
                    : status === 'upcoming'
                      ? '4px solid var(--primary)'
                      : '4px solid #94a3b8',
                  borderRadius: '16px',
                  padding: '16px',
                  boxShadow: '0 4px 16px rgba(15, 23, 42, 0.02)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s'
                }}
              >
                {/* Card Header row 1: Badges */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  {/* Status Badge */}
                  {status === 'running' && (
                    <span style={{
                      fontSize: '9.5px',
                      fontWeight: 800,
                      color: '#ef4444',
                      background: '#fee2e2',
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
                      color: 'var(--primary)',
                      background: '#eff6ff',
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
                      color: '#64748b',
                      background: '#f1f5f9',
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

                {/* Card Header row 2: Start Date & Countdown (Upcoming Only) */}
                {status === 'upcoming' && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#f8fafc',
                    borderRadius: '10px',
                    padding: '6px 10px',
                    marginBottom: '10px'
                  }}>
                    <span style={{ fontSize: '10px', color: '#475569', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      {new Date(exam.startTime).toLocaleString(isEn ? 'en-US' : 'bn-BD', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#d97706', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ color: '#64748b', fontWeight: 500 }}>
                        {isEn ? 'Left:' : 'বাকি:'}
                      </span>
                      <span style={{ fontFamily: 'monospace' }}>
                        {getCountdownString(startMs)}
                      </span>
                    </span>
                  </div>
                )}

                <h4 style={{
                  fontSize: '13.5px',
                  fontWeight: 700,
                  color: '#0f172a',
                  marginBottom: '10px',
                  lineHeight: '1.4'
                }}>
                  {isEn ? exam.titleEn : exam.title}
                </h4>

                {/* Subjects & Topics separately */}
                <div style={{
                  background: 'rgba(241, 245, 249, 0.4)',
                  borderRadius: '12px',
                  padding: '10px 12px',
                  marginBottom: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  {exam.subjectTopics && exam.subjectTopics.length > 0 ? (
                    exam.subjectTopics.map((st, idx) => (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px', borderLeft: '2px solid var(--primary)', paddingLeft: '6px' }}>
                          {isEn ? st.subjectEn : st.subject}
                        </span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', paddingLeft: '2px' }}>
                          {(isEn ? st.topicsEn : st.topics)?.split(',').map((t, tIdx) => (
                            <span key={tIdx} style={{
                              fontSize: '9px',
                              fontWeight: 600,
                              background: 'var(--white)',
                              border: '1px solid rgba(226, 232, 240, 0.7)',
                              color: '#64748b',
                              padding: '2px 6px',
                              borderRadius: '5px'
                            }}>
                              {t.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 700, borderLeft: '2px solid var(--primary)', paddingLeft: '6px' }}>
                        {isEn ? exam.subjectsEn || 'General' : exam.subjects || 'সাধারণ'}
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {(isEn ? exam.topicsEn : exam.topics)?.split(',').map((t, idx) => (
                          <span key={idx} style={{
                            fontSize: '9px',
                            fontWeight: 600,
                            background: 'var(--white)',
                            border: '1px solid rgba(226, 232, 240, 0.7)',
                            color: '#64748b',
                            padding: '2px 6px',
                            borderRadius: '5px'
                          }}>
                            {t.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  
                  {status === 'upcoming' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <button
                        onClick={() => handleRegister(exam.id)}
                        style={{
                          width: 'auto',
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
                          width: 'auto',
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
                        <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 500 }}>
                          {isEn ? 'You did not attend' : 'আপনি অংশ নেননি'}
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
                        {isEn ? 'Solutions & Leaderboard' : 'ফলাফল ও লিডারবোর্ড'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {filteredExams.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <span style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>📅</span>
              <p style={{ fontSize: '14px', fontWeight: 600 }}>
                {activeTab === 'live'
                  ? (isEn ? 'No live or upcoming exams' : 'কোনো লাইভ বা আসন্ন পরীক্ষা নেই')
                  : (isEn ? 'No exam history found' : 'কোনো পরীক্ষার ইতিহাস পাওয়া যায়নি')}
              </p>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

const toBengaliNumber = (num) => {
  if (num === undefined || num === null) return '';
  const engNum = String(num);
  const bengaliDigits = {'0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'};
  return engNum.split('').map(digit => bengaliDigits[digit] || digit).join('');
};
