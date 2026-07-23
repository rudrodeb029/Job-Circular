import React, { useState, useEffect } from 'react';
import { getQuestionsData, saveQuestionsData } from '../../data/questionsData';

export default function ManageQuestions() {
  const [papers, setPapers] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentPaper, setCurrentPaper] = useState(null); // null means adding a new paper
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
    if (questions.length <= 1) {
      triggerToast('At least one question is required.', 'error');
      return;
    }
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

    if (!title.trim() || !titleEn.trim()) {
      triggerToast('Title in both languages is required.', 'error');
      return;
    }

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
      questions
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

  const filteredPapers = papers.filter(p => {
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesSearch = searchQuery.trim() === '' || 
      (p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.titleEn || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryLabel = (cat) => {
    const labels = {
      bcs: 'বিসিএস (BCS)',
      bank: 'ব্যাংক (Bank)',
      ntrca: 'NTRCA',
      primary: 'প্রাইমারি (Primary)',
      ministry: 'বিভিন্ন মন্ত্রনালয় (Ministries)'
    };
    return labels[cat] || cat;
  };

  return (
    <div className="admin-content">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`admin-toast ${toast.type === 'error' ? 'error' : ''}`}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>Questions Bank Management</h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Add, edit, or delete question papers and their nested MCQs by category</p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={handleOpenAdd}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Create Question Paper</span>
        </button>
      </div>

      {/* Filters Toolbar */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Filter Category:</span>
          {['all', 'bcs', 'bank', 'ntrca', 'primary', 'ministry'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className="admin-btn"
              style={{
                padding: '6px 12px',
                fontSize: '12.5px',
                borderRadius: '8px',
                fontWeight: 600,
                background: categoryFilter === cat ? '#eff6ff' : 'transparent',
                color: categoryFilter === cat ? '#1a56db' : '#64748b',
                border: categoryFilter === cat ? '1px solid #dbeafe' : '1px solid transparent'
              }}
            >
              {cat === 'all' ? 'All' : getCategoryLabel(cat)}
            </button>
          ))}
        </div>

        <div className="admin-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search papers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table list of Question Papers */}
      <div className="admin-table-wrapper">
        <div className="admin-table-header">
          <h3 className="admin-table-title">Question Papers List ({filteredPapers.length})</h3>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Paper Title</th>
              <th>Category</th>
              <th>Questions</th>
              <th>Time Limit</th>
              <th>Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPapers.map(paper => (
              <tr key={paper.id}>
                <td>
                  <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '13.5px' }}>{paper.title}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{paper.titleEn}</div>
                </td>
                <td>
                  <span className="status-badge status-pending" style={{ textTransform: 'capitalize' }}>
                    {paper.category}
                  </span>
                </td>
                <td style={{ fontWeight: 600, color: '#334155' }}>
                  {paper.questions?.length || paper.totalQuestions || 0} MCQs
                </td>
                <td style={{ fontSize: '13px', color: '#64748b' }}>
                  {paper.timeLimitEn}
                </td>
                <td style={{ fontSize: '13px', color: '#64748b' }}>
                  {paper.dateEn}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => handleOpenEdit(paper)}
                      className="admin-btn admin-btn-secondary admin-btn-sm"
                      style={{ padding: '6px 10px', fontSize: '12px' }}
                    >
                      Edit Questions & Info
                    </button>
                    <button
                      onClick={() => handleDelete(paper.id)}
                      className="admin-btn admin-btn-danger admin-btn-sm"
                      style={{ padding: '6px 10px', fontSize: '12px' }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredPapers.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                  No question papers found matching filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '800px', width: '90%' }}>
            <div className="admin-modal-header">
              <h3>{currentPaper ? 'Edit Question Paper' : 'Create Question Paper'}</h3>
              <button
                className="admin-btn admin-btn-ghost admin-btn-icon"
                onClick={() => setShowModal(false)}
                style={{ fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="admin-modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b', marginBottom: '14px', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>Paper Configurations</h4>
                
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Title (Bengali)</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="যেমন: ৪৫তম বিসিএস প্রিলিমিনারি প্রশ্ন"
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Title (English)</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={titleEn}
                      onChange={(e) => setTitleEn(e.target.value)}
                      placeholder="e.g. 45th BCS Preliminary Question"
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Category</label>
                    <select
                      className="admin-form-input admin-form-select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="bcs">বিসিএস (BCS)</option>
                      <option value="bank">ব্যাংক (Bank)</option>
                      <option value="ntrca">NTRCA</option>
                      <option value="primary">প্রাইমারি (Primary)</option>
                      <option value="ministry">বিভিন্ন মন্ত্রনালয় (Ministries)</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Time Limit (English)</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={timeLimitEn}
                      onChange={(e) => setTimeLimitEn(e.target.value)}
                      placeholder="e.g. 10 Mins"
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Exam Date (Bengali)</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      placeholder="যেমন: ১৯ মে ২০২৩"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Exam Date (English)</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={dateEn}
                      onChange={(e) => setDateEn(e.target.value)}
                      placeholder="e.g. 19 May 2023"
                    />
                  </div>
                </div>

                <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b', marginTop: '24px', marginBottom: '14px', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Questions Sheet List ({questions.length})</span>
                  <button
                    type="button"
                    className="admin-btn admin-btn-secondary admin-btn-sm"
                    onClick={handleAddQuestionRow}
                    style={{ padding: '4px 10px', fontSize: '11px' }}
                  >
                    + Add MCQ Row
                  </button>
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {questions.map((q, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '16px',
                        position: 'relative'
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestionRow(idx)}
                        style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          fontWeight: 700,
                          cursor: 'pointer',
                          fontSize: '13px'
                        }}
                      >
                        Remove MCQ
                      </button>

                      <div style={{ fontWeight: 700, fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>
                        MCQ Question #{idx + 1}
                      </div>

                      <div className="admin-form-row">
                        <div className="admin-form-group">
                          <label className="admin-form-label">Question Text (Bengali)</label>
                          <input
                            type="text"
                            className="admin-form-input"
                            value={q.question}
                            onChange={(e) => handleQuestionFieldChange(idx, 'question', e.target.value)}
                            placeholder="যেমন: বাংলা সাহিত্যের প্রাচীনতম নিদর্শন কোনটি?"
                            required
                          />
                        </div>
                        <div className="admin-form-group">
                          <label className="admin-form-label">Question Text (English)</label>
                          <input
                            type="text"
                            className="admin-form-input"
                            value={q.questionEn}
                            onChange={(e) => handleQuestionFieldChange(idx, 'questionEn', e.target.value)}
                            placeholder="e.g. Which is the oldest literary work in Bengali literature?"
                            required
                          />
                        </div>
                      </div>

                      {/* Options Bengali */}
                      <div className="admin-form-label" style={{ marginTop: '8px', marginBottom: '8px' }}>MCQ Options (Bengali)</div>
                      <div className="admin-form-row" style={{ marginBottom: '8px' }}>
                        <input
                          type="text"
                          className="admin-form-input"
                          value={q.options[0]}
                          onChange={(e) => handleOptionChange(idx, 0, false, e.target.value)}
                          placeholder="Option A (ক)"
                          required
                        />
                        <input
                          type="text"
                          className="admin-form-input"
                          value={q.options[1]}
                          onChange={(e) => handleOptionChange(idx, 1, false, e.target.value)}
                          placeholder="Option B (খ)"
                          required
                        />
                      </div>
                      <div className="admin-form-row">
                        <input
                          type="text"
                          className="admin-form-input"
                          value={q.options[2]}
                          onChange={(e) => handleOptionChange(idx, 2, false, e.target.value)}
                          placeholder="Option C (গ)"
                          required
                        />
                        <input
                          type="text"
                          className="admin-form-input"
                          value={q.options[3]}
                          onChange={(e) => handleOptionChange(idx, 3, false, e.target.value)}
                          placeholder="Option D (ঘ)"
                          required
                        />
                      </div>

                      {/* Options English */}
                      <div className="admin-form-label" style={{ marginTop: '12px', marginBottom: '8px' }}>MCQ Options (English)</div>
                      <div className="admin-form-row" style={{ marginBottom: '8px' }}>
                        <input
                          type="text"
                          className="admin-form-input"
                          value={q.optionsEn[0]}
                          onChange={(e) => handleOptionChange(idx, 0, true, e.target.value)}
                          placeholder="Option A (English)"
                          required
                        />
                        <input
                          type="text"
                          className="admin-form-input"
                          value={q.optionsEn[1]}
                          onChange={(e) => handleOptionChange(idx, 1, true, e.target.value)}
                          placeholder="Option B (English)"
                          required
                        />
                      </div>
                      <div className="admin-form-row">
                        <input
                          type="text"
                          className="admin-form-input"
                          value={q.optionsEn[2]}
                          onChange={(e) => handleOptionChange(idx, 2, true, e.target.value)}
                          placeholder="Option C (English)"
                          required
                        />
                        <input
                          type="text"
                          className="admin-form-input"
                          value={q.optionsEn[3]}
                          onChange={(e) => handleOptionChange(idx, 3, true, e.target.value)}
                          placeholder="Option D (English)"
                          required
                        />
                      </div>

                      <div className="admin-form-row" style={{ marginTop: '12px' }}>
                        <div className="admin-form-group">
                          <label className="admin-form-label">Correct Option Index (0-3)</label>
                          <select
                            className="admin-form-input admin-form-select"
                            value={q.correctIndex}
                            onChange={(e) => handleQuestionFieldChange(idx, 'correctIndex', Number(e.target.value))}
                          >
                            <option value={0}>Option A (ক)</option>
                            <option value={1}>Option B (খ)</option>
                            <option value={2}>Option C (গ)</option>
                            <option value={3}>Option D (ঘ)</option>
                          </select>
                        </div>
                      </div>

                      <div className="admin-form-row">
                        <div className="admin-form-group">
                          <label className="admin-form-label">Explanation (Bengali)</label>
                          <textarea
                            className="admin-form-input admin-form-textarea"
                            value={q.explanation}
                            onChange={(e) => handleQuestionFieldChange(idx, 'explanation', e.target.value)}
                            placeholder="সঠিক উত্তরের ব্যাখ্যা..."
                          />
                        </div>
                        <div className="admin-form-group">
                          <label className="admin-form-label">Explanation (English)</label>
                          <textarea
                            className="admin-form-input admin-form-textarea"
                            value={q.explanationEn}
                            onChange={(e) => handleQuestionFieldChange(idx, 'explanationEn', e.target.value)}
                            placeholder="Explanation of correct answer..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
