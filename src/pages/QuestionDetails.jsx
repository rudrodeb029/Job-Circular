import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock } from '../components/Icons';
import { useAppContext } from '../context/AppContext';
import { getQuestionById } from '../data/questionsData';
import BottomNav from '../components/BottomNav';

export default function QuestionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useAppContext();
  const isEn = state.language === 'en';

  const paper = useMemo(() => {
    return getQuestionById(id);
  }, [id]);

  // 'practice' or 'read'
  const [mode, setMode] = useState('practice');
  // Tracks selected answers for each question: { [questionId]: optionIndex }
  const [selectedAnswers, setSelectedAnswers] = useState({});

  if (!paper) {
    return (
      <div className="page" style={{ paddingBottom: '100px' }}>
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={22} />
          </button>
          <h1 style={{ flex: 1 }}>{isEn ? 'Not Found' : 'পাওয়া যায়নি'}</h1>
        </div>
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <p>{isEn ? 'Question paper not found' : 'প্রশ্নপত্র খুঁজে পাওয়া যায়নি'}</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  const handleOptionClick = (questionId, index) => {
    if (mode !== 'practice') return;
    // Don't allow changing answer once selected in practice mode
    if (selectedAnswers[questionId] !== undefined) return;

    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: index
    }));
  };

  const handleReset = () => {
    setSelectedAnswers({});
  };

  // Calculate score
  const score = useMemo(() => {
    let correct = 0;
    paper.questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correct += 1;
      }
    });
    return correct;
  }, [paper.questions, selectedAnswers]);

  const attemptedCount = Object.keys(selectedAnswers).length;
  const totalCount = paper.questions.length;

  return (
    <div className="page" style={{ paddingBottom: '100px', background: 'var(--bg)' }}>
      {/* Header */}
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
        </button>
        <h1 style={{ flex: 1, fontSize: '15px', fontWeight: 800 }}>
          {isEn ? paper.titleEn : paper.title}
        </h1>
      </div>

      <div className="page-content animate-fade-in" style={{ padding: '16px' }}>
        {/* Info & Mode Selector Header Card */}
        <div style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, #2563eb 100%)',
          color: '#ffffff',
          borderRadius: '18px',
          padding: '20px',
          marginBottom: '20px',
          boxShadow: '0 8px 24px rgba(26, 86, 219, 0.2)'
        }}>
          <h2 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '8px', lineHeight: '1.4' }}>
            {isEn ? paper.titleEn : paper.title}
          </h2>
          <div style={{ display: 'flex', gap: '14px', fontSize: '12px', opacity: 0.9, marginBottom: '16px' }}>
            <span>📅 {isEn ? paper.dateEn : paper.date}</span>
            <span>📝 {isEn ? `${totalCount} Questions` : `${toBengaliNumber(totalCount)}টি প্রশ্ন`}</span>
            <span>🕒 {isEn ? paper.timeLimitEn : paper.timeLimit}</span>
          </div>

          {/* Mode Switcher Buttons */}
          <div style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.15)',
            padding: '4px',
            borderRadius: '12px',
            gap: '4px'
          }}>
            <button
              onClick={() => setMode('practice')}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '10px',
                border: 'none',
                background: mode === 'practice' ? '#ffffff' : 'transparent',
                color: mode === 'practice' ? 'var(--primary)' : '#ffffff',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              🎯 {isEn ? 'Practice Mode' : 'অনুশীলন মোড'}
            </button>
            <button
              onClick={() => setMode('read')}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '10px',
                border: 'none',
                background: mode === 'read' ? '#ffffff' : 'transparent',
                color: mode === 'read' ? 'var(--primary)' : '#ffffff',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              📖 {isEn ? 'Read Solution' : 'পড়া মোড'}
            </button>
          </div>
        </div>

        {/* Score & Progress Tracker Card (Only in Practice Mode) */}
        {mode === 'practice' && (
          <div style={{
            background: 'var(--white)',
            border: '1px solid var(--border-light)',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '20px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {isEn ? 'Practice Progress' : 'অনুশীলন অগ্রগতি'}
              </span>
              <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--primary)' }}>
                {isEn 
                  ? `Attempted: ${attemptedCount}/${totalCount} | Score: ${score}`
                  : `উত্তর দিয়েছেন: ${toBengaliNumber(attemptedCount)}/${toBengaliNumber(totalCount)} | স্কোর: ${toBengaliNumber(score)}`}
              </span>
            </div>
            
            {/* Progress Bar */}
            <div style={{ width: '100%', height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
              <div style={{
                width: `${(attemptedCount / totalCount) * 100}%`,
                height: '100%',
                background: 'var(--primary)',
                borderRadius: '4px',
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
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  color: 'var(--danger)',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                🔄 {isEn ? 'Reset Answers' : 'আবার শুরু করুন'}
              </button>
            )}
          </div>
        )}

        {/* Questions List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {paper.questions.map((qn, qIndex) => {
            const hasAnswered = selectedAnswers[qn.id] !== undefined;
            const chosenIndex = selectedAnswers[qn.id];
            
            return (
              <div
                key={qn.id}
                style={{
                  background: 'var(--white)',
                  border: '1px solid var(--border-light)',
                  borderRadius: '18px',
                  padding: '20px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {/* Question Label */}
                <h4 style={{
                  fontSize: '15px',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  marginBottom: '16px',
                  lineHeight: '1.5',
                  display: 'flex',
                  gap: '8px'
                }}>
                  <span>{isEn ? `${qIndex + 1}.` : `${toBengaliNumber(qIndex + 1)}.`}</span>
                  <span>{isEn ? qn.questionEn : qn.question}</span>
                </h4>

                {/* Option Choices */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {qn.options.map((option, oIndex) => {
                    const optText = isEn ? qn.optionsEn[oIndex] : option;
                    
                    let bg = 'var(--bg)';
                    let color = 'var(--text-primary)';
                    let border = '1px solid var(--border)';
                    let prefixIcon = '';

                    const bengaliOptionPrefixes = ['ক', 'খ', 'গ', 'ঘ'];
                    const englishOptionPrefixes = ['A', 'B', 'C', 'D'];
                    const prefix = isEn ? englishOptionPrefixes[oIndex] : bengaliOptionPrefixes[oIndex];

                    if (mode === 'read') {
                      if (oIndex === qn.correctIndex) {
                        bg = '#d1fae5';
                        color = '#065f46';
                        border = '1px solid #34d399';
                        prefixIcon = '✅';
                      }
                    } else if (mode === 'practice' && hasAnswered) {
                      if (oIndex === qn.correctIndex) {
                        // Highlight correct answer in green
                        bg = '#d1fae5';
                        color = '#065f46';
                        border = '1px solid #34d399';
                        prefixIcon = '✅';
                      } else if (oIndex === chosenIndex) {
                        // Highlight wrong selection in red
                        bg = '#fee2e2';
                        color = '#991b1b';
                        border = '1px solid #f87171';
                        prefixIcon = '❌';
                      }
                    }

                    return (
                      <div
                        key={oIndex}
                        onClick={() => handleOptionClick(qn.id, oIndex)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '12px 14px',
                          borderRadius: '12px',
                          background: bg,
                          color: color,
                          border: border,
                          cursor: (mode === 'practice' && !hasAnswered) ? 'pointer' : 'default',
                          fontSize: '13px',
                          fontWeight: 600,
                          transition: 'all 0.2s ease',
                          gap: '10px'
                        }}
                      >
                        <span style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: 'rgba(0,0,0,0.05)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: 700,
                          flexShrink: 0
                        }}>
                          {prefix}
                        </span>
                        <span style={{ flex: 1 }}>{optText}</span>
                        {prefixIcon && <span style={{ fontSize: '14px' }}>{prefixIcon}</span>}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation Card (shows when answered in practice mode, or always in read mode) */}
                {((mode === 'practice' && hasAnswered) || mode === 'read') && (
                  <div style={{
                    marginTop: '16px',
                    padding: '14px',
                    borderRadius: '12px',
                    background: 'var(--primary-lightest)',
                    borderLeft: '4px solid var(--primary)',
                    animation: 'fadeIn 0.3s ease'
                  }}>
                    <h5 style={{
                      fontSize: '12px',
                      fontWeight: 800,
                      color: 'var(--primary)',
                      marginBottom: '6px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      💡 {isEn ? 'Explanation' : 'ব্যাখ্যা ও বিশ্লেষণ'}
                    </h5>
                    <p style={{
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      lineHeight: '1.6',
                      margin: 0
                    }}>
                      {isEn ? qn.explanationEn : qn.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
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
