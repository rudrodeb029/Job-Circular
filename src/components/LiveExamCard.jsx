import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { stripHtmlTags } from '../utils/textUtils';
import { useBackInterceptor } from '../utils/backButtonManager';
import { useAppContext } from '../context/AppContext';

/**
 * 1:1 Pixel-Perfect Live Exam & History Card Component
 * Designed matching Image 2: soft blue glass gradient backdrop, organic wave SVG, 
 * gold/cyan header badges, scheduled date & remaining time bar, subject topic pills, 
 * and pill action button with star icon.
 */
function LiveExamCard({
  exam,
  status = 'upcoming', // 'upcoming' | 'running' | 'completed'
  isHistory = false,
  startMs = null,
  countdownStr = '',
  isRegistered = false,
  isUnlocked = false,
  pointCost = 20,
  userPoints = 0,
  result = null,
  onRegister,
  onEnter,
  onViewResult,
  isEn = false
}) {
  const { state: appState } = useAppContext();
  const isDark = appState?.theme === 'dark';
  const [showSyllabusModal, setShowSyllabusModal] = useState(false);
  const canAfford = isUnlocked || isRegistered || pointCost <= 0 || userPoints >= pointCost;

  // Close syllabus modal on Android hardware & gesture back button press
  useBackInterceptor(() => {
    setShowSyllabusModal(false);
    return true;
  }, showSyllabusModal);

  if (!exam) return null;

  const isHistorySection = isHistory || status === 'completed';

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
        padding: '10px 8px 10px 8px',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        boxSizing: 'border-box'
      }}
      className="live-exam-card live-exam-card-hover"
    >
      {/* Top Left Organic Wave SVG Blob Accent */}
      <svg
        style={{ position: 'absolute', top: '-10px', left: '-10px', width: '80px', height: '65px', opacity: isDark ? 0.08 : 0.15, pointerEvents: 'none' }}
        viewBox="0 0 120 100"
        fill="none"
      >
        <path d="M0 0 C40 10 90 40 100 80 C80 90 20 100 0 70 Z" fill="#2563eb" />
      </svg>

      <div>
        {/* Exam Title */}
        <h3 style={{
          fontSize: '11.5px',
          fontWeight: 800,
          color: isDark ? '#f8fafc' : '#0f172a',
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

        {/* Row 2: Scheduled Date & Countdown Bar */}
        <div style={{
          background: isDark ? 'rgba(30, 41, 59, 0.75)' : 'rgba(255, 255, 255, 0.96)',
          borderRadius: '5px',
          padding: '2px 5px',
          marginBottom: '5px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isHistorySection ? 'flex-start' : 'space-between',
          flexWrap: 'wrap',
          gap: '2px',
          position: 'relative',
          zIndex: 2,
          boxShadow: isDark ? 'inset 0 1px 1px rgba(255, 255, 255, 0.06)' : 'inset 0 1px 1.5px #ffffff, 0 1px 2px rgba(0,0,0,0.02)',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(226, 232, 240, 0.8)'
        }}>
          <span style={{ fontSize: '6.8px', color: isDark ? '#e2e8f0' : '#1e293b', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '2px', whiteSpace: 'nowrap' }}>
            <span role="img" aria-label="calendar" style={{ fontSize: '7px' }}>🗓️</span>
            <span>{dateFormatted}</span>
          </span>

          {!isHistorySection && countdownStr && (
            <>
              <span style={{ color: isDark ? 'rgba(148, 163, 184, 0.4)' : 'rgba(203, 213, 225, 0.8)', margin: '0 1px', fontSize: '6.8px' }}>|</span>

              <span style={{ fontSize: '6.8px', color: isDark ? '#94a3b8' : '#475569', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '2px', whiteSpace: 'nowrap' }}>
                <span>{isEn ? 'Left:' : 'বাকি:'}</span>
                <span style={{ color: isDark ? '#fbbf24' : '#d97706', fontWeight: 800 }}>
                  {countdownStr}
                </span>
              </span>
            </>
          )}
        </div>

        {/* Row 2.5: Live Exam Points Requirement & Status Bar */}
        {!isHistorySection && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '4px',
            background: (isUnlocked || isRegistered)
              ? (isDark ? 'rgba(16, 185, 129, 0.16)' : '#ecfdf5')
              : canAfford
                ? (isDark ? 'rgba(245, 158, 11, 0.14)' : '#fffbeb')
                : (isDark ? 'rgba(239, 68, 68, 0.16)' : '#fef2f2'),
            border: (isUnlocked || isRegistered)
              ? (isDark ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid #a7f3d0')
              : canAfford
                ? (isDark ? '1px solid rgba(245, 158, 11, 0.32)' : '1px solid #fde68a')
                : (isDark ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid #fecaca'),
            borderRadius: '5px',
            padding: '2px 5px',
            marginBottom: '5px',
            position: 'relative',
            zIndex: 2
          }}>
            <span style={{
              fontSize: '6.8px',
              fontWeight: 800,
              color: (isUnlocked || isRegistered)
                ? (isDark ? '#34d399' : '#059669')
                : canAfford
                  ? (isDark ? '#fbbf24' : '#b45309')
                  : (isDark ? '#f87171' : '#dc2626'),
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2.5px',
              whiteSpace: 'nowrap'
            }}>
              <span>{(isUnlocked || isRegistered) ? '✅' : canAfford ? '⭐' : '🔒'}</span>
              <span>
                {pointCost <= 0
                  ? (isEn ? 'Free Entry' : 'ফ্রি এন্ট্রি')
                  : (isUnlocked || isRegistered)
                    ? (isEn ? `Unlocked (${pointCost} Pts)` : `আনলকড (${toBengaliNumber(pointCost)} পয়েন্ট)`)
                    : (isEn ? `Entry: ${pointCost} Points` : `এন্ট্রি: ${toBengaliNumber(pointCost)} পয়েন্ট`)}
              </span>
            </span>

            {!(isUnlocked || isRegistered) && pointCost > 0 && (
              <span style={{
                fontSize: '6.3px',
                fontWeight: 700,
                color: canAfford
                  ? (isDark ? '#34d399' : '#059669')
                  : (isDark ? '#fca5a5' : '#e11d48'),
                whiteSpace: 'nowrap'
              }}>
                {canAfford
                  ? (isEn ? 'Ready' : 'পর্যাপ্ত পয়েন্ট আছে')
                  : (isEn ? `Need +${pointCost - userPoints}` : `আরও ${toBengaliNumber(pointCost - userPoints)} প্রয়োজন`)}
              </span>
            )}
          </div>
        )}

        {/* Subjects & Topics Container */}
        <div
          onClick={() => setShowSyllabusModal(true)}
          style={{
            background: isDark ? 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)' : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(226, 232, 240, 0.85)',
            boxShadow: isDark ? 'inset 0 1px 1.5px rgba(255, 255, 255, 0.06), 0 2px 5px rgba(0, 0, 0, 0.2)' : 'inset 0 1px 2px #ffffff, inset 0 -1px 2px rgba(30, 64, 175, 0.02)',
            borderRadius: '8px',
            padding: '5px 6px',
            marginBottom: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            position: 'relative',
            zIndex: 2,
            cursor: 'pointer'
          }}
          title={isEn ? "Tap to view full syllabus" : "সিলেবাস দেখতে ট্যাপ করুন"}
        >
          {(() => {
            const activeSubjectTopics = (exam.subjectTopics && exam.subjectTopics.length > 0)
              ? exam.subjectTopics
              : (Array.isArray(exam.subjects) && exam.subjects.length > 0 ? exam.subjects : null);

            if (activeSubjectTopics) {
              return activeSubjectTopics.map((st, idx) => {
                const rawSubj = isEn ? (st.subjectEn || st.subject) : st.subject;
                const subjText = stripHtmlTags(safeStringify(rawSubj, 'General')).trim() || 'General';
                const rawTopics = isEn ? (st.topicsEn || st.topics) : st.topics;
                const cleanTopicItem = (t) => stripHtmlTags(safeStringify(t)).trim();
                const topicsList = (Array.isArray(rawTopics)
                  ? rawTopics.map(cleanTopicItem)
                  : safeStringify(rawTopics).split(',').map(cleanTopicItem)
                ).filter(t => t && t !== '&nbsp;');

                const { visible: displayedTopics, remaining: remainingTopicsCount } = calculateVisibleTopics(topicsList, 4);

                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '3px', width: '100%', overflow: 'hidden' }}>
                    <span style={{
                      display: 'block',
                      width: '100%',
                      fontSize: '8.5px',
                      color: isDark ? '#60a5fa' : '#2563eb',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.2px',
                      borderBottom: isDark ? '1px solid rgba(96, 165, 250, 0.22)' : '1px solid rgba(37, 99, 235, 0.16)',
                      paddingBottom: '2px',
                      lineHeight: '1.2',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      boxSizing: 'border-box'
                    }}>
                      {subjText}
                    </span>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      flexWrap: 'nowrap',
                      gap: '2.5px',
                      width: '100%',
                      overflow: 'hidden'
                    }}>
                      {displayedTopics.map((t, tIdx) => (
                        <span key={tIdx} style={{
                          fontSize: '5.8px',
                          fontWeight: 600,
                          background: isDark ? 'rgba(30, 41, 59, 0.95)' : '#ffffff',
                          border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(226, 232, 240, 0.8)',
                          color: isDark ? '#f1f5f9' : '#1e293b',
                          padding: '1px 3.5px',
                          borderRadius: '3px',
                          boxShadow: isDark ? '0 1px 2px rgba(0,0,0,0.2)' : '0 1px 2px rgba(0,0,0,0.02)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          minWidth: 0,
                          flexShrink: 1
                        }}>
                          {t}
                        </span>
                      ))}
                      {remainingTopicsCount > 0 && (
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowSyllabusModal(true);
                          }}
                          style={{
                            fontSize: '5.8px',
                            fontWeight: 700,
                            background: isDark ? 'rgba(37, 99, 235, 0.25)' : '#eff6ff',
                            border: isDark ? '1px solid rgba(96, 165, 250, 0.4)' : '1px solid #bfdbfe',
                            color: isDark ? '#93c5fd' : '#2563eb',
                            padding: '1px 3.5px',
                            borderRadius: '3px',
                            whiteSpace: 'nowrap',
                            cursor: 'pointer',
                            boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(37,99,235,0.1)',
                            flexShrink: 0
                          }}
                          title={isEn ? "View all topics" : "সকল টপিক দেখুন"}
                        >
                          +{remainingTopicsCount}
                        </span>
                      )}
                    </div>
                  </div>
                );
              });
            }

            // Default Subjects Fallback
            const rawSubj = isEn ? (exam.subjectsEn || exam.subjects || 'General') : (exam.subjects || 'BCS EXAM');
            const subjName = stripHtmlTags(safeStringify(rawSubj, 'General')).trim() || 'General';
            const cleanTopicItem = (t) => stripHtmlTags(safeStringify(t)).trim();
            const topicsArr = (Array.isArray(isEn ? (exam.topicsEn || exam.topics) : exam.topics)
              ? (isEn ? (exam.topicsEn || exam.topics) : exam.topics).map(cleanTopicItem)
              : safeStringify(isEn ? (exam.topicsEn || exam.topics) : exam.topics).split(',').map(cleanTopicItem)
            ).filter(t => t && t !== '&nbsp;');
            const { visible: displayedFallbackTopics, remaining: remainingFallbackTopics } = calculateVisibleTopics(topicsArr, 4);

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', width: '100%', overflow: 'hidden' }}>
                <span style={{
                  display: 'block',
                  width: '100%',
                  fontSize: '8.5px',
                  color: isDark ? '#60a5fa' : '#2563eb',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.2px',
                  borderBottom: isDark ? '1px solid rgba(96, 165, 250, 0.22)' : '1px solid rgba(37, 99, 235, 0.16)',
                  paddingBottom: '2px',
                  lineHeight: '1.2',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  boxSizing: 'border-box'
                }}>
                  {subjName}
                </span>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'nowrap',
                  gap: '2.5px',
                  width: '100%',
                  overflow: 'hidden'
                }}>
                  {displayedFallbackTopics.map((t, idx) => (
                    <span key={idx} style={{
                      fontSize: '5.8px',
                      fontWeight: 600,
                      background: isDark ? 'rgba(30, 41, 59, 0.95)' : '#ffffff',
                      border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(226, 232, 240, 0.8)',
                      color: isDark ? '#f1f5f9' : '#1e293b',
                      padding: '1px 3.5px',
                      borderRadius: '3px',
                      boxShadow: isDark ? '0 1px 2px rgba(0,0,0,0.2)' : '0 1px 2px rgba(0,0,0,0.02)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      minWidth: 0,
                      flexShrink: 1
                    }}>
                      {t}
                    </span>
                  ))}
                  {remainingFallbackTopics > 0 && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowSyllabusModal(true);
                      }}
                      style={{
                        fontSize: '5.8px',
                        fontWeight: 700,
                        background: isDark ? 'rgba(37, 99, 235, 0.25)' : '#eff6ff',
                        border: isDark ? '1px solid rgba(96, 165, 250, 0.4)' : '1px solid #bfdbfe',
                        color: isDark ? '#93c5fd' : '#2563eb',
                        padding: '1px 3.5px',
                        borderRadius: '3px',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                        boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(37,99,235,0.1)',
                        flexShrink: 0
                      }}
                      title={isEn ? "View all topics" : "সকল টপিক দেখুন"}
                    >
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
              padding: '3px 6px',
              borderRadius: '5px',
              border: (isRegistered || isUnlocked)
                ? (isDark ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid #a7f3d0')
                : !canAfford
                  ? (isDark ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid #fde68a')
                  : (isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(226, 232, 240, 0.8)'),
              background: (isRegistered || isUnlocked)
                ? (isDark ? 'rgba(5, 150, 105, 0.25)' : '#ecfdf5')
                : !canAfford
                  ? (isDark ? 'rgba(217, 119, 6, 0.22)' : '#fffbeb')
                  : (isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.96)'),
              color: (isRegistered || isUnlocked)
                ? (isDark ? '#34d399' : '#059669')
                : !canAfford
                  ? (isDark ? '#fbbf24' : '#b45309')
                  : (isDark ? '#60a5fa' : '#2563eb'),
              fontWeight: 800,
              fontSize: '8.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.3)' : 'inset 0 1px 1.5px #ffffff, 0 1px 2px rgba(0,0,0,0.02)',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap'
            }}
          >
            {(isRegistered || isUnlocked) ? (
              <>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>{isEn ? 'Enrolled' : 'অংশগ্রহণ করছেন'}</span>
              </>
            ) : !canAfford ? (
              <>
                <span role="img" aria-label="lock" style={{ fontSize: '8.5px' }}>🔒</span>
                <span>{isEn ? `Need ${pointCost} Pts (Watch Ad)` : `${toBengaliNumber(pointCost)} পয়েন্ট প্রয়োজন`}</span>
              </>
            ) : (
              <>
                <span role="img" aria-label="star" style={{ fontSize: '9px' }}>⭐</span>
                <span>
                  {pointCost > 0
                    ? (isEn ? `Participate (${pointCost} Pts)` : `অংশগ্রহণ (${toBengaliNumber(pointCost)} পয়েন্ট)`)
                    : (isEn ? 'Participate' : 'অংশগ্রহণ করুন')}
                </span>
              </>
            )}
          </button>
        )}

        {status === 'running' && (
          <button
            onClick={() => onEnter && onEnter(exam.id)}
            style={{
              width: '100%',
              padding: '3px 6px',
              borderRadius: '5px',
              border: !canAfford
                ? (isDark ? '1px solid rgba(245, 158, 11, 0.45)' : '1px solid #fde68a')
                : (isDark ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(226, 232, 240, 0.8)'),
              background: !canAfford
                ? (isDark ? 'rgba(217, 119, 6, 0.24)' : '#fffbeb')
                : (isDark ? 'rgba(220, 38, 38, 0.25)' : 'rgba(255, 255, 255, 0.96)'),
              color: !canAfford
                ? (isDark ? '#fbbf24' : '#b45309')
                : (isDark ? '#f87171' : '#dc2626'),
              fontWeight: 800,
              fontSize: '8.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.3)' : 'inset 0 1px 1.5px #ffffff, 0 1px 2px rgba(0,0,0,0.02)',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap'
            }}
          >
            {!canAfford ? (
              <>
                <span role="img" aria-label="lock" style={{ fontSize: '8.5px' }}>🔒</span>
                <span>{isEn ? `Need ${pointCost} Pts` : `${toBengaliNumber(pointCost)} পয়েন্ট প্রয়োজন`}</span>
              </>
            ) : (
              <>
                <span role="img" aria-label="fire" style={{ fontSize: '9px' }}>⚡</span>
                <span>
                  {(isUnlocked || isRegistered || pointCost <= 0)
                    ? (isEn ? 'Enter Exam' : 'পরীক্ষায় অংশ নিন')
                    : (isEn ? `Enter (${pointCost} Pts)` : `অংশ নিন (${toBengaliNumber(pointCost)} পয়েন্ট)`)}
                </span>
              </>
            )}
          </button>
        )}

        {status === 'completed' && (
          <button
            onClick={() => onViewResult && onViewResult(exam.id)}
            style={{
              width: '100%',
              padding: '3px 6px',
              borderRadius: '5px',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(226, 232, 240, 0.8)',
              background: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.96)',
              color: isDark ? '#f1f5f9' : '#1e293b',
              boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.3)' : 'inset 0 1px 1.5px #ffffff, 0 1px 2px rgba(0,0,0,0.02)',
              fontWeight: 800,
              fontSize: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            <span role="img" aria-label="trophy" style={{ fontSize: '8.5px' }}>🏆</span>
            <span>
              {result
                ? (isEn ? `Score: ${result.score}/${result.total}` : `ফলাফল (${toBengaliNumber(result.score)}/${toBengaliNumber(result.total)})`)
                : (isEn ? 'View Solutions' : 'সমাধান ও ফলাফল')}
            </span>
          </button>
        )}
      </div>

      {/* Complete Exam Syllabus / Subjects Modal */}
      {showSyllabusModal && typeof document !== 'undefined' && createPortal(
        <div
          onClick={() => setShowSyllabusModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: isDark ? 'rgba(0, 0, 0, 0.75)' : 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(5px)',
            WebkitBackdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '16px',
            boxSizing: 'border-box'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: isDark ? '#0f172a' : 'var(--white, #ffffff)',
              color: isDark ? '#f8fafc' : 'var(--text-primary, #0f172a)',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '380px',
              maxHeight: '82vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: isDark ? '0 20px 30px -10px rgba(0, 0, 0, 0.6)' : '0 20px 30px -10px rgba(0, 0, 0, 0.25)',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid var(--border, #e2e8f0)',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: '14px 16px',
              borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid var(--border-light, #f1f5f9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: isDark ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' : 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  color: '#ffffff',
                  boxShadow: '0 4px 10px rgba(37, 99, 235, 0.25)'
                }}>
                  📚
                </div>
                <div>
                  <h3 style={{
                    margin: 0,
                    fontSize: '14px',
                    fontWeight: 800,
                    color: isDark ? '#f8fafc' : '#0f172a',
                    lineHeight: 1.25,
                    fontFamily: '"Hind Siliguri", "Poppins", sans-serif'
                  }}>
                    {title}
                  </h3>
                  <span style={{ fontSize: '11px', color: isDark ? '#60a5fa' : '#2563eb', fontWeight: 700 }}>
                    {isEn ? 'Exam Syllabus & Topics' : 'সিলেবাস ও বিষয়ভিত্তিক টপিক'}
                  </span>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowSyllabusModal(false)}
                style={{
                  background: isDark ? 'rgba(30, 41, 59, 0.9)' : '#ffffff',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(203, 213, 225, 0.8)',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: isDark ? '#e2e8f0' : '#64748b',
                  fontSize: '14px',
                  fontWeight: 700,
                  boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{
              padding: '16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              flex: 1
            }}>
              {(() => {
                const activeSubjectTopics = (exam.subjectTopics && exam.subjectTopics.length > 0)
                  ? exam.subjectTopics
                  : (Array.isArray(exam.subjects) && exam.subjects.length > 0 ? exam.subjects : null);

                if (activeSubjectTopics) {
                  return activeSubjectTopics.map((st, idx) => {
                    const rawSubj = isEn ? (st.subjectEn || st.subject) : st.subject;
                    const subjText = stripHtmlTags(safeStringify(rawSubj, 'General')).trim() || 'General';
                    const rawTopics = isEn ? (st.topicsEn || st.topics) : st.topics;
                    const cleanTopicItem = (t) => stripHtmlTags(safeStringify(t)).trim();
                    const topicsList = (Array.isArray(rawTopics)
                      ? rawTopics.map(cleanTopicItem)
                      : safeStringify(rawTopics).split(',').map(cleanTopicItem)
                    ).filter(t => t && t !== '&nbsp;');

                    return (
                      <div
                        key={idx}
                        style={{
                          background: isDark ? 'rgba(30, 41, 59, 0.5)' : 'var(--bg-secondary, #f8fafc)',
                          border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid var(--border, #e2e8f0)',
                          borderRadius: '12px',
                          padding: '10px 12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingBottom: '6px',
                          borderBottom: isDark ? '1px solid rgba(96, 165, 250, 0.2)' : '1px solid rgba(37, 99, 235, 0.14)'
                        }}>
                          <span style={{
                            fontSize: '12px',
                            color: isDark ? '#60a5fa' : '#2563eb',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.3px'
                          }}>
                            {subjText}
                          </span>
                          <span style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            color: isDark ? '#94a3b8' : '#64748b',
                            background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(100, 116, 139, 0.1)',
                            padding: '2px 7px',
                            borderRadius: '10px'
                          }}>
                            {topicsList.length} {isEn ? 'topics' : 'টি টপিক'}
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {topicsList.map((t, tIdx) => (
                            <span
                              key={tIdx}
                              style={{
                                fontSize: '11px',
                                fontWeight: 600,
                                background: isDark ? '#1e293b' : 'var(--white, #ffffff)',
                                border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid var(--border-light, #e2e8f0)',
                                color: isDark ? '#f1f5f9' : 'var(--text-primary, #1e293b)',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                boxShadow: isDark ? '0 1px 2px rgba(0,0,0,0.2)' : '0 1px 2px rgba(0,0,0,0.03)'
                              }}
                            >
                              {t}
                            </span>
                          ))}
                          {topicsList.length === 0 && (
                            <span style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>
                              {isEn ? 'No topics specified' : 'কোনো টপিক নেই'}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  });
                }

                // Default Subject Fallback
                const rawSubj = isEn ? (exam.subjectsEn || exam.subjects || 'General') : (exam.subjects || 'BCS EXAM');
                const subjName = stripHtmlTags(safeStringify(rawSubj, 'General')).trim() || 'General';
                const cleanTopicItem = (t) => stripHtmlTags(safeStringify(t)).trim();
                const topicsArr = (Array.isArray(isEn ? (exam.topicsEn || exam.topics) : exam.topics)
                  ? (isEn ? (exam.topicsEn || exam.topics) : exam.topics).map(cleanTopicItem)
                  : safeStringify(isEn ? (exam.topicsEn || exam.topics) : exam.topics).split(',').map(cleanTopicItem)
                ).filter(t => t && t !== '&nbsp;');

                return (
                  <div
                    style={{
                      background: isDark ? 'rgba(30, 41, 59, 0.5)' : 'var(--bg-secondary, #f8fafc)',
                      border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid var(--border, #e2e8f0)',
                      borderRadius: '12px',
                      padding: '10px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{
                        fontSize: '12px',
                        color: isDark ? '#60a5fa' : '#2563eb',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.3px'
                      }}>
                        {subjName}
                      </span>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        color: isDark ? '#94a3b8' : '#64748b',
                        background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(100, 116, 139, 0.1)',
                        padding: '2px 7px',
                        borderRadius: '10px'
                      }}>
                        {topicsArr.length} {isEn ? 'topics' : 'টি টপিক'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {topicsArr.map((t, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            background: 'var(--white, #ffffff)',
                            border: '1px solid var(--border-light, #e2e8f0)',
                            color: 'var(--text-primary, #1e293b)',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '12px 16px',
              borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid var(--border-light, #f1f5f9)',
              background: isDark ? 'rgba(15, 23, 42, 0.85)' : 'var(--bg-secondary, #f8fafc)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: '11px', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }}>
                ⏱️ {durationText}
              </span>
              <button
                type="button"
                onClick={() => setShowSyllabusModal(false)}
                style={{
                  background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '7px 20px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
                }}
              >
                {isEn ? 'Close' : 'ঠিক আছে'}
              </button>
            </div>
          </div>
        </div>,
        document.body
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
  }
  return fallback;
};

const toBengaliNumber = (num) => {
  if (num === undefined || num === null) return '';
  const engNum = safeStringify(num);
  const bengaliDigits = {'0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'};
  return engNum.split('').map(digit => bengaliDigits[digit] || digit).join('');
};

const calculateVisibleTopics = (topicsList, maxTopics = 4) => {
  if (!topicsList || topicsList.length === 0) return { visible: [], remaining: 0 };
  if (topicsList.length <= maxTopics) {
    return { visible: topicsList, remaining: 0 };
  }
  return {
    visible: topicsList.slice(0, maxTopics),
    remaining: topicsList.length - maxTopics
  };
};

export default React.memo(LiveExamCard);
