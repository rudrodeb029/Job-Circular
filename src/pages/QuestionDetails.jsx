import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock } from '../components/Icons';
import { useAppContext } from '../context/AppContext';
import { useAdminContext } from '../context/AdminContext';
import { getQuestionById } from '../data/questionsData';
import ModernLoader, { ModernPageSkeleton } from '../components/ModernLoader';
import { supabase } from '../services/supabaseClient';
import { normalizeDoc } from '../services/supabaseService';
import { stripHtmlTags, cleanOptionText, sanitizeQuestionHtml } from '../utils/textUtils';
import { preloadInterstitialAd, navigateWithAdOnReturn } from '../utils/admobUtils';
import useProgressiveList from '../hooks/useProgressiveList';

export default function QuestionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { state } = useAppContext();
  const { state: adminState, dispatch: adminDispatch } = useAdminContext();
  const isEn = state.language === 'en';
  const isDark = state.theme === 'dark';

  const handleBack = () => {
    const hasHistory = window.history.state && typeof window.history.state.idx === 'number' && window.history.state.idx > 0;
    const attemptedCount = Object.keys(selectedAnswers || {}).length;
    // If user attempted/read 3+ questions in practice mode, give appropriate action weight towards 4-action threshold
    const actionWeight = attemptedCount >= 3 ? attemptedCount : 1;
    navigateWithAdOnReturn(navigate, hasHistory ? -1 : '/questions-hub', false, isEn, actionWeight);
  };

  const [pageLoading, setPageLoading] = useState(true);
  const [isSwitchingMode, setIsSwitchingMode] = useState(false);
  const [paper, setPaper] = useState(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  useEffect(() => {
    preloadInterstitialAd();
  }, []);

  useEffect(() => {
    // 1. Check if we have it in adminState.questions and it has questions
    const fromContext = (adminState?.questions || []).find(q => String(q.id) === String(id));
    if (fromContext && Array.isArray(fromContext.questions) && fromContext.questions.length > 0) {
      setPaper(fromContext);
      setPageLoading(false);
      return;
    }

    // 2. Fallback to questionsData lookup
    const staticPaper = getQuestionById(id);
    if (staticPaper && Array.isArray(staticPaper.questions) && staticPaper.questions.length > 0) {
      setPaper(staticPaper);
      setPageLoading(false);
      return;
    }

    // 3. Otherwise query the full row from Supabase
    const fetchFullPaper = async () => {
      setLoadingQuestions(true);
      try {
        const { data, error } = await supabase
          .from('questions')
          .select('*')
          .eq('id', id)
          .setHeader('Cache-Control', 'no-cache')
          .single();

        if (error) throw error;
        if (data) {
          const normalized = normalizeDoc(data);
          setPaper(normalized);
          adminDispatch({ type: 'CACHE_FULL_QUESTION_PAPER', payload: normalized });
        }
      } catch (err) {
        console.error('Error fetching full paper questions:', err);
      } finally {
        setLoadingQuestions(false);
        setPageLoading(false);
      }
    };

    fetchFullPaper();
  }, [id, adminState?.questions]);

  // 'practice' or 'read'
  const [mode, setMode] = useState('practice');
  // Tracks selected answers for each question: { [questionId]: optionIndex }
  const [selectedAnswers, setSelectedAnswers] = useState({});

  // Calculate score safely at top-level
  const score = useMemo(() => {
    if (!paper || !Array.isArray(paper.questions)) return 0;
    let correct = 0;
    paper.questions.forEach(q => {
      if (typeof q.correctIndex === "number" && q.correctIndex >= 0 && q.correctIndex < 4 && selectedAnswers[q.id] === q.correctIndex) {
        correct += 1;
      }
    });
    return correct;
  }, [paper, selectedAnswers]);

  const handleModeChange = (newMode) => {
    if (newMode === mode) return;
    setIsSwitchingMode(true);
    setMode(newMode);
    setTimeout(() => {
      setIsSwitchingMode(false);
    }, 180);
  };

  const handleOptionClick = useCallback((questionId, index) => {
    if (mode !== 'practice') return;
    // Don't allow changing answer once selected in practice mode
    setSelectedAnswers(prev => {
      if (prev[questionId] !== undefined) return prev;
      return {
        ...prev,
        [questionId]: index
      };
    });
  }, [mode]);

  // Progressive rendering: keeps DOM small on frame 0 and pre-warms in background frames
  const totalQuestionsCount = Array.isArray(paper?.questions) ? paper.questions.length : 0;
  const { count: visibleCount, hasMore, sentinelRef } = useProgressiveList(totalQuestionsCount, { resetKey: paper?.id });

  if (pageLoading) {
    return (
      <div className="page" style={{ paddingBottom: '100px', background: 'var(--bg)' }}>
        <div className="page-header">
          <button type="button" className="back-btn" onClick={handleBack} aria-label="Back">
            <ArrowLeft size={22} />
          </button>
          <h1 style={{ flex: 1, fontSize: '15px', fontWeight: 800 }}>
            {isEn ? 'Questions & Solutions' : 'প্রশ্ন ও সমাধান'}
          </h1>
        </div>
        <div style={{ padding: '80px 20px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '350px' }}>
          <ModernLoader size="lg" icon="📝" />
        </div>
      </div>
    );
  }

  if (!paper) {
    if (adminState?.loading || !adminState?.questions || adminState?.questions?.length === 0) {
      return (
        <div className="page" style={{ paddingBottom: '100px' }}>
          <div className="page-header">
            <button type="button" className="back-btn" onClick={handleBack} aria-label="Back">
              <ArrowLeft size={22} />
            </button>
            <h1 style={{ flex: 1 }}>{isEn ? 'Question Paper' : 'প্রশ্নপত্র'}</h1>
          </div>
          <ModernPageSkeleton type="details" icon="📝" />
        </div>
      );
    }
    return (
      <div className="page" style={{ paddingBottom: '100px' }}>
        <div className="page-header">
          <button type="button" className="back-btn" onClick={handleBack} aria-label="Back">
            <ArrowLeft size={22} />
          </button>
          <h1 style={{ flex: 1 }}>{isEn ? 'Not Found' : 'পাওয়া যায়নি'}</h1>
        </div>
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <p>{isEn ? 'Question paper not found' : 'প্রশ্নপত্র খুঁজে পাওয়া যায়নি'}</p>
        </div>
      </div>
    );
  }

  const handleReset = () => {
    setSelectedAnswers({});
  };

  const attemptedCount = Object.keys(selectedAnswers).length;
  const totalCount = paper && Array.isArray(paper.questions) ? paper.questions.length : 0;

  return (
    <div className="page" style={{ paddingBottom: '100px', background: 'var(--bg)' }}>
      {/* Header */}
      <div className="page-header">
        <button type="button" className="back-btn" onClick={handleBack} aria-label="Back">
          <ArrowLeft size={22} />
        </button>
        <h1 style={{ flex: 1, fontSize: '15px', fontWeight: 800 }}>
          {isEn ? 'Questions & Solutions' : 'প্রশ্ন ও সমাধান'}
        </h1>
      </div>

      <div className="page-content" style={{ padding: '16px' }}>
        {/* Info & Mode Selector Header Card - Tactile Claymorphism Style */}
        <div style={{
          background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
          color: '#ffffff',
          borderRadius: '16px',
          padding: '16px 18px',
          marginBottom: '14px',
          border: '1.2px solid rgba(255, 255, 255, 0.35)',
          boxShadow: '0 10px 25px -4px rgba(26, 86, 219, 0.3), inset 0 2.5px 3.5px rgba(255, 255, 255, 0.35), inset 0 -2.5px 3.5px rgba(10, 37, 107, 0.3)'
        }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', lineHeight: '1.4' }}>
            {isEn ? (paper.titleEn || paper.title) : paper.title}
          </h2>
          <div style={{ display: 'flex', gap: '14px', fontSize: '12px', opacity: 0.92, marginBottom: '14px', flexWrap: 'wrap' }}>
            <span>📅 {isEn ? (paper.dateEn || paper.date) : paper.date}</span>
            <span>📝 {isEn ? `${totalCount} Questions` : `${toBengaliNumber(totalCount)}টি প্রশ্ন`}</span>
            <span>🕒 {isEn ? (paper.timeLimitEn || paper.timeLimit) : paper.timeLimit}</span>
          </div>

          {/* Mode Switcher Buttons - Tactile Claymorphism Style */}
          <div style={{
            display: 'flex',
            background: 'rgba(15, 23, 42, 0.22)',
            padding: '4px',
            borderRadius: '10px',
            gap: '6px',
            boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)'
          }}>
            <button
              onClick={() => handleModeChange('practice')}
              style={{
                flex: 1,
                padding: '8px 10px',
                borderRadius: '8px',
                border: mode === 'practice' ? (isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.95)') : 'none',
                background: mode === 'practice' ? (isDark ? '#1e293b' : 'linear-gradient(145deg, #ffffff 0%, #edf4ff 100%)') : 'transparent',
                color: mode === 'practice' ? (isDark ? '#60a5fa' : '#1d4ed8') : 'rgba(255, 255, 255, 0.9)',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: mode === 'practice' ? (isDark ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 4px 12px rgba(10, 37, 107, 0.2), inset 0 2px 3px #ffffff, inset 0 -1.5px 2px rgba(30, 64, 175, 0.12)') : 'none',
                transition: 'all 0.2s'
              }}
            >
              🎯 {isEn ? 'Practice Mode' : 'অনুশীলন মোড'}
            </button>
            <button
              onClick={() => handleModeChange('read')}
              style={{
                flex: 1,
                padding: '8px 10px',
                borderRadius: '8px',
                border: mode === 'read' ? (isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.95)') : 'none',
                background: mode === 'read' ? (isDark ? '#1e293b' : 'linear-gradient(145deg, #ffffff 0%, #edf4ff 100%)') : 'transparent',
                color: mode === 'read' ? (isDark ? '#60a5fa' : '#1d4ed8') : 'rgba(255, 255, 255, 0.9)',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: mode === 'read' ? (isDark ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 4px 12px rgba(10, 37, 107, 0.2), inset 0 2px 3px #ffffff, inset 0 -1.5px 2px rgba(30, 64, 175, 0.12)') : 'none',
                transition: 'all 0.2s'
              }}
            >
              📖 {isEn ? 'Read Solution' : 'পড়া মোড'}
            </button>
          </div>
        </div>

        {isSwitchingMode ? (
          <div style={{ padding: '80px 20px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '350px' }}>
            <ModernLoader size="md" icon={mode === 'practice' ? '🎯' : '📖'} />
          </div>
        ) : !paper.questions || paper.questions.length === 0 ? (
          <div className="card" style={{ padding: '40px 20px', textAlign: 'center', borderRadius: '10px' }}>
            <span style={{ fontSize: '40px', display: 'block', marginBottom: '12px' }}>📶</span>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
              {isEn ? 'Offline Mode' : 'আপনি অফলাইনে আছেন'}
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
              {isEn 
                ? 'This question paper has not been cached on your device. Please connect to the internet to download it once.' 
                : 'এই প্রশ্নপত্রটি আপনার ডিভাইসে ক্যাশ করা নেই। অনুগ্রহ করে ইন্টারনেট সংযুক্ত করে একবার লোড করুন।'}
            </p>
            <button 
              onClick={() => navigate(-1)} 
              style={{
                padding: '10px 24px',
                borderRadius: '10px',
                background: 'var(--primary)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              {isEn ? 'Go Back' : 'ফিরে যান'}
            </button>
          </div>
        ) : (
          <>
            {/* Score & Progress Tracker Card (Only in Practice Mode) - Tactile Claymorphism Style */}
        {mode === 'practice' && (
          <div style={{
            background: isDark
              ? 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)'
              : 'linear-gradient(145deg, #ffffff 0%, #f8faff 100%)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1.2px solid rgba(255, 255, 255, 0.95)',
            borderRadius: '12px',
            padding: '10px 13px',
            marginBottom: '12px',
            boxShadow: isDark
              ? '0 6px 18px -2px rgba(0, 0, 0, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.06)'
              : '0 6px 18px -2px rgba(30, 64, 175, 0.07), 0 2px 5px -1px rgba(15, 23, 42, 0.03), inset 0 2px 3px #ffffff, inset 0 -2px 3px rgba(30, 64, 175, 0.04)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: isDark ? '#cbd5e1' : 'var(--text-secondary)' }}>
                {isEn ? 'Practice Progress' : 'অনুশীলন অগ্রগতি'}
              </span>
              <span style={{
                fontSize: '10px',
                fontWeight: 800,
                color: isDark ? '#60a5fa' : 'var(--primary)',
                background: isDark ? 'rgba(37, 99, 235, 0.2)' : 'linear-gradient(145deg, #eff6ff 0%, #dbeafe 100%)',
                padding: '2.5px 8px',
                borderRadius: '6px',
                border: isDark ? '1px solid rgba(96, 165, 250, 0.35)' : '1px solid rgba(191, 219, 254, 0.8)',
                boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.3)' : 'inset 0 1px 1.5px #ffffff, inset 0 -1px 1.5px rgba(37, 99, 235, 0.08)'
              }}>
                {isEn 
                  ? `Attempted: ${attemptedCount}/${totalCount} | Score: ${score}`
                  : `উত্তর দিয়েছেন: ${toBengaliNumber(attemptedCount)}/${toBengaliNumber(totalCount)} | স্কোর: ${toBengaliNumber(score)}`}
              </span>
            </div>
            
            {/* Progress Bar */}
            <div style={{ width: '100%', height: '8px', background: isDark ? 'rgba(51, 65, 85, 0.6)' : '#e2e8f0', borderRadius: '6px', overflow: 'hidden', marginBottom: attemptedCount > 0 ? '12px' : '0', boxShadow: isDark ? 'inset 0 1.5px 2px rgba(0, 0, 0, 0.3)' : 'inset 0 1.5px 2px rgba(0, 0, 0, 0.08)' }}>
              <div style={{
                width: `${(attemptedCount / totalCount) * 100}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #2563eb, #3b82f6)',
                borderRadius: '6px',
                boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)',
                transition: 'width 0.3s ease'
              }} />
            </div>

            {attemptedCount > 0 && (
              <button
                onClick={handleReset}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '10px',
                  border: isDark ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid rgba(254, 202, 202, 0.8)',
                  background: isDark ? 'rgba(239, 68, 68, 0.2)' : 'linear-gradient(145deg, #fff5f5 0%, #fee2e2 100%)',
                  color: isDark ? '#f87171' : 'var(--danger)',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: isDark ? '0 2px 6px -1px rgba(0, 0, 0, 0.3)' : '0 2px 6px -1px rgba(239, 68, 68, 0.08), inset 0 1.5px 2px #ffffff, inset 0 -1.5px 2px rgba(239, 68, 68, 0.06)'
                }}
              >
                🔄 {isEn ? 'Reset Answers' : 'আবার শুরু করুন'}
              </button>
            )}
          </div>
        )}

        {/* Questions List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {paper.questions.slice(0, visibleCount).map((qn, qIndex) => (
            <QuestionItemCard
              key={qn.id || `q-${qIndex}`}
              qn={qn}
              qIndex={qIndex}
              isDark={isDark}
              isEn={isEn}
              mode={mode}
              selectedAnswer={selectedAnswers[qn.id]}
              onOptionClick={handleOptionClick}
            />
          ))}
          {hasMore && (
            <div ref={sentinelRef} style={{ height: '1px' }} aria-hidden="true" />
          )}
        </div>
          </>
        )}
      </div>
    </div>
  );
}

// ═══ High-Performance Memoized Question Item Card (Zero Re-render on Sibling Clicks or Progressive Loading) ═══
const QuestionItemCard = React.memo(function QuestionItemCard({
  qn,
  qIndex,
  isDark,
  isEn,
  mode,
  selectedAnswer,
  onOptionClick
}) {
  const hasAnswered = selectedAnswer !== undefined;
  const chosenIndex = selectedAnswer;

  return (
    <div
      style={{
        background: isDark
          ? 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)'
          : 'linear-gradient(145deg, #ffffff 0%, #f9fbfd 100%)',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1.2px solid rgba(255, 255, 255, 0.95)',
        borderRadius: '14px',
        padding: '14px 16px',
        contain: 'layout style',
        boxShadow: isDark
          ? '0 6px 18px -2px rgba(0, 0, 0, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.06)'
          : '0 6px 18px -2px rgba(30, 64, 175, 0.06), 0 2px 5px -1px rgba(15, 23, 42, 0.03), inset 0 2px 3px #ffffff, inset 0 -2px 3px rgba(30, 64, 175, 0.03)'
      }}
    >
      {/* Question Label */}
      <h4 style={{
        fontSize: '12.5px',
        fontWeight: 600,
        color: isDark ? '#f1f5f9' : 'var(--text-secondary)',
        marginBottom: '10px',
        lineHeight: '1.45',
        display: 'flex',
        gap: '8px',
        alignItems: 'baseline'
      }}>
        <span style={{ flexShrink: 0, color: isDark ? '#94a3b8' : 'inherit' }}>{isEn ? `${qIndex + 1}.` : `${toBengaliNumber(qIndex + 1)}.`}</span>
        <QuestionContent content={(isEn && qn.questionEn) ? qn.questionEn : qn.question} style={{ flex: 1, color: isDark ? '#f1f5f9' : 'inherit' }} />
      </h4>

      {/* Option Choices */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {qn.options.map((option, oIndex) => {
          const optText = cleanOptionText((isEn && qn.optionsEn && qn.optionsEn[oIndex]) ? qn.optionsEn[oIndex] : option);

          let bg = isDark ? 'rgba(30, 41, 59, 0.7)' : 'linear-gradient(145deg, #ffffff 0%, #f3f6fa 100%)';
          let color = isDark ? '#e2e8f0' : 'var(--text-primary)';
          let border = isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1.2px solid rgba(255, 255, 255, 0.95)';
          let boxShadow = isDark ? '0 2px 4px rgba(0, 0, 0, 0.2)' : '0 2px 6px -1px rgba(0, 0, 0, 0.04), inset 0 1.5px 2px #ffffff, inset 0 -1.5px 2px rgba(0, 0, 0, 0.03)';
          let prefixIcon = '';

          const bengaliOptionPrefixes = ['ক', 'খ', 'গ', 'ঘ'];
          const englishOptionPrefixes = ['A', 'B', 'C', 'D'];
          const prefix = isEn ? englishOptionPrefixes[oIndex] : bengaliOptionPrefixes[oIndex];

          if (mode === 'read') {
            if (typeof qn.correctIndex === "number" && qn.correctIndex >= 0 && qn.correctIndex < 4 && oIndex === qn.correctIndex) {
              bg = isDark ? 'rgba(16, 185, 129, 0.2)' : 'linear-gradient(145deg, #f0fdf4 0%, #dcfce7 100%)';
              color = isDark ? '#34d399' : '#065f46';
              border = isDark ? '1px solid rgba(16, 185, 129, 0.4)' : '1.2px solid rgba(134, 239, 172, 0.8)';
              boxShadow = isDark ? '0 3px 8px -1px rgba(0, 0, 0, 0.3)' : '0 3px 8px -1px rgba(22, 163, 74, 0.12), inset 0 1.5px 2px #ffffff, inset 0 -1.5px 2px rgba(34, 197, 94, 0.1)';
              prefixIcon = '✅';
            }
          } else if (mode === 'practice' && hasAnswered) {
            if (typeof qn.correctIndex === "number" && qn.correctIndex >= 0 && qn.correctIndex < 4 && oIndex === qn.correctIndex) {
              // Highlight correct answer in green
              bg = isDark ? 'rgba(16, 185, 129, 0.2)' : 'linear-gradient(145deg, #f0fdf4 0%, #dcfce7 100%)';
              color = isDark ? '#34d399' : '#065f46';
              border = isDark ? '1px solid rgba(16, 185, 129, 0.4)' : '1.2px solid rgba(134, 239, 172, 0.8)';
              boxShadow = isDark ? '0 3px 8px -1px rgba(0, 0, 0, 0.3)' : '0 3px 8px -1px rgba(22, 163, 74, 0.12), inset 0 1.5px 2px #ffffff, inset 0 -1.5px 2px rgba(34, 197, 94, 0.1)';
              prefixIcon = '✅';
            } else if (oIndex === chosenIndex) {
              // Highlight wrong selection in red
              bg = isDark ? 'rgba(239, 68, 68, 0.2)' : 'linear-gradient(145deg, #fef2f2 0%, #fee2e2 100%)';
              color = isDark ? '#f87171' : '#991b1b';
              border = isDark ? '1px solid rgba(239, 68, 68, 0.4)' : '1.2px solid rgba(252, 165, 165, 0.8)';
              boxShadow = isDark ? '0 3px 8px -1px rgba(0, 0, 0, 0.3)' : '0 3px 8px -1px rgba(220, 38, 38, 0.12), inset 0 1.5px 2px #ffffff, inset 0 -1.5px 2px rgba(239, 68, 68, 0.1)';
              prefixIcon = '❌';
            }
          }

          return (
            <div
              key={oIndex}
              onClick={() => onOptionClick(qn.id, oIndex)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 11px',
                borderRadius: '8px',
                background: bg,
                color: color === 'var(--text-primary)' ? 'var(--text-secondary)' : color,
                border: border,
                boxShadow: boxShadow,
                cursor: (mode === 'practice' && !hasAnswered) ? 'pointer' : 'default',
                fontSize: '12px',
                fontWeight: 500,
                transition: 'all 0.2s ease',
                gap: '8px'
              }}
            >
              <span style={{
                width: '22px',
                height: '22px',
                borderRadius: '7px',
                background: isDark ? 'rgba(15, 23, 42, 0.8)' : 'linear-gradient(145deg, #ffffff 0%, #edf2f7 100%)',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.95)',
                boxShadow: isDark ? '0 1.5px 4px rgba(0,0,0,0.3)' : '0 1.5px 4px rgba(0,0,0,0.04), inset 0 1px 1px #ffffff, inset 0 -1px 1px rgba(0,0,0,0.04)',
                color: isDark ? '#e2e8f0' : 'inherit',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 700,
                flexShrink: 0
              }}>
                {prefix}
              </span>
              <span style={{ flex: 1, lineHeight: '1.45' }}>{optText}</span>
              {prefixIcon && <span style={{ fontSize: '12px' }}>{prefixIcon}</span>}
            </div>
          );
        })}
      </div>

      {/* Explanation Card (shows when answered in practice mode, or always in read mode) */}
      {((mode === 'practice' && hasAnswered) || mode === 'read') && (
        <div style={{
          marginTop: '10px',
          padding: '12px 14px',
          borderRadius: '12px',
          background: isDark ? 'rgba(30, 41, 59, 0.7)' : 'linear-gradient(145deg, #eff6ff 0%, #e0edff 100%)',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1.2px solid rgba(191, 219, 254, 0.8)',
          borderLeft: isDark ? '4px solid #60a5fa' : '4px solid var(--primary)',
          boxShadow: isDark ? '0 4px 12px -2px rgba(0, 0, 0, 0.3)' : '0 4px 12px -2px rgba(26, 86, 219, 0.08), inset 0 1.5px 2px #ffffff, inset 0 -1.5px 2px rgba(26, 86, 219, 0.05)'
        }}>
          <h5 style={{
            fontSize: '12px',
            fontWeight: 800,
            color: isDark ? '#60a5fa' : 'var(--primary)',
            marginBottom: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            💡 {isEn ? 'Explanation' : 'ব্যাখ্যা ও বিশ্লেষণ'}
          </h5>
          <ExplanationContent
            content={(isEn && qn.explanationEn) ? qn.explanationEn : qn.explanation}
            style={{ fontSize: '12px', color: isDark ? '#cbd5e1' : 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}
          />
        </div>
      )}
    </div>
  );
});

const toBengaliNumber = (num) => {
  if (num === undefined || num === null) return '';
  const engNum = String(num);
  const bengaliDigits = {'0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'};
  return engNum.split('').map(digit => bengaliDigits[digit] || digit).join('');
};

function QuestionContent({ content, style = {}, className = '' }) {
  if (!content) return null;
  const rawStr = typeof content === 'object' ? (content.text || content.title || content.bn || content.en || '') : String(content || '');
  const hasHtml = /<[a-z/][\s\S]*>/i.test(rawStr);

  if (hasHtml) {
    const cleanHtml = sanitizeQuestionHtml(rawStr);
    return (
      <span
        className={className}
        style={style}
        dangerouslySetInnerHTML={{ __html: cleanHtml }}
      />
    );
  }

  const cleanPlain = stripHtmlTags(rawStr);
  return (
    <span className={className} style={style}>
      {cleanPlain}
    </span>
  );
}

function ExplanationContent({ content, style = {}, className = '' }) {
  if (!content) return null;
  const rawStr = typeof content === 'object' ? (content.text || content.title || content.bn || content.en || '') : String(content || '');
  const hasHtml = /<[a-z/][\s\S]*>/i.test(rawStr);

  if (hasHtml) {
    const cleanHtml = sanitizeQuestionHtml(rawStr);
    return (
      <div
        className={className}
        style={style}
        dangerouslySetInnerHTML={{ __html: cleanHtml }}
      />
    );
  }

  const cleanPlain = stripHtmlTags(rawStr);
  return (
    <div className={className} style={style}>
      {cleanPlain}
    </div>
  );
}
