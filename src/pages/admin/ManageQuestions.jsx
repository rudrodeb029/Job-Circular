import React, { useState, useEffect } from 'react';
import { getQuestionsData, saveQuestionsData } from '../../data/questionsData';

export default function ManageQuestions() {
  const [papers, setPapers] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentPaper, setCurrentPaper] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Fields for adding/editing paper
  const [title, setTitle] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [category, setCategory] = useState('bcs');
  const [date, setDate] = useState('');
  const [dateEn, setDateEn] = useState('');
  const [timeLimit, setTimeLimit] = useState('১০ মিনিট');
  const [timeLimitEn, setTimeLimitEn] = useState('10 Mins');
  const [questions, setQuestions] = useState([
    {
      id: 'q-1',
      question: '',
      questionEn: '',
      options: ['', '', '', ''],
      optionsEn: ['', '', '', ''],
      correctIndex: 0,
      explanation: '',
      explanationEn: ''
    }
  ]);

  useEffect(() => {
    setPapers(getQuestionsData());
  }, []);

  const triggerToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleOpenAdd = () => {
    setCurrentPaper(null);
    setTitle('');
    setTitleEn('');
    setCategory('bcs');
    setDate('');
    setDateEn('');
    setTimeLimit('১০ মিনিট');
    setTimeLimitEn('10 Mins');
    setQuestions([
      {
        id: `q-${Date.now()}-1`,
        question: '',
        questionEn: '',
        options: ['', '', '', ''],
        optionsEn: ['', '', '', ''],
        correctIndex: 0,
        explanation: '',
        explanationEn: ''
      }
    ]);
    setShowModal(true);
  };

  const handleOpenEdit = (paper) => {
    setCurrentPaper(paper);
    setTitle(paper.title || '');
    setTitleEn(paper.titleEn || '');
    setCategory(paper.category || 'bcs');
    setDate(paper.date || '');
    setDateEn(paper.dateEn || '');
    setTimeLimit(paper.timeLimit || '১০ মিনিট');
    setTimeLimitEn(paper.timeLimitEn || '10 Mins');
    setQuestions(paper.questions && paper.questions.length > 0 ? paper.questions : [
      {
        id: `q-${Date.now()}-1`,
        question: '',
        questionEn: '',
        options: ['', '', '', ''],
        optionsEn: ['', '', '', ''],
        correctIndex: 0,
        explanation: '',
        explanationEn: ''
      }
    ]);
    setShowModal(true);
  };

  const handleAddQuestionRow = () => {
    setQuestions(prev => [
      ...prev,
      {
        id: `q-${Date.now()}-${prev.length + 1}`,
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

  const handleRemoveQuestionRow = (index) => {
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

  const handleSave = (e) => {
    e.preventDefault();

    const newPaper = {
      id: currentPaper ? currentPaper.id : `paper-${Date.now()}`,
      category,
      title,
      titleEn,
      date,
      dateEn,
      totalQuestions: String(questions.length),
      timeLimit,
      timeLimitEn,
      questions,
      createdAt: currentPaper ? (currentPaper.createdAt || new Date().toISOString()) : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    let updatedPapers;
    if (currentPaper) {
      updatedPapers = papers.map(p => p.id === currentPaper.id ? newPaper : p);
      triggerToast('Question paper updated successfully!');
    } else {
      updatedPapers = [newPaper, ...papers];
      triggerToast('New question paper created successfully!');
    }

    setPapers(updatedPapers);
    saveQuestionsData(updatedPapers);
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this question paper?')) {
      const updated = papers.filter(p => p.id !== id);
      setPapers(updated);
      saveQuestionsData(updated);
      triggerToast('Question paper deleted.');
    }
  };

  const getCategoryLabel = (cat) => {
    const labels = {
      bcs: 'BCS',
      bank: 'Bank',
      ntrca: 'NTRCA',
      primary: 'Primary',
      ministry: 'Ministries'
    };
    return labels[cat] || cat.toUpperCase();
  };

  return (
    <div className="manage-questions-page animate-fade-in">
      <style>{`
        .admin-card { background: #ffffff; border-radius: 20px; border: 1px solid #f1f5f9; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .q-table th { background: #f8fafc; color: #64748b; font-weight: 700; text-transform: uppercase; font-size: 11px; padding: 16px; }
        .q-table td { padding: 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
        .cat-pill { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 800; text-transform: uppercase; background: #eff6ff; color: #1a56db; }
        .input-group label { display: block; font-size: 13px; font-weight: 700; color: #475569; marginBottom: 8px; }
        .modern-input { width: 100%; padding: 12px 14px; border: 1.5px solid #e2e8f0; borderRadius: 10px; outline: none; transition: border-color 0.2s; }
        .modern-input:focus { border-color: #2563eb; }
        .q-row-card { background: #f8fafc; border-radius: 16px; border: 1.5px solid #e2e8f0; padding: 24px; margin-bottom: 24px; position: relative; }
        .modal-overlay { background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(8px); position: fixed; inset: 0; z-index: 2000; display: flex; alignItems: center; justifyContent: center; }
      `}</style>

      {toast.show && (
        <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 3000, background: '#10b981', color: 'white', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, boxShadow: '0 10px 25px rgba(0,0,0,0.1)', animation: 'slideInRight 0.3s' }}>
          {toast.message}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Questions Bank</h1>
        </div>
        <button onClick={handleOpenAdd} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', background: 'linear-gradient(135deg, #1a56db 0%, #2563eb 100%)', color: 'white', border: 'none', borderRadius: '14px', cursor: 'pointer', fontWeight: 700, boxShadow: '0 8px 16px rgba(37, 99, 235, 0.2)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Create Paper
        </button>
      </div>

      <div className="admin-card" style={{ padding: '24px', marginBottom: '2rem', display: 'flex', gap: '20px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
           <svg style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
           <input placeholder="Search question papers..." style={{ width: '100%', padding: '14px 48px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', outline: 'none' }} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <select style={{ padding: '14px 24px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', outline: 'none', fontWeight: 600 }} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
           <option value="all">All Categories</option>
           {['bcs', 'bank', 'ntrca', 'primary', 'ministry'].map(c => <option key={c} value={c}>{getCategoryLabel(c)}</option>)}
        </select>
      </div>

      <div className="admin-card" style={{ overflow: 'hidden' }}>
        <table className="q-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr>
              <th>Paper Title</th>
              <th>Category</th>
              <th>Date</th>
              <th>Time Limit</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {papers.filter(p => (categoryFilter === 'all' || p.category === categoryFilter) && ((p.title||'').toLowerCase().includes(searchQuery.toLowerCase()) || (p.titleEn||'').toLowerCase().includes(searchQuery.toLowerCase()))).map(paper => (
              <tr key={paper.id}>
                <td>
                  <div style={{ fontWeight: 700, color: '#1e293b' }}>{paper.titleEn}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{paper.title}</div>
                </td>
                <td><span className="cat-pill">{paper.category}</span></td>
                <td style={{ color: '#475569', fontWeight: 600 }}>{paper.dateEn || 'N/A'}</td>
                <td style={{ color: '#475569', fontWeight: 600 }}>{paper.timeLimitEn}</td>
                <td style={{ textAlign: 'center' }}>
                   <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button onClick={() => handleOpenEdit(paper)} style={{ padding: '8px 16px', background: '#eff6ff', color: '#1a56db', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>Edit</button>
                      <button onClick={() => handleDelete(paper.id)} style={{ padding: '8px 16px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>Delete</button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="admin-card animate-fade-in" style={{ width: '95%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', padding: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{currentPaper ? 'Edit Question Paper' : 'New Question Paper'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: '#f1f5f9', border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer', color: '#64748b' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                <div className="input-group">
                  <label>Title (Bengali)</label>
                  <input className="modern-input" value={title} onChange={e => setTitle(e.target.value)} required />
                </div>
                <div className="input-group">
                  <label>Title (English)</label>
                  <input className="modern-input" value={titleEn} onChange={e => setTitleEn(e.target.value)} required />
                </div>
                <div className="input-group">
                  <label>Category</label>
                  <select className="modern-input" value={category} onChange={e => setCategory(e.target.value)}>
                    {['bcs', 'bank', 'ntrca', 'primary', 'ministry'].map(c => <option key={c} value={c}>{getCategoryLabel(c)}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label>Time Limit (e.g. 10 Mins)</label>
                  <input className="modern-input" value={timeLimitEn} onChange={e => setTimeLimitEn(e.target.value)} required />
                </div>
                <div className="input-group">
                  <label>Exam Date (Bengali)</label>
                  <input className="modern-input" value={date} onChange={e => setDate(e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Exam Date (English)</label>
                  <input className="modern-input" value={dateEn} onChange={e => setDateEn(e.target.value)} />
                </div>
              </div>

              <div style={{ borderTop: '2px solid #f1f5f9', paddingTop: '32px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '24px' }}>Configure MCQ Questions ({questions.length})</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                   {questions.map((qn, qIndex) => (
                      <div key={qIndex} className="q-row-card">
                         <button type="button" onClick={() => handleRemoveQuestionRow(qIndex)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#ef4444', fontWeight: 700, cursor: 'pointer', fontSize: '12px' }}>Remove MCQ</button>
                         <h4 style={{ margin: '0 0 16px 0', color: '#1a56db', fontSize: '14px', fontWeight: 800 }}>MCQ Question #{qIndex + 1}</h4>

                         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                            <div className="input-group">
                               <label>Question Text (Bengali)</label>
                               <input className="modern-input" value={qn.question} onChange={e => handleQuestionFieldChange(qIndex, 'question', e.target.value)} required />
                            </div>
                            <div className="input-group">
                               <label>Question Text (English)</label>
                               <input className="modern-input" value={qn.questionEn} onChange={e => handleQuestionFieldChange(qIndex, 'questionEn', e.target.value)} required />
                            </div>
                         </div>

                         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '20px' }}>
                            <div>
                               <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '8px', display: 'block' }}>Options (Bengali)</label>
                               {qn.options.map((opt, oIdx) => (
                                  <input key={oIdx} className="modern-input" style={{ marginBottom: '8px' }} value={opt} onChange={e => handleOptionChange(qIndex, oIdx, false, e.target.value)} placeholder={`বিকল্প ${oIdx + 1}`} required />
                               ))}
                            </div>
                            <div>
                               <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '8px', display: 'block' }}>Options (English)</label>
                               {qn.optionsEn.map((opt, oIdx) => (
                                  <input key={oIdx} className="modern-input" style={{ marginBottom: '8px' }} value={opt} onChange={e => handleOptionChange(qIndex, oIdx, true, e.target.value)} placeholder={`Option ${oIdx + 1}`} required />
                               ))}
                            </div>
                         </div>

                         <div style={{ marginBottom: '20px' }}>
                            <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px', display: 'block' }}>Correct Choice (0-3)</label>
                            <select className="modern-input" value={qn.correctIndex} onChange={e => handleQuestionFieldChange(qIndex, 'correctIndex', parseInt(e.target.value, 10))}>
                               <option value="0">Option 1 / ক</option>
                               <option value="1">Option 2 / খ</option>
                               <option value="2">Option 3 / গ</option>
                               <option value="3">Option 4 / ঘ</option>
                            </select>
                         </div>

                         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div className="input-group">
                               <label>Answer Explanation (Bengali)</label>
                               <textarea className="modern-input" style={{ height: '80px', resize: 'none' }} value={qn.explanation} onChange={e => handleQuestionFieldChange(qIndex, 'explanation', e.target.value)} />
                            </div>
                            <div className="input-group">
                               <label>Answer Explanation (English)</label>
                               <textarea className="modern-input" style={{ height: '80px', resize: 'none' }} value={qn.explanationEn} onChange={e => handleQuestionFieldChange(qIndex, 'explanationEn', e.target.value)} />
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
                <button type="button" onClick={handleAddQuestionRow} style={{ marginTop: '8px', width: '100%', padding: '14px', background: '#f8fafc', border: '1.5px dashed #cbd5e1', borderRadius: '12px', color: '#1a56db', fontWeight: 700, cursor: 'pointer' }}>+ Add MCQ Question Row</button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '40px', borderTop: '2px solid #f1f5f9', paddingTop: '32px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '14px 32px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: 'white', fontWeight: 700, color: '#64748b', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '14px 32px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #1a56db 0%, #2563eb 100%)', color: 'white', fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 16px rgba(37, 99, 235, 0.2)' }}>Save Question Paper</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
