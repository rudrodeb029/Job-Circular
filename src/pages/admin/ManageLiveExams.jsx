import React, { useState, useEffect } from 'react';
import { getLiveExams, saveLiveExams } from '../../data/liveExams';

export default function ManageLiveExams() {
  const [exams, setExams] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Load exams on component mount
  useEffect(() => {
    setExams(getLiveExams());
  }, []);

  const triggerToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // State for creating a new Live Exam
  const [title, setTitle] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('10');
  const [questions, setQuestions] = useState([
    {
      question: '',
      questionEn: '',
      options: ['', '', '', ''],
      optionsEn: ['', '', '', ''],
      correctIndex: 0,
      explanation: '',
      explanationEn: ''
    }
  ]);

  const handleAddQuestion = () => {
    setQuestions(prev => [
      ...prev,
      {
        question: '',
        questionEn: '',
        options: ['', '', '', ''],
        optionsEn: ['', '', '', ''],
        correctIndex: 0,
        explanation: '',
        explanationEn: ''
      }
    ]);
  };

  const handleRemoveQuestion = (index) => {
    if (questions.length <= 1) return;
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const handleQuestionFieldChange = (index, field, value) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i === index) {
        return { ...q, [field]: value };
      }
      return q;
    }));
  };

  const handleOptionChange = (qIndex, oIndex, isEn, value) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i === qIndex) {
        const key = isEn ? 'optionsEn' : 'options';
        const newOpts = [...q[key]];
        newOpts[oIndex] = value;
        return { ...q, [key]: newOpts };
      }
      return q;
    }));
  };

  const handleSaveExam = (e) => {
    e.preventDefault();

    if (!title || !titleEn || !startTime || !duration) {
      triggerToast('Please fill in all general settings!', 'error');
      return;
    }

    // Validation check on questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question || !q.questionEn) {
        triggerToast(`Please write question text for Question ${i + 1}!`, 'error');
        return;
      }
      if (q.options.some(o => !o) || q.optionsEn.some(o => !o)) {
        triggerToast(`Please fill in all 4 options for Question ${i + 1}!`, 'error');
        return;
      }
    }

    const newExam = {
      id: `live-exam-${Date.now()}`,
      title,
      titleEn,
      startTime: new Date(startTime).toISOString(),
      duration: parseInt(duration, 10),
      questions
    };

    const updatedList = [newExam, ...exams];
    setExams(updatedList);
    saveLiveExams(updatedList);

    triggerToast('Live exam scheduled successfully!');
    
    // Reset form
    setTitle('');
    setTitleEn('');
    setStartTime('');
    setDuration('10');
    setQuestions([
      {
        question: '',
        questionEn: '',
        options: ['', '', '', ''],
        optionsEn: ['', '', '', ''],
        correctIndex: 0,
        explanation: '',
        explanationEn: ''
      }
    ]);
    setShowAddForm(false);
  };

  const handleDeleteExam = (id) => {
    const list = exams.filter(e => e.id !== id);
    setExams(list);
    saveLiveExams(list);
    triggerToast('Live exam deleted successfully!', 'info');
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Toast Alert */}
      {toast.show && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: toast.type === 'error' ? '#ef4444' : toast.type === 'info' ? '#3b82f6' : '#10b981',
          color: 'white',
          padding: '14px 20px',
          borderRadius: '10px',
          fontSize: '14px',
          fontWeight: 600,
          boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
          zIndex: 300,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          {toast.message}
        </div>
      )}

      {/* Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: 0 }}>
            Manage Live MCQ Exams
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
            Schedule and configure live mock exams for users
          </p>
        </div>
        
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            padding: '10px 18px',
            borderRadius: '8px',
            border: 'none',
            background: showAddForm ? '#f1f5f9' : '#1a56db',
            color: showAddForm ? '#334155' : 'white',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: showAddForm ? 'none' : '0 4px 12px rgba(26, 86, 219, 0.2)',
            transition: 'all 0.2s'
          }}
        >
          {showAddForm ? 'Back to Exams' : '➕ Schedule Live Exam'}
        </button>
      </div>

      {/* Add / Create Exam Form */}
      {showAddForm ? (
        <form onSubmit={handleSaveExam} style={{ background: 'white', padding: '24px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '18px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
            Schedule Settings
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>Exam Title (Bangla)</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} type="text" placeholder="যেমন: বিসিএস লাইভ মডেল টেস্ট" style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '8px', outline: 'none', fontSize: '14px' }} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>Exam Title (English)</label>
              <input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} type="text" placeholder="e.g. BCS Live Model Test" style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '8px', outline: 'none', fontSize: '14px' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>Start Date & Time</label>
              <input value={startTime} onChange={(e) => setStartTime(e.target.value)} type="datetime-local" style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '8px', outline: 'none', fontSize: '14px' }} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>Duration (Minutes)</label>
              <select value={duration} onChange={(e) => setDuration(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '8px', outline: 'none', fontSize: '14px' }}>
                <option value="5">5 Minutes</option>
                <option value="10">10 Minutes</option>
                <option value="15">15 Minutes</option>
                <option value="20">20 Minutes</option>
                <option value="30">30 Minutes</option>
                <option value="60">60 Minutes</option>
              </select>
            </div>
          </div>

          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '18px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
            Configure MCQ Questions ({questions.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
            {questions.map((qn, qIndex) => (
              <div key={qIndex} style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', position: 'relative' }}>
                {/* Delete Question button */}
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(qIndex)}
                    style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#ef4444', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}
                  >
                    Delete Question
                  </button>
                )}

                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#1a56db', margin: '0 0 16px 0' }}>
                  Question #{qIndex + 1}
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>Question Text (Bangla)</label>
                    <input value={qn.question} onChange={(e) => handleQuestionFieldChange(qIndex, 'question', e.target.value)} type="text" placeholder="যেমন: বাংলাদেশ কত সালে স্বাধীন হয়?" style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>Question Text (English)</label>
                    <input value={qn.questionEn} onChange={(e) => handleQuestionFieldChange(qIndex, 'questionEn', e.target.value)} type="text" placeholder="e.g. When did Bangladesh gain independence?" style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', outline: 'none' }} />
                  </div>
                </div>

                {/* Option fields */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>Options (Bangla)</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {qn.options.map((opt, oIndex) => (
                        <input key={oIndex} value={opt} onChange={(e) => handleOptionChange(qIndex, oIndex, false, e.target.value)} type="text" placeholder={`বিকল্প ${String.fromCharCode(2453 + oIndex)}`} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', outline: 'none' }} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>Options (English)</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {qn.optionsEn.map((opt, oIndex) => (
                        <input key={oIndex} value={opt} onChange={(e) => handleOptionChange(qIndex, oIndex, true, e.target.value)} type="text" placeholder={`Option ${String.fromCharCode(65 + oIndex)}`} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', outline: 'none' }} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Correct choice & Explanations */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '10px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>Correct Option Index</label>
                    <select value={qn.correctIndex} onChange={(e) => handleQuestionFieldChange(qIndex, 'correctIndex', parseInt(e.target.value, 10))} style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', outline: 'none' }}>
                      <option value="0">Option A / ক</option>
                      <option value="1">Option B / খ</option>
                      <option value="2">Option C / গ</option>
                      <option value="3">Option D / ঘ</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>Explanation (Bangla)</label>
                    <textarea value={qn.explanation} onChange={(e) => handleQuestionFieldChange(qIndex, 'explanation', e.target.value)} placeholder="যেমন: ১৯৭১ সালের ১৬ই ডিসেম্বর বাংলাদেশ..." style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', outline: 'none', height: '60px', resize: 'vertical' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>Explanation (English)</label>
                    <textarea value={qn.explanationEn} onChange={(e) => handleQuestionFieldChange(qIndex, 'explanationEn', e.target.value)} placeholder="e.g. Bangladesh achieved independence on 16 December 1971..." style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', outline: 'none', height: '60px', resize: 'vertical' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddQuestion}
            style={{
              padding: '10px 16px',
              background: '#f1f5f9',
              color: '#475569',
              fontWeight: 700,
              fontSize: '13px',
              border: '1.5px dashed #cbd5e1',
              borderRadius: '10px',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'center',
              marginBottom: '24px'
            }}
          >
            ➕ Add Another Question
          </button>

          <button
            type="submit"
            style={{
              padding: '12px 20px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              float: 'right'
            }}
          >
            Schedule Live Exam
          </button>
          <div style={{ clear: 'both' }}></div>
        </form>
      ) : (
        /* Live Exams List Table */
        <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>EXAM TITLE</th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>START TIME</th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>DURATION</th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>QUESTIONS</th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#64748b', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {exams.map(exam => (
                <tr key={exam.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 20px', fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                    <div>{exam.titleEn}</div>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 400 }}>{exam.title}</div>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: '#334155' }}>
                    {new Date(exam.startTime).toLocaleString()}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: '#334155' }}>
                    {exam.duration} Minutes
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: '#334155' }}>
                    {exam.questions.length} Items
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleDeleteExam(exam.id)}
                      style={{
                        padding: '6px 12px',
                        background: '#fee2e2',
                        color: '#dc2626',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {exams.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                    No scheduled exams found. Click "Schedule Live Exam" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
