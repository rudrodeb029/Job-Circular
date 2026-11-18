import React, { useState, useMemo } from 'react';
import { useAdminContext } from '../../context/AdminContext';
import { getDocument, setDocument, updateDocument, COLLECTIONS } from '../../services/supabaseService';
import { formatTimeAgo } from '../../utils/timeUtils';
import RichTextEditor, { RichTextToolbar, RichInput } from '../../components/RichTextEditor';

const parseTimestampMs = (val) => {
  if (!val) return 0;
  if (typeof val === 'number') return Number.isFinite(val) && val > 0 ? val : 0;
  if (typeof val?.toDate === 'function') {
    const ms = val.toDate().getTime();
    return Number.isFinite(ms) && ms > 0 ? ms : 0;
  }
  if (typeof val?.seconds === 'number') return val.seconds * 1000;
  const ms = new Date(val).getTime();
  return Number.isFinite(ms) && ms > 0 ? ms : 0;
};

const getPaperUpdatedMs = (paper) => {
  if (!paper) return 0;
  const updatedMs = parseTimestampMs(paper.updatedAt);
  if (updatedMs > 0) return updatedMs;
  const createdMs = parseTimestampMs(paper.createdAt);
  if (createdMs > 0) return createdMs;
  const idMatch = paper.id ? String(paper.id).match(/\d{10,13}/) : null;
  return idMatch ? parseInt(idMatch[0], 10) : 0;
};

const getPaperCreatedMs = (paper) => {
  if (!paper) return 0;
  const createdMs = parseTimestampMs(paper.createdAt);
  if (createdMs > 0) return createdMs;
  const idMatch = paper.id ? String(paper.id).match(/\d{10,13}/) : null;
  return idMatch ? parseInt(idMatch[0], 10) : 0;
};

const isPaperUpdated = (paper) => {
  const updatedMs = parseTimestampMs(paper?.updatedAt);
  const createdMs = parseTimestampMs(paper?.createdAt);
  return updatedMs > 0 && createdMs > 0 && (updatedMs - createdMs > 1000);
};

const formatExactDateTime = (timestamp) => {
  const ms = parseTimestampMs(timestamp);
  if (!ms) return 'N/A';
  return new Date(ms).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
};

export default function ManageQuestions() {
  const { state, dispatch } = useAdminContext();
  const papers = state.questions || [];
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [showForm, setShowForm] = useState(false);
  const [currentPaper, setCurrentPaper] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [loadingPaper, setLoadingPaper] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fields for adding/editing paper
  const [title, setTitle] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [category, setCategory] = useState('bcs');
  const [date, setDate] = useState('');
  const [dateEn, setDateEn] = useState('');
  const [timeLimitEn, setTimeLimitEn] = useState('10 Mins');
  const [questions, setQuestions] = useState([
    {
      id: 'q-1',
      question: '',
      questionEn: '',
      options: ['', '', '', ''],
      optionsEn: ['', '', '', ''],
      correctIndex: -1,
      explanation: '',
      explanationEn: ''
    }
  ]);
  const [bulkInput, setBulkInput] = useState('');

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
    setTimeLimitEn('10 Mins');
    setQuestions([
      {
        id: `q-${Date.now()}-1`,
        question: '',
        questionEn: '',
        options: ['', '', '', ''],
        optionsEn: ['', '', '', ''],
        correctIndex: -1,
        explanation: '',
        explanationEn: ''
      }
    ]);
    setShowForm(true);
  };

  const handleOpenEdit = async (paper) => {
    setLoadingPaper(true);
    try {
      const fullDoc = await getDocument(COLLECTIONS.QUESTIONS, paper.id, true);
      const activePaper = fullDoc || paper;

      setCurrentPaper(activePaper);
      setTitle(activePaper.title || '');
      setTitleEn(activePaper.titleEn || '');
      setCategory(activePaper.category || 'bcs');
      setDate(activePaper.date || '');
      setDateEn(activePaper.dateEn || '');
      setTimeLimitEn(activePaper.timeLimitEn || '10 Mins');
      setQuestions(activePaper.questions && activePaper.questions.length > 0 ? activePaper.questions : [
        {
          id: `q-${Date.now()}-1`,
          question: '',
          questionEn: '',
          options: ['', '', '', ''],
          optionsEn: ['', '', '', ''],
          correctIndex: -1,
          explanation: '',
          explanationEn: ''
        }
      ]);
      setShowForm(true);
    } catch (e) {
      console.error(e);
      triggerToast('Failed to load paper details.', 'error');
    } finally {
      setLoadingPaper(false);
    }
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
        correctIndex: -1,
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

  const handleBulkImport = () => {
    if (!bulkInput.trim()) return;

    const lines = bulkInput.trim().split('\n');
    const newQuestions = lines.map((line, index) => {
      let parts = line.split(',,').map(p => p.trim());
      if (parts.length < 6) {
        parts = line.split(',').map(p => p.trim());
      }
      if (parts.length < 6) return null;

      const question = parts[0];
      const opt1 = parts[1];
      const opt2 = parts[2];
      const opt3 = parts[3];
      const opt4 = parts[4];
      const correctVal = parts[5];
      const explanation = parts.slice(6).join(', ').replace(/\|/g, '').trim();

      const cleanOpt = (opt) => (opt || '').replace(/^[\(\[]?\s*([a-d]|[ক-ঘ]|[1-4])\s*[\)\.\:]?\s*/i, '').trim();
      const cleanedOptions = [cleanOpt(opt1), cleanOpt(opt2), cleanOpt(opt3), cleanOpt(opt4)];

      let finalIndex = -1;
      const cleanVal = String(correctVal || '').toLowerCase().trim();

      if (cleanVal.includes('ক') || cleanVal === 'a' || cleanVal === '0') finalIndex = 0;
      else if (cleanVal.includes('খ') || cleanVal === 'b' || cleanVal === '1') finalIndex = 1;
      else if (cleanVal.includes('গ') || cleanVal === 'c' || cleanVal === '2') finalIndex = 2;
      else if (cleanVal.includes('ঘ') || cleanVal === 'd' || cleanVal === '3') finalIndex = 3;
      else {
        const matchedIdx = cleanedOptions.findIndex(o => o && o.toLowerCase() === cleanVal);
        if (matchedIdx !== -1) {
          finalIndex = matchedIdx;
        } else {
          const parsed = parseInt(cleanVal, 10);
          finalIndex = isNaN(parsed) ? -1 : Math.min(3, Math.max(0, parsed));
        }
      }

      return {
        id: `q-bulk-${Date.now()}-${index}`,
        question: question || '',
        questionEn: '',
        options: cleanedOptions,
        optionsEn: ['', '', '', ''],
        correctIndex: finalIndex,
        explanation: explanation || '',
        explanationEn: ''
      };
    }).filter(q => q !== null);

    if (newQuestions.length > 0) {
      setQuestions(prev => {
        if (prev.length === 1 && !prev[0].question && prev[0].options.every(o => !o)) {
          return newQuestions;
        }
        return [...prev, ...newQuestions];
      });
      setBulkInput('');
      triggerToast(`${newQuestions.length} questions imported successfully!`);
    } else {
      triggerToast('Invalid format. Use double comma (,,) pattern: Question,, (ক) Opt1,, (খ) Opt2,, (গ) Opt3,, (ঘ) Opt4,, CorrectIndex(ক-ঘ),, Explanation', 'error');
    }
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

  const handleSave = async (e) => {
    e.preventDefault();
    if (saving) return;

    const generateBengaliTime = (timeStr) => {
      if (!timeStr) return '';
      const bengaliDigits = {'0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'};
      let converted = timeStr.split('').map(char => bengaliDigits[char] || char).join('');
      converted = converted.replace(/Mins|Min|minutes|minute/gi, 'মিনিট');
      converted = converted.replace(/Hours|Hour|hrs|hr/gi, 'ঘণ্টা');
      return converted;
    };

    const nowIso = new Date().toISOString();
    const { raw_data, ...existingPaperFields } = currentPaper || {};

    const paperData = {
      ...existingPaperFields,
      id: currentPaper ? currentPaper.id : `paper-${Date.now()}`,
      category,
      title,
      titleEn,
      date,
      dateEn,
      totalQuestions: String(questions.length),
      timeLimit: generateBengaliTime(timeLimitEn),
      timeLimitEn,
      questions,
      createdAt: currentPaper ? (currentPaper.createdAt || nowIso) : nowIso,
      updatedAt: nowIso
    };

    setSaving(true);
    try {
      if (currentPaper) {
        await updateDocument(COLLECTIONS.QUESTIONS, paperData.id, paperData);
        dispatch({ type: 'UPDATE_QUESTION_PAPER', payload: paperData });
        triggerToast('Question paper updated successfully!');
      } else {
        await setDocument(COLLECTIONS.QUESTIONS, paperData.id, paperData);
        dispatch({ type: 'ADD_QUESTION_PAPER', payload: paperData });
        triggerToast('New question paper created successfully!');
      }
      setShowForm(false);
    } catch (error) {
      console.error('Failed to save question paper:', error);
      triggerToast('Failed to save question paper. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const latestUpdatedPaper = useMemo(() => {
    if (!papers || papers.length === 0) return null;
    return papers.reduce((latest, paper) => {
      if (!latest) return paper;
      return getPaperUpdatedMs(paper) > getPaperUpdatedMs(latest) ? paper : latest;
    }, null);
  }, [papers]);

  const sortedFilteredPapers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return papers
      .filter((p) => {
        const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
        const matchesQuery =
          !query ||
          (p.title || '').toLowerCase().includes(query) ||
          (p.titleEn || '').toLowerCase().includes(query);
        return matchesCat && matchesQuery;
      })
      .sort((a, b) => {
        const tsA = sortBy === 'createdAt' ? getPaperCreatedMs(a) : getPaperUpdatedMs(a);
        const tsB = sortBy === 'createdAt' ? getPaperCreatedMs(b) : getPaperUpdatedMs(b);
        if (tsB !== tsA) return tsB - tsA;
        return String(b.id || '').localeCompare(String(a.id || ''));
      });
  }, [papers, categoryFilter, searchQuery, sortBy]);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this question paper?')) {
      dispatch({ type: 'DELETE_QUESTION_PAPER', payload: id });
      triggerToast('Question paper deleted.');
    }
  };

  const getCategoryLabel = (cat) => {
    const labels = {
      bcs: 'BCS',
      bank: 'Bank',
      ntrca: 'NTRCA',
      primary: 'Primary',
      ministry: 'Ministries',
      recent: 'Admission',
      admission: 'Admission',
      subjectwise: 'Subjectwise Questions'
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
        .last-updated-summary { background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%); border: 1px solid #dbeafe; border-left: 3px solid #2563eb; border-radius: 12px; padding: 12px 16px; margin-bottom: 1.5rem; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; }
        .last-updated-summary .cat-pill { padding: 2px 7px; border-radius: 5px; font-size: 9.5px; font-weight: 500; }
        .timestamp-pill { display: inline-flex; align-items: center; gap: 4px; padding: 3px 7px; border-radius: 6px; font-size: 10px; font-weight: 400; background: #f8fafc; color: #475569; border: 1px solid #e2e8f0; }
        .timestamp-pill.is-updated { background: #f0fdf4; color: #166534; border-color: #bbf7d0; }
        .updated-badge { display: inline-flex; align-items: center; padding: 1px 6px; border-radius: 999px; font-size: 9px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.02em; background: #dcfce7; color: #15803d; }
        .created-badge { display: inline-flex; align-items: center; padding: 1px 6px; border-radius: 999px; font-size: 9px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.02em; background: #eff6ff; color: #1d4ed8; }
        .input-group label { display: block; font-size: 13px; font-weight: 700; color: #475569; margin-bottom: 8px; }
        .modern-input { width: 100%; padding: 12px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px; outline: none; transition: border-color 0.2s; }
        .modern-input:focus { border-color: #2563eb; }
        .q-row-card { background: #f8fafc; border-radius: 16px; border: 1.5px solid #e2e8f0; padding: 24px; margin-bottom: 24px; position: relative; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {toast.show && (
        <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 3000, background: toast.type === 'error' ? '#ef4444' : '#10b981', color: 'white', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, boxShadow: '0 10px 25px rgba(0,0,0,0.1)', animation: 'slideInRight 0.3s' }}>
          {toast.message}
        </div>
      )}

      {loadingPaper && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', padding: '24px 40px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '16px', fontWeight: 700, color: '#1e293b' }}>
            <span className="spinner" style={{ width: '20px', height: '20px', border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'inline-block' }}></span>
            <span>Fetching question details...</span>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Questions Bank</h1>
        </div>
        <button onClick={() => showForm ? setShowForm(false) : handleOpenAdd()} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', background: showForm ? '#f1f5f9' : 'linear-gradient(135deg, #1a56db 0%, #2563eb 100%)', color: showForm ? '#475569' : 'white', border: 'none', borderRadius: '14px', cursor: 'pointer', fontWeight: 700, boxShadow: showForm ? 'none' : '0 8px 16px rgba(37, 99, 235, 0.2)', transition: 'all 0.2s' }}>
          {showForm ? 'View All Papers' : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Create Paper
            </>
          )}
        </button>
      </div>

      {showForm ? (
        <>
          <RichTextToolbar />
          <div className="admin-card animate-fade-in" style={{ padding: '40px' }}>
          <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{currentPaper ? 'Edit Question Paper' : 'New Question Paper'}</h2>
              {currentPaper && (
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', fontWeight: 600 }}>
                  Last updated: {formatExactDateTime(getPaperUpdatedMs(currentPaper))}
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
              <div className="input-group">
                <label>Title (Bengali)</label>
                <RichInput value={title} onChange={setTitle} placeholder="প্রশ্নের শিরোনাম লিখুন..." />
              </div>
              <div className="input-group">
                <label>Category</label>
                <select className="modern-input" value={category} onChange={e => setCategory(e.target.value)}>
                  {['bcs', 'bank', 'ntrca', 'primary', 'ministry', 'recent', 'subjectwise'].map(c => <option key={c} value={c}>{getCategoryLabel(c)}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Time Limit (e.g. 10 Mins)</label>
                <input className="modern-input" value={timeLimitEn} onChange={e => setTimeLimitEn(e.target.value)} required />
              </div>
              <div className="input-group">
                <label>Exam Date (Bengali)</label>
                <input className="modern-input" value={date} onChange={e => setDate(e.target.value)} placeholder="৩০ জানুয়ারি ২০২৬" />
              </div>
              <div className="input-group">
                <label>Exam Date (English)</label>
                <input className="modern-input" value={dateEn} onChange={e => setDateEn(e.target.value)} placeholder="30 Jan 2026" />
              </div>
            </div>

            <div style={{ borderTop: '2px solid #f1f5f9', paddingTop: '32px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '24px' }}>Configure MCQ Questions ({questions.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                 {questions.map((qn, qIndex) => (
                    <div key={qIndex} className="q-row-card">
                       <button type="button" onClick={() => handleRemoveQuestionRow(qIndex)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#ef4444', fontWeight: 700, cursor: 'pointer', fontSize: '12px' }}>Remove MCQ</button>
                       <h4 style={{ margin: '0 0 16px 0', color: '#1a56db', fontSize: '14px', fontWeight: 800 }}>MCQ Question #{qIndex + 1}</h4>

                       <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', marginBottom: '20px' }}>
                          <div className="input-group">
                             <label>Question Text (Bengali - Rich Text Editor)</label>
                             <RichTextEditor
                                value={qn.question}
                                onChange={val => handleQuestionFieldChange(qIndex, 'question', val)}
                                placeholder="প্রশ্নটির বিস্তারিত বর্ণনা বা ফরম্যাটিং লিখুন (Bold, Italics, Lists, Alignment)..."
                                minHeight="120px"
                             />
                          </div>
                       </div>

                       <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', marginBottom: '20px' }}>
                          <div>
                             <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '8px', display: 'block' }}>Options (Bengali)</label>
                             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                {qn.options.map((opt, oIdx) => (
                                   <RichInput key={oIdx} value={opt} onChange={val => handleOptionChange(qIndex, oIdx, false, val)} placeholder={`বিকল্প ${oIdx + 1}`} />
                                ))}
                             </div>
                          </div>
                       </div>

                       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                          <div>
                             <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px', display: 'block' }}>Correct Choice (optional)</label>
                             <select
                                className="modern-input"
                                value={typeof qn.correctIndex === 'number' && qn.correctIndex >= 0 && qn.correctIndex < 4 ? qn.correctIndex : -1}
                                onChange={e => handleQuestionFieldChange(qIndex, 'correctIndex', parseInt(e.target.value, 10))}
                             >
                                <option value="-1">No Answer (not set) / কোনো উত্তর নির্বাচন করা হয়নি</option>
                                <option value="0">Option 1 / ক</option>
                                <option value="1">Option 2 / খ</option>
                                <option value="2">Option 3 / গ</option>
                                <option value="3">Option 4 / ঘ</option>
                             </select>
                          </div>
                          <div>
                             <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px', display: 'block' }}>Explanation (ব্যাখ্যা - Rich Text Editor)</label>
                             <RichTextEditor
                                value={qn.explanation || ''}
                                onChange={val => handleQuestionFieldChange(qIndex, 'explanation', val)}
                                placeholder="প্রশ্নটির সহজ সমাধান বা বিস্তারিত ব্যাখ্যা লিখুন (ঐচ্ছিক)..."
                                minHeight="120px"
                             />
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
              <button type="button" onClick={handleAddQuestionRow} style={{ marginTop: '8px', width: '100%', padding: '14px', background: '#f8fafc', border: '1.5px dashed #cbd5e1', borderRadius: '12px', color: '#1a56db', fontWeight: 700, cursor: 'pointer' }}>+ Add MCQ Question Row</button>
            </div>

            {/* Bulk Import Section */}
            <div style={{ borderTop: '2px solid #f1f5f9', marginTop: '40px', paddingTop: '32px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '16px' }}>🚀 Bulk MCQ Import</h3>
              <p style={{ color: '#475569', fontSize: '12px', marginBottom: '16px', lineHeight: 1.5 }}>
                Format (Double Comma <code>,,</code> Separated):<br/>
                <strong>Question,, (ক) Option1,, (খ) Option2,, (গ) Option3,, (ঘ) Option4,, CorrectChoice(ক-ঘ),, Explanation</strong><br/>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Place each new question on its own line.</span>
              </p>
              <textarea
                className="modern-input"
                style={{ height: '140px', resize: 'vertical', background: '#fcfcfc', marginBottom: '16px', fontSize: '13px', lineHeight: 1.5 }}
                placeholder="কোন বিষয়টি মুদ্রাপাচারের অন্তর্ভুক্ত নয়?,,(ক) রপ্তানী পণ্যের অবমূল্যায়ন ,,(খ) আমদানী পণ্যের অধিক মূল্য নির্ধারণ ,,(গ) আয়কর ফাঁকি দেয়া ,,(ঘ) অবৈধ চ্যানেলে বিদেশে টাকা পাঠানো,,গ,,ব্যাখ্যা: প্রচলিত আন্তর্জাতিক বাণিজ্য ও মানিলন্ডারিং প্রতিরোধ আইন অনুযায়ী কেবল 'আয়কর ফাঁকি দেওয়া' (Tax Evasion)..."
                value={bulkInput}
                onChange={e => setBulkInput(e.target.value)}
              />
              <button
                type="button"
                onClick={handleBulkImport}
                style={{ width: '100%', padding: '12px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 6px rgba(79, 70, 229, 0.2)' }}
              >
                ⚡ Process & Import Questions
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '40px', borderTop: '2px solid #f1f5f9', paddingTop: '32px' }}>
              <button type="button" disabled={saving} onClick={() => setShowForm(false)} style={{ padding: '14px 32px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: 'white', fontWeight: 700, color: '#64748b', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}>Discard</button>
              <button type="submit" disabled={saving} style={{ padding: '14px 32px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #1a56db 0%, #2563eb 100%)', color: 'white', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.75 : 1, boxShadow: '0 8px 16px rgba(37, 99, 235, 0.2)' }}>
                {saving ? 'Saving...' : 'Save Question Paper'}
              </button>
            </div>
          </form>
        </div>
        </>
      ) : (
        <>
          <div className="last-updated-summary" data-testid="last-updated-summary">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span style={{ fontSize: '9.5px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#1d4ed8' }}>
                  Last Updated Question Paper
                </span>
                {latestUpdatedPaper && (
                  <span className={isPaperUpdated(latestUpdatedPaper) ? 'updated-badge' : 'created-badge'}>
                    {isPaperUpdated(latestUpdatedPaper) ? 'Updated' : 'Created'}
                  </span>
                )}
              </div>
              {latestUpdatedPaper ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', fontWeight: 500, color: '#0f172a' }}>
                    {latestUpdatedPaper.title || latestUpdatedPaper.titleEn || 'Untitled Paper'}
                  </span>
                  {latestUpdatedPaper.titleEn && latestUpdatedPaper.title && latestUpdatedPaper.titleEn !== latestUpdatedPaper.title && (
                    <span style={{ fontSize: '10.5px', fontWeight: 400, color: '#475569' }}>
                      ({latestUpdatedPaper.titleEn})
                    </span>
                  )}
                  <span className="cat-pill">{getCategoryLabel(latestUpdatedPaper.category || '')}</span>
                  <span style={{ fontSize: '10px', fontWeight: 400, color: '#64748b' }}>
                    {Array.isArray(latestUpdatedPaper.questions) ? latestUpdatedPaper.questions.length : (latestUpdatedPaper.totalQuestions || 0)} MCQs
                  </span>
                </div>
              ) : (
                <div style={{ fontSize: '11px', fontWeight: 400, color: '#64748b' }}>
                  No question papers recorded yet.
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
              {latestUpdatedPaper ? (
                <>
                  <span className={`timestamp-pill ${isPaperUpdated(latestUpdatedPaper) ? 'is-updated' : ''}`}>
                    {formatExactDateTime(getPaperUpdatedMs(latestUpdatedPaper))}
                  </span>
                  <span style={{ fontSize: '9.5px', fontWeight: 400, color: '#64748b' }}>
                    {formatTimeAgo(getPaperUpdatedMs(latestUpdatedPaper), true)} • {papers.length} Total Papers
                  </span>
                </>
              ) : (
                <span style={{ fontSize: '10px', fontWeight: 400, color: '#64748b' }}>0 Total Papers</span>
              )}
            </div>
          </div>

          <div className="admin-card" style={{ padding: '24px', marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
               <svg style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
               <input placeholder="Search question papers..." style={{ width: '100%', padding: '14px 48px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', outline: 'none' }} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <select style={{ padding: '14px 20px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', outline: 'none', fontWeight: 600 }} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
               <option value="all">All Categories</option>
               {['bcs', 'bank', 'ntrca', 'primary', 'ministry', 'recent', 'subjectwise'].map(c => <option key={c} value={c}>{getCategoryLabel(c)}</option>)}
            </select>
            <select aria-label="Sort question papers" style={{ padding: '14px 20px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', outline: 'none', fontWeight: 600 }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
               <option value="updatedAt">Sort: Recently Updated</option>
               <option value="createdAt">Sort: Created Date</option>
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
                  <th>Last Updated</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedFilteredPapers.map(paper => {
                  const lastUpdatedMs = getPaperUpdatedMs(paper);
                  const updated = isPaperUpdated(paper);
                  const formattedLastUpdated = formatExactDateTime(lastUpdatedMs);
                  return (
                    <tr key={paper.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#1e293b' }}>{paper.title || paper.titleEn || 'Untitled Paper'}</div>
                        {paper.titleEn && paper.title && paper.titleEn !== paper.title && (
                          <div style={{ fontSize: '12px', color: '#64748b' }}>{paper.titleEn}</div>
                        )}
                      </td>
                      <td><span className="cat-pill">{paper.category}</span></td>
                      <td style={{ color: '#475569', fontWeight: 600 }}>{paper.dateEn || paper.date || 'N/A'}</td>
                      <td style={{ color: '#475569', fontWeight: 600 }}>{paper.timeLimitEn}</td>
                      <td>
                        {lastUpdatedMs > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <span className={`timestamp-pill ${updated ? 'is-updated' : ''}`}>
                                {formattedLastUpdated}
                              </span>
                              {updated && <span className="updated-badge">Updated</span>}
                            </div>
                            <span style={{ fontSize: '9.5px', color: '#64748b', fontWeight: 400 }}>
                              {formatTimeAgo(lastUpdatedMs, true)}
                            </span>
                          </div>
                        ) : (
                          <span className="timestamp-pill">N/A</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                         <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button onClick={() => handleOpenEdit(paper)} style={{ padding: '8px 16px', background: '#eff6ff', color: '#1a56db', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>Edit</button>
                            <button onClick={() => handleDelete(paper.id)} style={{ padding: '8px 16px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>Delete</button>
                         </div>
                      </td>
                    </tr>
                  );
                })}
                {sortedFilteredPapers.length === 0 && (
                  <tr><td colSpan="6" style={{ padding: '60px', textAlign: 'center', color: '#94a3b8', fontSize: '15px' }}>No question papers found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
