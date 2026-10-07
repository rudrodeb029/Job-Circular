import React from 'react';

/**
 * 1:1 Pixel-Perfect Live Exam & History Card Component
 * Designed matching Image 2: soft blue glass gradient backdrop, organic wave SVG, 
 * gold/cyan header badges, scheduled date & remaining time bar, subject topic pills, 
 * and pill action button with star icon.
 */
export default function LiveExamCard({
  exam,
  status = 'upcoming', // 'upcoming' | 'running' | 'completed'
  startMs = null,
  countdownStr = '',
  isRegistered = false,
  result = null,
  onRegister,
  onEnter,
  onViewResult,
  isEn = false
}) {
  if (!exam) return null;

  const title = isEn ? (exam.titleEn || exam.title) : exam.title;
  const durationText = isEn ? `${exam.duration || 10} Mins` : `${toBengaliNumber(exam.duration || 10)} মিনিট`;

  // Parse Date string formatted nicely (e.g. "১৫ সেপ, ০১:৫৭ AM")
  const dateFormatted = startMs
    ? new Date(startMs).toLocaleString(isEn ? 'en-US' : 'bn-BD', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : (isEn ? 'Scheduled Soon' : 'নির্ধারিত সময়');

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 45%, #e0f2fe 100%)',
        borderRadius: '20px',
        border: '1.5px solid rgba(255, 255, 255, 0.9)',
        boxShadow: '0 8px 24px -4px rgba(37, 99, 235, 0.12), 0 2px 6px -2px rgba(15, 23, 42, 0.04)',
        padding: '14px 12px 14px 12px',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.2s ease-in-out',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent'
      }}
      className="live-exam-card-hover"
    >
      {/* Top Left Organic Wave SVG Blob Accent */}
      <svg
        style={{ position: 'absolute', top: '-10px', left: '-10px', width: '120px', height: '100px', opacity: 0.18, pointerEvents: 'none' }}
        viewBox="0 0 120 100"
        fill="none"
      >
        <path d="M0 0 C40 10 90 40 100 80 C80 90 20 100 0 70 Z" fill="#2563eb" />
      </svg>

      <div>
        {/* Row 1: Badges (Status Pill + Duration Pill) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px', marginBottom: '8px', position: 'relative', zIndex: 2 }}>
          {/* Status Badge */}
          {status === 'upcoming' && (
            <span style={{
              background: '#fef3c7',
              border: '1px solid rgba(251, 191, 36, 0.4)',
              color: '#92400e',
              fontSize: '10px',
              fontWeight: 800,
              padding: '3px 9px',
              borderRadius: '20px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span role="img" aria-label="calendar">🗓️</span>
              <span>{isEn ? 'Upcoming Exam' : 'আসন্ন পরীক্ষা'}</span>
            </span>
          )}

          {status === 'running' && (
            <span style={{
              background: '#fee2e2',
              border: '1px solid rgba(248, 113, 113, 0.4)',
              color: '#dc2626',
              fontSize: '10px',
              fontWeight: 800,
              padding: '3px 9px',
              borderRadius: '20px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.2s infinite', display: 'inline-block' }} />
              <span>{isEn ? 'LIVE NOW' : 'লাইভ চলছে'}</span>
            </span>
          )}

          {status === 'completed' && (
            <span style={{
              background: '#e0e7ff',
              border: '1px solid rgba(165, 180, 252, 0.4)',
              color: '#3730a3',
              fontSize: '10px',
              fontWeight: 800,
              padding: '3px 9px',
              borderRadius: '20px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span role="img" aria-label="check">✅</span>
              <span>{isEn ? 'Completed' : 'পরীক্ষা সম্পন্ন'}</span>
            </span>
          )}

          {/* Duration Pill */}
          <span style={{
            background: '#e0f2fe',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            color: '#0284c7',
            fontSize: '10px',
            fontWeight: 800,
            padding: '3px 9px',
            borderRadius: '20px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            whiteSpace: 'nowrap'
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>{durationText}</span>
          </span>
        </div>

        {/* Row 2: Scheduled Date & Countdown Bar */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(4px)',
          borderRadius: '8px',
          padding: '5px 8px',
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '3px',
          position: 'relative',
          zIndex: 2,
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          <span style={{ fontSize: '9.5px', color: '#1e293b', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px', whiteSpace: 'nowrap' }}>
            <span role="img" aria-label="calendar">🗓️</span>
            <span>{dateFormatted}</span>
          </span>

          <span style={{ color: 'rgba(203, 213, 225, 0.8)', margin: '0 4px', fontSize: '10px' }}>|</span>

          <span style={{ fontSize: '9.5px', color: '#475569', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px', whiteSpace: 'nowrap' }}>
            <span>{isEn ? 'Left:' : 'বাকি:'}</span>
            <span style={{ color: '#d97706', fontWeight: 800 }}>
              {countdownStr || (isEn ? '0m 00s' : '০মি: ০০সে:')}
            </span>
          </span>
        </div>

        {/* Exam Title */}
        <h3 style={{
          fontSize: '14.5px',
          fontWeight: 900,
          color: '#0f172a',
          margin: '0 0 10px 0',
          lineHeight: '1.35',
          fontFamily: '"Hind Siliguri", "Poppins", sans-serif',
          position: 'relative',
          zIndex: 2
        }}>
          {title}
        </h3>

        {/* Subjects & Topics Container */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.9)',
          borderRadius: '14px',
          padding: '10px',
          marginBottom: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          position: 'relative',
          zIndex: 2
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
                    <span style={{
                      fontSize: '10px',
                      color: '#2563eb',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.4px',
                      borderLeft: '2.5px solid #2563eb',
                      paddingLeft: '5px'
                    }}>
                      {subjText}
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', paddingLeft: '2px' }}>
                      {topicsList.map((t, tIdx) => (
                        <span key={tIdx} style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          background: '#ffffff',
                          border: '1px solid rgba(226, 232, 240, 0.8)',
                          color: '#1e293b',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                        }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              });
            }

            // Default Subjects Fallback
            const subjName = safeStringify(isEn ? (exam.subjectsEn || exam.subjects || 'General') : (exam.subjects || 'BCS EXAM'));
            const topicsArr = (Array.isArray(isEn ? (exam.topicsEn || exam.topics) : exam.topics)
              ? (isEn ? (exam.topicsEn || exam.topics) : exam.topics)
              : safeStringify(isEn ? (exam.topicsEn || exam.topics) : exam.topics).split(',').map(t => t.trim()).filter(Boolean)
            );

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{
                  fontSize: '10px',
                  color: '#2563eb',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                  borderLeft: '2.5px solid #2563eb',
                  paddingLeft: '5px'
                }}>
                  {subjName}
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {topicsArr.map((t, idx) => (
                    <span key={idx} style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      background: '#ffffff',
                      border: '1px solid rgba(226, 232, 240, 0.8)',
                      color: '#1e293b',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
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

      {/* Action Button Row */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto', position: 'relative', zIndex: 2 }}>
        {status === 'upcoming' && (
          <button
            onClick={() => onRegister && onRegister(exam.id)}
            style={{
              width: '100%',
              padding: '8px 18px',
              borderRadius: '22px',
              border: isRegistered ? '1px solid #10b981' : 'none',
              background: isRegistered ? '#ecfdf5' : 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)',
              color: isRegistered ? '#065f46' : '#ffffff',
              fontWeight: 800,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: isRegistered ? 'none' : '0 4px 12px rgba(37, 99, 235, 0.35)',
              transition: 'all 0.2s ease'
            }}
          >
            {isRegistered ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>{isEn ? 'Participating' : 'অংশগ্রহণ করছেন'}</span>
              </>
            ) : (
              <>
                <span role="img" aria-label="star" style={{ fontSize: '13px' }}>⭐</span>
                <span>{isEn ? 'Participate' : 'অংশগ্রহণ করুন'}</span>
              </>
            )}
          </button>
        )}

        {status === 'running' && (
          <button
            onClick={() => onEnter && onEnter(exam.id)}
            style={{
              width: '100%',
              padding: '8px 18px',
              borderRadius: '22px',
              border: 'none',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.35)'
            }}
          >
            <span role="img" aria-label="fire">⚡</span>
            <span>{isEn ? 'Enter Exam Room' : 'এখনই পরীক্ষায় অংশ নিন'}</span>
          </button>
        )}

        {status === 'completed' && (
          <button
            onClick={() => onViewResult && onViewResult(exam.id)}
            style={{
              width: '100%',
              padding: '8px 16px',
              borderRadius: '22px',
              border: 'none',
              background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)'
            }}
          >
            <span role="img" aria-label="trophy">🏆</span>
            <span>
              {result
                ? (isEn ? `Results (${result.score}/${result.total})` : `ফলাফল (${toBengaliNumber(result.score)}/${toBengaliNumber(result.total)})`)
                : (isEn ? 'View Solutions' : 'সমাধান ও ফলাফল')}
            </span>
          </button>
        )}
      </div>
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
  }
  return fallback;
};

const toBengaliNumber = (num) => {
  if (num === undefined || num === null) return '';
  const engNum = safeStringify(num);
  const bengaliDigits = {'0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'};
  return engNum.split('').map(digit => bengaliDigits[digit] || digit).join('');
};
