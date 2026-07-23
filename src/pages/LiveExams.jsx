import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from '../components/Icons';
import { useAppContext } from '../context/AppContext';
import { getLiveExams } from '../data/liveExams';
import BottomNav from '../components/BottomNav';

export default function LiveExams() {
  const navigate = useNavigate();
  const { state } = useAppContext();
  const isEn = state.language === 'en';
  
  const [exams, setExams] = useState([]);
  const [now, setNow] = useState(Date.now());
  const [registrations, setRegistrations] = useState({});
  const [toastMessage, setToastMessage] = useState('');
  const [activeTab, setActiveTab] = useState('live'); // 'live' | 'history'

  // Ticks the clock every second and reads databases
  useEffect(() => {
    setExams(getLiveExams());
    
    // Load registrations
    try {
      const saved = JSON.parse(localStorage.getItem('registered_exams')) || {};
      setRegistrations(saved);
    } catch (e) {
      console.error(e);
    }

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
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
    if (diff <= 0) return '00:00';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    const pad = (num) => String(num).padStart(2, '0');

    if (hours > 0) {
      return isEn 
        ? `${hours}h ${mins}m ${secs}s` 
        : `${toBengaliNumber(hours)} ঘণ্টা ${toBengaliNumber(mins)} মিনিট`;
    } else {
      return `${pad(mins)}:${pad(secs)}`;
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
        <h1 style={{ flex: 1, fontSize: '18px', fontWeight: 800 }}>
          {isEn ? 'Live MCQ Exams' : 'লাইভ এমসিকিউ পরীক্ষা'}
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
              <span>📢</span>
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
                  border: status === 'running' 
                    ? '1.5px solid var(--primary)' 
                    : '1px solid var(--border-light)',
                  borderRadius: '20px',
                  padding: '20px',
                  boxShadow: '0 4px 18px rgba(0, 0, 0, 0.03)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Visual Status Indicator Line */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: status === 'running' 
                    ? 'linear-gradient(90deg, #3b82f6, #2563eb)' 
                    : status === 'upcoming' 
                      ? 'linear-gradient(90deg, #f59e0b, #d97706)' 
                      : 'linear-gradient(90deg, #94a3b8, #cbd5e1)'
                }}></div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  {/* Status Badge */}
                  {status === 'running' && (
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      color: 'var(--primary)',
                      background: 'var(--primary-bg)',
                      padding: '5px 12px',
                      borderRadius: '30px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      <span style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: 'var(--primary)',
                        display: 'inline-block',
                        animation: 'pulse 1.5s infinite'
                      }}></span>
                      {isEn ? 'LIVE NOW' : 'লাইভ চলছে'}
                    </span>
                  )}

                  {status === 'upcoming' && (
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      color: '#d97706',
                      background: 'rgba(245, 158, 11, 0.08)',
                      padding: '5px 12px',
                      borderRadius: '30px'
                    }}>
                      ⏳ {isEn ? 'UPCOMING' : 'আসন্ন পরীক্ষা'}
                    </span>
                  )}

                  {status === 'completed' && (
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      color: 'var(--text-muted)',
                      background: 'var(--bg-secondary)',
                      padding: '5px 12px',
                      borderRadius: '30px'
                    }}>
                      ✅ {isEn ? 'COMPLETED' : 'শেষ হয়েছে'}
                    </span>
                  )}

                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>
                    ⏱️ {isEn ? `${exam.duration} Mins` : `${toBengaliNumber(exam.duration)} মিনিট`}
                  </span>
                </div>

                <h4 style={{
                  fontSize: '16px',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  marginBottom: '14px',
                  lineHeight: '1.4'
                }}>
                  {isEn ? exam.titleEn : exam.title}
                </h4>

                {/* Subjects & Topics separately */}
                <div style={{
                  background: 'var(--bg-secondary)',
                  borderRadius: '14px',
                  padding: '14px',
                  marginBottom: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  {exam.subjectTopics && exam.subjectTopics.length > 0 ? (
                    exam.subjectTopics.map((st, idx) => (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                          📚 {isEn ? st.subjectEn : st.subject}
                        </span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', paddingLeft: '4px' }}>
                          {(isEn ? st.topicsEn : st.topics)?.split(',').map((t, tIdx) => (
                            <span key={tIdx} style={{
                              fontSize: '10px',
                              fontWeight: 600,
                              background: 'var(--white)',
                              border: '1px solid var(--border-light)',
                              color: 'var(--text-secondary)',
                              padding: '2px 8px',
                              borderRadius: '6px'
                            }}>
                              📌 {t.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 800 }}>
                        📚 {isEn ? exam.subjectsEn || 'General' : exam.subjects || 'সাধারণ'}
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {(isEn ? exam.topicsEn : exam.topics)?.split(',').map((t, idx) => (
                          <span key={idx} style={{
                            fontSize: '10px',
                            fontWeight: 600,
                            background: 'var(--white)',
                            border: '1px solid var(--border-light)',
                            color: 'var(--text-secondary)',
                            padding: '2px 8px',
                            borderRadius: '6px'
                          }}>
                            📌 {t.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Start Date & Time details */}
                <div style={{
                  background: 'rgba(26, 86, 219, 0.03)',
                  border: '1px dashed rgba(26, 86, 219, 0.15)',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    📅 {isEn ? 'Starts At:' : 'শুরুর সময়:'}{' '}
                    <strong style={{ color: 'var(--primary)' }}>
                      {new Date(exam.startTime).toLocaleString(isEn ? 'en-US' : 'bn-BD', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </strong>
                  </span>
                </div>

                {/* Bottom Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  
                  {status === 'upcoming' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <button
                        onClick={() => handleRegister(exam.id)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '12px',
                          border: isRegistered ? '1.5px solid #10b981' : 'none',
                          background: isRegistered ? 'rgba(16, 185, 129, 0.05)' : 'linear-gradient(135deg, var(--primary) 0%, #2563eb 100%)',
                          color: isRegistered ? '#047857' : 'white',
                          fontWeight: 800,
                          fontSize: '13px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          boxShadow: isRegistered ? 'none' : '0 4px 14px rgba(26, 86, 219, 0.2)'
                        }}
                      >
                        {isRegistered ? (
                          <>
                            <span>✅</span>
                            <span>{isEn ? 'Registered & Participating' : 'অংশগ্রহণ নিশ্চিত করা হয়েছে'}</span>
                          </>
                        ) : (
                          <>
                            <span>🎯</span>
                            <span>{isEn ? 'Participate in Exam' : 'পরীক্ষায় অংশগ্রহণ করুন'}</span>
                          </>
                        )}
                      </button>

                      {/* Ticking countdown */}
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {isEn ? 'Starts in:' : 'শুরু হতে বাকি:'}
                        </span>
                        <strong style={{ fontSize: '13px', color: 'var(--warning)', fontFamily: 'monospace' }}>
                          {getCountdownString(startMs)}
                        </strong>
                      </div>
                    </div>
                  )}

                  {status === 'running' && (
                    <button
                      onClick={() => navigate(`/live-exam-room/${exam.id}`)}
                      style={{
                        width: '100%',
                        padding: '14px',
                        borderRadius: '12px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        color: 'white',
                        fontWeight: 800,
                        fontSize: '13px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)'
                      }}
                    >
                      {isEn ? 'Enter Exam Room Now' : 'পরীক্ষায় অংশ নিন (লাইভ)'} ➔
                    </button>
                  )}

                  {status === 'completed' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {result ? (
                        <div style={{ fontSize: '12px', color: 'var(--success)', fontWeight: 800 }}>
                          🏆 {isEn 
                            ? `Score: ${result.score}/${result.total}`
                            : `স্কোর: ${toBengaliNumber(result.score)}/${toBengaliNumber(result.total)}`}
                        </div>
                      ) : (
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
                          {isEn ? 'You did not attend' : 'আপনি অংশ নেননি'}
                        </span>
                      )}
                      
                      <button
                        onClick={() => navigate(`/live-exam-room/${exam.id}`)}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                          background: 'transparent',
                          color: 'var(--primary)',
                          fontSize: '11px',
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
