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
        borderRadius: '16px',
        border: '1.5px solid rgba(255, 255, 255, 0.9)',
        boxShadow: '0 4px 14px -3px rgba(37, 99, 235, 0.1), 0 2px 5px -2px rgba(15, 23, 42, 0.04)',
        padding: '10px 8px 10px 8px',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.2s ease-in-out',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        boxSizing: 'border-box'
      }}
      className="live-exam-card-hover"
    >
      {/* Top Left Organic Wave SVG Blob Accent */}
      <svg
        style={{ position: 'absolute', top: '-10px', left: '-10px', width: '80px', height: '65px', opacity: 0.15, pointerEvents: 'none' }}
        viewBox="0 0 120 100"
        fill="none"
      >
        <path d="M0 0 C40 10 90 40 100 80 C80 90 20 100 0 70 Z" fill="#2563eb" />
      </svg>

      <div>
        {/* Row 1: Badges (Status Pill + Duration Pill) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px', marginBottom: '6px', position: 'relative', zIndex: 2 }}>
          {/* Status Badge */}
          {status === 'upcoming' && (
            <span style={{
              background: '#fef3c7',
              border: '1px solid rgba(251, 191, 36, 0.4)',
              color: '#92400e',
              fontSize: '8.5px',
              fontWeight: 800,
              padding: '2px 6px',
              borderRadius: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px'
            }}>
              <span role="img" aria-label="calendar" style={{ fontSize: '9px' }}>🗓️</span>
              <span>{isEn ? 'Upcoming' : 'আসন্ন'}</span>
            </span>
          )}

          {status === 'running' && (
            <span style={{
              background: '#fee2e2',
              border: '1px solid rgba(248, 113, 113, 0.4)',
              color: '#dc2626',
              fontSize: '8.5px',
              fontWeight: 800,
              padding: '2px 6px',
              borderRadius: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px'
            }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.2s infinite', display: 'inline-block' }} />
              <span>{isEn ? 'LIVE NOW' : 'লাইভ চলছে'}</span>
            </span>
          )}

          {status === 'completed' && (
            <span style={{
              background: '#e0e7ff',
              border: '1px solid rgba(165, 180, 252, 0.4)',
              color: '#3730a3',
              fontSize: '8.5px',
              fontWeight: 800,
              padding: '2px 6px',
              borderRadius: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px'
            }}>
              <span role="img" aria-label="check" style={{ fontSize: '9px' }}>✅</span>
              <span>{isEn ? 'Completed' : 'সম্পন্ন'}</span>
            </span>
          )}

          {/* Duration Pill */}
          <span style={{
            background: '#e0f2fe',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            color: '#0284c7',
            fontSize: '8.5px',
            fontWeight: 800,
            padding: '2px 6px',
            borderRadius: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
            whiteSpace: 'nowrap'
          }}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
          borderRadius: '6px',
          padding: '3px 6px',
          marginBottom: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '2px',
          position: 'relative',
          zIndex: 2,
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
        }}>
          <span style={{ fontSize: '8px', color: '#1e293b', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '2px', whiteSpace: 'nowrap' }}>
            <span role="img" aria-label="calendar" style={{ fontSize: '8.5px' }}>🗓️</span>
            <span>{dateFormatted}</span>
          </span>

          <span style={{ color: 'rgba(203, 213, 225, 0.8)', margin: '0 2px', fontSize: '8px' }}>|</span>

          <span style={{ fontSize: '8px', color: '#475569', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '2px', whiteSpace: 'nowrap' }}>
            <span>{isEn ? 'Left:' : 'বাকি:'}</span>
            <span style={{ color: '#d97706', fontWeight: 800 }}>
              {countdownStr || (isEn ? '0m 00s' : '০মি: ০০সে:')}
            </span>
          </span>
        </div>

        {/* Exam Title */}
        <h3 style={{
          fontSize: '11.5px',
          fontWeight: 800,
          color: '#0f172a',
          margin: '0 0 5px 0',
          lineHeight: '1.25',
          fontFamily: '"Hind Siliguri", "Poppins", sans-serif',
          position: 'relative',
          zIndex: 2,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {title}
        </h3>

        {/* Subjects & Topics Container */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.9)',
          borderRadius: '8px',
          padding: '5px 6px',
          marginBottom: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          position: 'relative',
          zIndex: 2
        }}>
          {(() => {
            const activeSubjectTopics = (exam.subjectTopics && exam.subjectTopics.length > 0)
              ? exam.subjectTopics
              : (Array.isArray(exam.subjects) && exam.subjects.length > 0 ? exam.subjects : null);

            if (activeSubjectTopics) {
              const displayedSubjects = activeSubjectTopics.slice(0, 2);
              const remainingSubjectsCount = activeSubjectTopics.length - displayedSubjects.length;

              return (
                <>
                  {displayedSubjects.map((st, idx) => {
                    const subjText = safeStringify(isEn ? (st.subjectEn || st.subject) : st.subject, 'General');
                    const rawTopics = isEn ? (st.topicsEn || st.topics) : st.topics;
                    const topicsList = Array.isArray(rawTopics)
                      ? rawTopics.map(t => safeStringify(t))
                      : safeStringify(rawTopics).split(',').map(t => t.trim()).filter(Boolean);

                    const displayedTopics = topicsList.slice(0, 3);
                    const remainingTopicsCount = topicsList.length - displayedTopics.length;

                    return (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{
                          fontSize: '8.5px',
                          color: '#2563eb',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.2px',
                          borderLeft: '2px solid #2563eb',
                          paddingLeft: '4px',
                          lineHeight: '1.2'
                        }}>
                          {subjText}
                        </span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', paddingLeft: '1px' }}>
                          {displayedTopics.map((t, tIdx) => (
                            <span key={tIdx} style={{
                              fontSize: '8px',
                              fontWeight: 700,
                              background: '#ffffff',
                              border: '1px solid rgba(226, 232, 240, 0.8)',
                              color: '#1e293b',
                              padding: '1.5px 5px',
                              borderRadius: '4px',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                              whiteSpace: 'nowrap'
                            }}>
                              {t}
                            </span>
                          ))}
                          {remainingTopicsCount > 0 && (
                            <span style={{
                              fontSize: '7.5px',
                              fontWeight: 800,
                              background: '#eff6ff',
                              border: '1px solid #bfdbfe',
                              color: '#2563eb',
                              padding: '1.5px 4px',
                              borderRadius: '4px',
                              whiteSpace: 'nowrap'
                            }}>
                              +{remainingTopicsCount}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {remainingSubjectsCount > 0 && (
                    <span style={{
                      fontSize: '7.5px',
                      color: '#64748b',
                      fontWeight: 700,
                      paddingLeft: '4px'
                    }}>
                      +{remainingSubjectsCount} {isEn ? 'more subject' : 'টি বিষয়'}
                    </span>
                  )}
                </>
              );
            }

            // Default Subjects Fallback
            const subjName = safeStringify(isEn ? (exam.subjectsEn || exam.subjects || 'General') : (exam.subjects || 'BCS EXAM'));
            const topicsArr = (Array.isArray(isEn ? (exam.topicsEn || exam.topics) : exam.topics)
              ? (isEn ? (exam.topicsEn || exam.topics) : exam.topics)
              : safeStringify(isEn ? (exam.topicsEn || exam.topics) : exam.topics).split(',').map(t => t.trim()).filter(Boolean)
            );
            const displayedFallbackTopics = topicsArr.slice(0, 3);
            const remainingFallbackTopics = topicsArr.length - displayedFallbackTopics.length;

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{
                  fontSize: '8.5px',
                  color: '#2563eb',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.2px',
                  borderLeft: '2px solid #2563eb',
                  paddingLeft: '4px',
                  lineHeight: '1.2'
                }}>
                  {subjName}
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                  {displayedFallbackTopics.map((t, idx) => (
                    <span key={idx} style={{
                      fontSize: '8px',
                      fontWeight: 700,
                      background: '#ffffff',
                      border: '1px solid rgba(226, 232, 240, 0.8)',
                      color: '#1e293b',
                      padding: '1.5px 5px',
                      borderRadius: '4px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                      whiteSpace: 'nowrap'
                    }}>
                      {t}
                    </span>
                  ))}
                  {remainingFallbackTopics > 0 && (
                    <span style={{
                      fontSize: '7.5px',
                      fontWeight: 800,
                      background: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      color: '#2563eb',
                      padding: '1.5px 4px',
                      borderRadius: '4px',
                      whiteSpace: 'nowrap'
                    }}>
                      +{remainingFallbackTopics}
                    </span>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Action Button Row */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'auto', position: 'relative', zIndex: 2 }}>
        {status === 'upcoming' && (
          <button
            onClick={() => onRegister && onRegister(exam.id)}
            style={{
              width: '100%',
              padding: '6px 10px',
              borderRadius: '16px',
              border: isRegistered ? '1px solid #10b981' : 'none',
              background: isRegistered ? '#ecfdf5' : 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)',
              color: isRegistered ? '#065f46' : '#ffffff',
              fontWeight: 800,
              fontSize: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              boxShadow: isRegistered ? 'none' : '0 3px 8px rgba(37, 99, 235, 0.3)',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            {isRegistered ? (
              <>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>{isEn ? 'Enrolled' : 'অংশগ্রহণ করছেন'}</span>
              </>
            ) : (
              <>
                <span role="img" aria-label="star" style={{ fontSize: '11px' }}>⭐</span>
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
              padding: '6px 10px',
              borderRadius: '16px',
              border: 'none',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              boxShadow: '0 3px 8px rgba(239, 68, 68, 0.3)',
              whiteSpace: 'nowrap'
            }}
          >
            <span role="img" aria-label="fire" style={{ fontSize: '11px' }}>⚡</span>
            <span>{isEn ? 'Enter Exam' : 'পরীক্ষায় অংশ নিন'}</span>
          </button>
        )}

        {status === 'completed' && (
          <button
            onClick={() => onViewResult && onViewResult(exam.id)}
            style={{
              width: '100%',
              padding: '6px 10px',
              borderRadius: '16px',
              border: 'none',
              background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              boxShadow: '0 3px 8px rgba(37, 99, 235, 0.3)',
              whiteSpace: 'nowrap'
            }}
          >
            <span role="img" aria-label="trophy" style={{ fontSize: '11px' }}>🏆</span>
            <span>
              {result
                ? (isEn ? `Score: ${result.score}/${result.total}` : `ফলাফল (${toBengaliNumber(result.score)}/${toBengaliNumber(result.total)})`)
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
