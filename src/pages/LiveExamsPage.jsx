import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, FileText, Calendar, ChevronRight } from '../components/Icons';
import { useAppContext } from '../context/AppContext';
import { getLiveExams } from '../data/liveExams';
import BottomNav from '../components/BottomNav';
import { formatTimeAgo } from '../utils/timeUtils';

export default function LiveExamsPage() {
  const navigate = useNavigate();
  const { state } = useAppContext();
  const isEn = state.language === 'en';

  const [liveExams, setLiveExams] = useState([]);
  const [now, setNow] = useState(Date.now());
  const [registrations, setRegistrations] = useState({});
  const [toastMessage, setToastMessage] = useState('');
  const [liveTab, setLiveTab] = useState('live'); // 'live' | 'history'

  useEffect(() => {
    setLiveExams(getLiveExams());

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

  const getExamResult = (examId) => {
    try {
      const results = JSON.parse(localStorage.getItem('live_exam_results')) || {};
      return results[examId];
    } catch (e) {
      return null;
    }
  };

  const getExamStatus = (exam) => {
    const startMs = new Date(exam.startTime).getTime();
    const endMs = startMs + exam.duration * 60 * 1000;

    if (now >= startMs && now < endMs) {
      const isCompleted = getExamResult(exam.id);
      if (isCompleted) return { type: 'submitted', label: isEn ? 'Submitted' : 'অংশগ্রহণ করেছেন' };
      return { type: 'live', label: isEn ? 'Live Now' : 'লাইভ চলছে' };
    } else if (now < startMs) {
      return { type: 'upcoming', label: isEn ? 'Upcoming' : 'আসন্ন পরীক্ষা' };
    } else {
      return { type: 'ended', label: isEn ? 'Ended' : 'পরীক্ষা শেষ' };
    }
  };

  const getCountdownString = (startTimeStr) => {
    const startMs = new Date(startTimeStr).getTime();
    const diff = startMs - now;
    if (diff <= 0) return '';

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
      ? (isEn ? 'Registration successful!' : 'রেজিস্ট্রেশন সম্পন্ন হয়েছে!')
      : (isEn ? 'Registration cancelled.' : 'রেজিস্ট্রেশন বাতিল করা হয়েছে।');

    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const filteredLiveExams = useMemo(() => {
    const list = liveExams.filter(exam => {
      const status = getExamStatus(exam);
      if (liveTab === 'live') {
        return status.type === 'live' || status.type === 'upcoming';
      } else {
        return status.type === 'ended' || status.type === 'submitted';
      }
    });

    const getItemTimestamp = (item) => {
      if (item.createdAt) return new Date(item.createdAt).getTime();
      if (item.id) {
        const matches = String(item.id).match(/\d{10,13}/);
        if (matches) return parseInt(matches[0], 10);
      }
      return 0;
    };

    return [...list].sort((a, b) => {
      const tsA = getItemTimestamp(a);
      const tsB = getItemTimestamp(b);
      return tsB - tsA;
    });
  }, [liveExams, liveTab, now]);

  return (
    <div className="page" style={{ paddingBottom: '100px', background: 'var(--bg)' }}>
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
          fontSize: '12.5px',
          fontWeight: 700,
          zIndex: 9999,
          animation: 'slideDown 0.3s ease'
        }}>
          {toastMessage}
        </div>
      )}

      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
        </button>
        <h1 style={{ flex: 1, fontSize: '16px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
          <span>{isEn ? 'Live MCQ Exam' : 'লাইভ এমসিকিউ পরীক্ষা'}</span>
        </h1>
      </div>

      <div className="page-content animate-fade-in" style={{ padding: '16px' }}>

        {/* Tab Selector */}
        <div style={{
          display: 'flex',
          background: 'var(--white)',
          borderBottom: '1px solid var(--border-light)',
          padding: '0 8px',
          borderRadius: '12px',
          marginBottom: '16px'
        }}>
          <button
            onClick={() => setLiveTab('live')}
            style={{
              flex: 1,
              padding: '14px 0',
              background: 'transparent',
              border: 'none',
              borderBottom: liveTab === 'live' ? '3px solid var(--primary)' : '3px solid transparent',
              color: liveTab === 'live' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {isEn ? 'Live & Upcoming' : 'লাইভ ও আসন্ন'}
          </button>
          <button
            onClick={() => setLiveTab('history')}
            style={{
              flex: 1,
              padding: '14px 0',
              background: 'transparent',
              border: 'none',
              borderBottom: liveTab === 'history' ? '3px solid var(--primary)' : '3px solid transparent',
              color: liveTab === 'history' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {isEn ? 'History & Results' : 'ইতিহাস ও ফলাফল'}
          </button>
        </div>

        {/* Regulations Card */}
        {liveTab === 'live' && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.09) 0%, rgba(220, 38, 38, 0.04) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.15)',
            borderRadius: '20px',
            padding: '18px',
            marginBottom: '20px',
            boxShadow: '0 4px 20px rgba(239, 68, 68, 0.03)'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#991b1b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '16px' }}>⚠️</span>
              <span>{isEn ? 'Live Exam Regulations' : 'লাইভ পরীক্ষার নিয়াবলী'}</span>
            </h3>
            <p style={{ fontSize: '12px', lineHeight: 1.6, color: '#b91c1c', fontWeight: 500, margin: 0 }}>
              {isEn
                ? 'The exam starts exactly at the scheduled time. Results will be calculated instantly upon submission.'
                : 'নির্ধারিত সময়ে সরাসরি লাইভ পরীক্ষায় অংশ নিন। পরীক্ষা শুরু হওয়ার পর সময়ের মধ্যে সাবমিট করতে হবে। সময় শেষ হলে স্বয়ংক্রিয়ভাবে সাবমিট হয়ে যাবে।'}
            </p>
          </div>
        )}

        {/* Exams List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filteredLiveExams.map(exam => {
            const status = getExamStatus(exam);
            const isRegistered = !!registrations[exam.id];
            const result = getExamResult(exam.id);

            return (
              <div
                key={exam.id}
                className="animate-slide-up"
                style={{
                  background: 'var(--white)',
                  border: status.type === 'live' ? '1.5px solid var(--primary)' : '1px solid var(--border-light)',
                  padding: '20px',
                  borderRadius: '20px',
                  boxShadow: '0 4px 18px rgba(0,0,0,0.03)',
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
                  background: status.type === 'live' ? 'linear-gradient(90deg, #ef4444, #dc2626)' : status.type === 'upcoming' ? 'linear-gradient(90deg, #f59e0b, #d97706)' : '#cbd5e1'
                }}></div>

                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      color: status.type === 'live' ? '#dc2626' : status.type === 'upcoming' ? '#b45309' : 'var(--text-muted)',
                      background: status.type === 'live' ? 'rgba(239, 68, 68, 0.08)' : status.type === 'upcoming' ? 'rgba(245, 158, 11, 0.12)' : 'var(--bg-secondary)',
                      padding: '5px 12px',
                      borderRadius: '30px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      {status.type === 'live' && (
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', display: 'inline-block', animation: 'pulse 1.5s infinite' }}></span>
                      )}
                      {status.label.toUpperCase()}
                    </span>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--primary)', background: 'rgba(26, 86, 219, 0.06)', padding: '5px 12px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                       ⏱️ {isEn ? `${exam.duration}m` : `${toBengaliNumber(exam.duration)}মি:`}
                    </span>
                 </div>

                 {status.type === 'upcoming' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', background: 'var(--bg-secondary)', padding: '8px 12px', borderRadius: '10px', alignItems: 'center' }}>
                       <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={12} />
                          {new Date(exam.startTime).toLocaleString(isEn ? 'en-US' : 'bn-BD', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                       </span>
                       <span style={{ fontSize: '11px', fontWeight: 700, color: '#d97706', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>⏳</span>
                          <span style={{ fontFamily: 'monospace' }}>{getCountdownString(exam.startTime)}</span>
                       </span>
                    </div>
                 )}

                 <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px', lineHeight: '1.4' }}>
                    {isEn ? exam.titleEn : exam.title}
                 </h4>

                 <div style={{ background: 'var(--bg-secondary)', borderRadius: '14px', padding: '14px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {exam.subjectTopics?.map((st, idx) => (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                         <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.3px', borderLeft: '3px solid var(--primary)', paddingLeft: '8px' }}>
                            {isEn ? st.subjectEn : st.subject}
                         </div>
                         <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingLeft: '4px' }}>
                            {(isEn ? st.topicsEn : st.topics)?.split(',').map((t, tIdx) => (
                               <span key={tIdx} style={{ fontSize: '10px', fontWeight: 600, background: 'var(--white)', padding: '3px 10px', borderRadius: '8px', color: 'var(--text-secondary)', border: '1px solid var(--border-light)' }}>
                                  {t.trim()}
                               </span>
                            ))}
                         </div>
                      </div>
                    ))}
                 </div>

                 <div style={{ display: 'flex', justifyContent: 'center' }}>
                    {status.type === 'upcoming' ? (
                      <button
                        onClick={() => handleRegister(exam.id)}
                        style={{
                          width: '100%',
                          borderRadius: '14px',
                          height: '46px',
                          border: isRegistered ? '1.5px solid #10b981' : 'none',
                          background: isRegistered ? 'rgba(16, 185, 129, 0.05)' : 'linear-gradient(135deg, var(--primary) 0%, #2563eb 100%)',
                          color: isRegistered ? '#047857' : 'white',
                          fontWeight: 800,
                          fontSize: '13.5px',
                          cursor: 'pointer',
                          boxShadow: isRegistered ? 'none' : '0 4px 12px rgba(26, 86, 219, 0.15)',
                          transition: 'all 0.2s'
                        }}
                      >
                        {isRegistered ? (isEn ? '✓ Registered' : '✅ অংশগ্রহণ নিশ্চিত') : (isEn ? 'Participate Now' : 'পরীক্ষায় অংশ নিন')}
                      </button>
                    ) : status.type === 'live' ? (
                      <button
                        onClick={() => navigate(`/live-exam-room/${exam.id}`)}
                        style={{
                          width: '100%',
                          borderRadius: '14px',
                          height: '46px',
                          border: 'none',
                          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                          color: 'white',
                          fontWeight: 800,
                          fontSize: '13.5px',
                          cursor: 'pointer',
                          boxShadow: '0 4px 14px rgba(239, 68, 68, 0.2)'
                        }}
                      >
                        {isEn ? 'Enter Exam Room Now' : 'পরীক্ষায় অংশ নিন (লাইভ)'} ➔
                      </button>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>{isEn ? 'YOUR SCORE' : 'আপনার স্কোর'}</span>
                            <span style={{ fontSize: '14px', color: result ? 'var(--success)' : 'var(--text-muted)', fontWeight: 800 }}>
                               {result ? (isEn ? `${result.score}/${result.total}` : `${toBengaliNumber(result.score)}/${toBengaliNumber(result.total)}`) : (isEn ? 'Did not attend' : 'অংশ নেননি')}
                            </span>
                         </div>
                         <button
                           onClick={() => navigate(`/live-exam-room/${exam.id}`)}
                           style={{
                             padding: '10px 18px',
                             borderRadius: '12px',
                             background: 'var(--white)',
                             border: '1.5px solid var(--border-light)',
                             color: 'var(--text-secondary)',
                             fontSize: '12.5px',
                             fontWeight: 800,
                             cursor: 'pointer',
                             display: 'flex',
                             alignItems: 'center',
                             gap: '6px'
                           }}
                         >
                            <span>📊 {isEn ? 'Results' : 'ফলাফল ও র‍্যাংক'}</span>
                         </button>
                      </div>
                    )}
                 </div>
              </div>
            );
          })}

          {filteredLiveExams.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
               <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>📅</span>
               <p style={{ fontSize: '14px', fontWeight: 600 }}>{isEn ? 'No live exams found at the moment' : 'বর্তমানে কোনো লাইভ পরীক্ষা পাওয়া যায়নি'}</p>
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

const toBengaliNumber = (num) => {
  const engNum = String(num);
  const bengaliDigits = {'0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'};
  return engNum.split('').map(digit => bengaliDigits[digit] || digit).join('');
};
