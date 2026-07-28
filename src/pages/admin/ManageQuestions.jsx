import React, { useState, useEffect } from 'react';
import { getQuestionsData, saveQuestionsData } from '../../data/questionsData';

export default function ManageQuestions() {
  const [papers, setPapers] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentPaper, setCurrentPaper] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Fields
  const [title, setTitle] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [category, setCategory] = useState('bcs');
  const [dateEn, setDateEn] = useState('');
  const [timeLimitEn, setTimeLimitEn] = useState('10 Mins');
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    setPapers(getQuestionsData());
  }, []);

  const triggerToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleOpenAdd = () => {
    setCurrentPaper(null);
    setTitle(''); setTitleEn(''); setCategory('bcs'); setDateEn(''); setTimeLimitEn('10 Mins');
    setQuestions([{ id: 'q1', question: '', questionEn: '', options: ['','','',''], optionsEn: ['','','',''], correctIndex: 0 }]);
    setShowModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const newPaper = {
      id: currentPaper ? currentPaper.id : `paper-${Date.now()}`,
      category, title, titleEn, dateEn, timeLimitEn, questions,
      createdAt: currentPaper?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = currentPaper ? papers.map(p => p.id === currentPaper.id ? newPaper : p) : [newPaper, ...papers];
    setPapers(updated);
    saveQuestionsData(updated);
    triggerToast(currentPaper ? 'Paper updated!' : 'Paper created!');
    setShowModal(false);
  };

  return (
    <div className="manage-questions-page animate-fade-in">
      <style>{`
        .admin-card { background: #ffffff; border-radius: 20px; border: 1px solid #f1f5f9; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .q-table th { background: #f8fafc; color: #64748b; font-weight: 700; text-transform: uppercase; font-size: 11px; padding: 16px; }
        .q-table td { padding: 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
        .cat-pill { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 800; text-transform: uppercase; background: #eff6ff; color: #1a56db; }
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
           <input placeholder="Search questions..." style={{ width: '100%', padding: '14px 48px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', outline: 'none' }} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <select style={{ padding: '14px 24px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', outline: 'none', fontWeight: 600 }} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
           <option value="all">All Categories</option>
           {['bcs', 'bank', 'ntrca', 'primary', 'ministry'].map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
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
            {papers.filter(p => categoryFilter === 'all' || p.category === categoryFilter).map(paper => (
              <tr key={paper.id}>
                <td>
                  <div style={{ fontWeight: 700, color: '#1e293b' }}>{paper.titleEn}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{paper.title}</div>
                </td>
                <td><span className="cat-pill">{paper.category}</span></td>
                <td style={{ color: '#475569', fontWeight: 600 }}>{paper.dateEn || 'N/A'}</td>
                <td style={{ color: '#475569', fontWeight: 600 }}>{paper.timeLimitEn}</td>
                <td style={{ textAlign: 'center' }}>
                   <button onClick={() => { if(window.confirm('Delete paper?')) { setPapers(papers.filter(p => p.id !== paper.id)); triggerToast('Deleted!'); } }} style={{ padding: '8px 16px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="admin-card animate-fade-in" style={{ width: '90%', maxWidth: '600px', padding: '32px' }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '22px', fontWeight: 800 }}>New Question Paper</h2>
            <form onSubmit={handleSave} style={{ display: 'grid', gap: '20px' }}>
              <input placeholder="Title (English)" style={{ padding: '14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', outline: 'none' }} value={titleEn} onChange={e => setTitleEn(e.target.value)} required />
              <select style={{ padding: '14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', outline: 'none' }} value={category} onChange={e => setCategory(e.target.value)}>
                 {['bcs', 'bank', 'ntrca', 'primary', 'ministry'].map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
              </select>
              <div style={{ display: 'flex', gap: '16px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: 'white', fontWeight: 700 }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #1a56db 0%, #2563eb 100%)', color: 'white', fontWeight: 700 }}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
