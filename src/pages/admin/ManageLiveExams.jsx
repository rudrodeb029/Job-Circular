import React, { useState, useEffect } from 'react';
import { getLiveExams, saveLiveExams } from '../../data/liveExams';

export default function ManageLiveExams() {
  const [exams, setExams] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    setExams(getLiveExams());
  }, []);

  const triggerToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const [title, setTitle] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('10');
  const [subjectTopics, setSubjectTopics] = useState([
    { subject: '', subjectEn: '', topics: '', topicsEn: '' }
  ]);

  const [questions, setQuestions] = useState([
    {
      question: '', questionEn: '',
      options: ['', '', '', ''],
      optionsEn: ['', '', '', ''],
      correctIndex: 0,
      explanation: '', explanationEn: ''
    }
  ]);

  const handleAddSubjectTopicRow = () => {
    setSubjectTopics(prev => [...prev, { subject: '', subjectEn: '', topics: '', topicsEn: '' }]);
  };

  const handleRemoveSubjectTopicRow = (index) => {
    if (subjectTopics.length <= 1) return;
    setSubjectTopics(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubjectTopicFieldChange = (index, field, value) => {
    setSubjectTopics(prev => prev.map((st, i) => i === index ? { ...st, [field]: value } : st));
  };

  const handleAddQuestion = () => {
    setQuestions(prev => [
      ...prev,
      {
        question: '', questionEn: '',
        options: ['', '', '', ''],
        optionsEn: ['', '', '', ''],
        correctIndex: 0,
        explanation: '', explanationEn: ''
      }
    ]);
  };

  const handleRemoveQuestion = (index) => {
    if (questions.length <= 1) return;
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const handleQuestionFieldChange = (index, field, value) => {
    setQuestions(prev => prev.map((q, i) => i === index ? { ...q, [field]: value } : q));
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
    const newExam = {
      id: `live-exam-${Date.now()}`,
      title, titleEn,
      startTime: new Date(startTime).toISOString(),
      duration: parseInt(duration, 10),
      subjectTopics, questions,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updatedList = [newExam, ...exams];
    setExams(updatedList);
    saveLiveExams(updatedList);
    triggerToast('Live exam scheduled successfully!');
    setShowAddForm(false);
  };

  const handleDeleteExam = (id) => {
    const list = exams.filter(e => e.id !== id);
    setExams(list);
    saveLiveExams(list);
    triggerToast('Exam deleted successfully!', 'info');
  };

  return (
    <div className="manage-exams-page animate-fade-in">
      <style>{`
        .admin-card { background: #ffffff; border-radius: 20px; border: 1px solid #f1f5f9; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .exam-table th { background: #f8fafc; color: #64748b; font-weight: 700; text-transform: uppercase; font-size: 11px; padding: 16px; }
        .exam-table td { padding: 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
        .form-section { background: #f8fafc; padding: 24px; border-radius: 16px; border: 1.5px solid #e2e8f0; margin-bottom: 24px; }
        .input-group label { display: block; font-size: 13px; font-weight: 700; color: #475569; marginBottom: 8px; }
        .modern-input { width: 100%; padding: 12px 14px; border: 1.5px solid #e2e8f0; borderRadius: 10px; outline: none; transition: border-color 0.2s; }
        .modern-input:focus { border-color: #2563eb; }
        .q-card { background: white; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 16px; position: relative; }
      `}</style>

      {toast.show && (
        <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 3000, background: toast.type === 'error' ? '#ef4444' : '#10b981', color: 'white', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, boxShadow: '0 10px 25px rgba(0,0,0,0.1)', animation: 'slideInRight 0.3s' }}>
          {toast.message}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Live MCQ Exams</h1>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', background: showAddForm ? '#f1f5f9' : 'linear-gradient(135deg, #1a56db 0%, #2563eb 100%)', color: showAddForm ? '#475569' : 'white', border: 'none', borderRadius: '14px', cursor: 'pointer', fontWeight: 700, boxShadow: showAddForm ? 'none' : '0 8px 16px rgba(37, 99, 235, 0.2)' }}
        >
          {showAddForm ? 'View All Exams' : 'Schedule New Exam'}
        </button>
      </div>

      {showAddForm ? (
        <div className="admin-card" style={{ padding: '40px' }}>
          <form onSubmit={handleSaveExam}>
             <div className="form-section">
                <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>1. Basic Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                   <div className="input-group">
                      <label>Exam Title (Bengali)</label>
                      <input className="modern-input" value={title} onChange={e => setTitle(e.target.value)} required />
                   </div>
                   <div className="input-group">
                      <label>Exam Title (English)</label>
                      <input className="modern-input" value={titleEn} onChange={e => setTitleEn(e.target.value)} required />
                   </div>
                   <div className="input-group">
                      <label>Start Date & Time</label>
                      <input className="modern-input" type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} required />
                   </div>
                   <div className="input-group">
                      <label>Duration (Minutes)</label>
                      <select className="modern-input" value={duration} onChange={e => setDuration(e.target.value)}>
                         {[5,10,15,20,30,60].map(m => <option key={m} value={m}>{m} Minutes</option>)}
                      </select>
                   </div>
                </div>
             </div>

             <div className="form-section">
                <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>2. Subjects & Topics</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                   {subjectTopics.map((st, sIdx) => (
                      <div key={sIdx} style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', position: 'relative' }}>
                         {subjectTopics.length > 1 && (
                            <button type="button" onClick={() => handleRemoveSubjectTopicRow(sIdx)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: '#ef4444', fontWeight: 700, cursor: 'pointer', fontSize: '12px' }}>✕ Remove</button>
                         )}
                         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '10px' }}>
                            <div className="input-group">
                               <label>Subject (Bengali)</label>
                               <input className="modern-input" value={st.subject} onChange={e => handleSubjectTopicFieldChange(sIdx, 'subject', e.target.value)} />
                            </div>
                            <div className="input-group">
                               <label>Subject (English)</label>
                               <input className="modern-input" value={st.subjectEn} onChange={e => handleSubjectTopicFieldChange(sIdx, 'subjectEn', e.target.value)} />
                            </div>
                         </div>
                         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="input-group">
                               <label>Topics (Bengali)</label>
                               <input className="modern-input" value={st.topics} onChange={e => handleSubjectTopicFieldChange(sIdx, 'topics', e.target.value)} />
                            </div>
                            <div className="input-group">
                               <label>Topics (English)</label>
                               <input className="modern-input" value={st.topicsEn} onChange={e => handleSubjectTopicFieldChange(sIdx, 'topicsEn', e.target.value)} />
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
                <button type="button" onClick={handleAddSubjectTopicRow} style={{ marginTop: '16px', padding: '10px 16px', background: '#eff6ff', color: '#1a56db', border: '1.5px dashed #1a56db', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>+ Add More Subjects</button>
             </div>

             <div className="form-section">
                <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>3. Configure MCQ Questions ({questions.length})</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                   {questions.map((qn, qIndex) => (
                      <div key={qIndex} className="q-card">
                         {questions.length > 1 && (
                            <button type="button" onClick={() => handleRemoveQuestion(qIndex)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#ef4444', fontWeight: 700, cursor: 'pointer', fontSize: '12px' }}>Delete Question</button>
                         )}
                         <h4 style={{ margin: '0 0 16px 0', color: '#1a56db', fontSize: '14px', fontWeight: 800 }}>Question #{qIndex + 1}</h4>
                         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <div className="input-group">
                               <label>Question (Bengali)</label>
                               <input className="modern-input" value={qn.question} onChange={e => handleQuestionFieldChange(qIndex, 'question', e.target.value)} />
                            </div>
                            <div className="input-group">
                               <label>Question (English)</label>
                               <input className="modern-input" value={qn.questionEn} onChange={e => handleQuestionFieldChange(qIndex, 'questionEn', e.target.value)} />
                            </div>
                         </div>
                         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '16px' }}>
                            <div>
                               <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '8px', display: 'block' }}>Options (Bengali)</label>
                               {qn.options.map((opt, oIdx) => (
                                  <input key={oIdx} className="modern-input" style={{ marginBottom: '8px' }} value={opt} onChange={e => handleOptionChange(qIndex, oIdx, false, e.target.value)} placeholder={`বিকল্প ${oIdx + 1}`} />
                               ))}
                            </div>
                            <div>
                               <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '8px', display: 'block' }}>Options (English)</label>
                               {qn.optionsEn.map((opt, oIdx) => (
                                  <input key={oIdx} className="modern-input" style={{ marginBottom: '8px' }} value={opt} onChange={e => handleOptionChange(qIndex, oIdx, true, e.target.value)} placeholder={`Option ${oIdx + 1}`} />
                               ))}
                            </div>
                         </div>
                         <div style={{ marginBottom: '16px' }}>
                            <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px', display: 'block' }}>Correct Option Index (0-3)</label>
                            <select className="modern-input" value={qn.correctIndex} onChange={e => handleQuestionFieldChange(qIndex, 'correctIndex', parseInt(e.target.value, 10))}>
                               <option value="0">Option 1 / ক</option>
                               <option value="1">Option 2 / খ</option>
                               <option value="2">Option 3 / গ</option>
                               <option value="3">Option 4 / ঘ</option>
                            </select>
                         </div>
                         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="input-group">
                               <label>Explanation (Bengali)</label>
                               <textarea className="modern-input" style={{ height: '80px', resize: 'none' }} value={qn.explanation} onChange={e => handleQuestionFieldChange(qIndex, 'explanation', e.target.value)} />
                            </div>
                            <div className="input-group">
                               <label>Explanation (English)</label>
                               <textarea className="modern-input" style={{ height: '80px', resize: 'none' }} value={qn.explanationEn} onChange={e => handleQuestionFieldChange(qIndex, 'explanationEn', e.target.value)} />
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
                <button type="button" onClick={handleAddQuestion} style={{ marginTop: '16px', width: '100%', padding: '14px', background: '#f8fafc', border: '1.5px dashed #cbd5e1', borderRadius: '12px', color: '#64748b', fontWeight: 700, cursor: 'pointer' }}>+ Add Another Question</button>
             </div>

             <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                <button type="button" onClick={() => setShowAddForm(false)} style={{ padding: '14px 32px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: 'white', fontWeight: 700, color: '#64748b', cursor: 'pointer' }}>Discard</button>
                <button type="submit" style={{ padding: '14px 32px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 16px rgba(16, 185, 129, 0.2)' }}>Schedule Exam</button>
             </div>
          </form>
        </div>
      ) : (
        <div className="admin-card" style={{ overflow: 'hidden' }}>
          <table className="exam-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                <th>Exam Details</th>
                <th>Schedule</th>
                <th>Duration</th>
                <th>Questions</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {exams.map(exam => (
                <tr key={exam.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#1e293b' }}>{exam.titleEn}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{exam.title}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#475569' }}>{new Date(exam.startTime).toLocaleDateString()}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>{new Date(exam.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                  </td>
                  <td style={{ fontWeight: 700, color: '#2563eb' }}>{exam.duration} Min</td>
                  <td>
                    <span style={{ padding: '4px 10px', background: '#f1f5f9', borderRadius: '6px', fontSize: '12px', fontWeight: 700, color: '#475569' }}>{exam.questions?.length || 0} MCQ</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button onClick={() => handleDeleteExam(exam.id)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#fee2e2', color: '#dc2626', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>Delete</button>
                  </td>
                </tr>
              ))}
              {exams.length === 0 && (
                <tr><td colSpan="5" style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>No scheduled live exams found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
