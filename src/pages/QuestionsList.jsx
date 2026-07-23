import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, FileText } from '../components/Icons';
import { useAppContext } from '../context/AppContext';
import { getQuestionsByCategory } from '../data/questionsData';
import BottomNav from '../components/BottomNav';
import SearchBar from '../components/SearchBar';

const categoryTitlesBn = {
  bcs: 'বিসিএস প্রিলিমিনারি প্রশ্নপত্র',
  bank: 'ব্যাংক নিয়োগ পরীক্ষার প্রশ্নপত্র',
  ntrca: 'NTRCA শিক্ষক নিবন্ধন প্রশ্নপত্র',
  primary: 'প্রাইমারি শিক্ষক নিয়োগ প্রশ্নপত্র',
  ministry: 'বিভিন্ন মন্ত্রনালয় নিয়োগ প্রশ্নপত্র'
};

const categoryTitlesEn = {
  bcs: 'BCS Preliminary Questions',
  bank: 'Bank Recruitment Questions',
  ntrca: 'NTRCA Registration Questions',
  primary: 'Primary Teacher Recruitment Questions',
  ministry: 'Various Ministries Exam Questions'
};

const categoryIcons = {
  bcs: '🎓',
  bank: '🏦',
  ntrca: '📜',
  primary: '🏫',
  ministry: '🏛️'
};

export default function QuestionsList() {
  const { category } = useParams();
  const navigate = useNavigate();
  const { state } = useAppContext();
  const isEn = state.language === 'en';

  const [searchQuery, setSearchQuery] = useState('');

  const papers = useMemo(() => {
    return getQuestionsByCategory(category || 'bcs');
  }, [category]);

  const filteredPapers = useMemo(() => {
    if (!searchQuery.trim()) return papers;
    return papers.filter(paper => {
      const title = (paper.title || '').toLowerCase();
      const titleEn = (paper.titleEn || '').toLowerCase();
      const query = searchQuery.toLowerCase();
      return title.includes(query) || titleEn.includes(query);
    });
  }, [papers, searchQuery]);

  const displayTitle = isEn 
    ? (categoryTitlesEn[category] || 'Questions & Answers') 
    : (categoryTitlesBn[category] || 'প্রশ্নপত্র এবং উত্তর');

  const displayIcon = categoryIcons[category] || '📚';

  return (
    <div className="page" style={{ paddingBottom: '100px' }}>
      {/* Header */}
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
        </button>
        <h1 style={{ flex: 1, fontSize: '18px', fontWeight: 800 }}>{displayTitle}</h1>
      </div>

      <div className="page-content animate-fade-in">
        {/* Search */}
        <div style={{ marginBottom: 'var(--space-md)' }}>
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isEn ? "Search question papers..." : "প্রশ্নপত্র খুঁজুন..."}
          />
        </div>

        {/* Papers List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredPapers.length > 0 ? (
            filteredPapers.map(paper => (
              <div
                key={paper.id}
                style={{
                  background: 'var(--white)',
                  border: '1px solid var(--border-light)',
                  borderRadius: '16px',
                  padding: '16px',
                  boxShadow: 'var(--shadow-md)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  cursor: 'pointer'
                }}
                onClick={() => navigate(`/question-details/${paper.id}`)}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{
                    fontSize: '28px',
                    width: '50px',
                    height: '50px',
                    borderRadius: '12px',
                    background: 'var(--primary-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {displayIcon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{
                      fontSize: '15px',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      marginBottom: '6px',
                      lineHeight: '1.4'
                    }}>
                      {isEn ? paper.titleEn : paper.title}
                    </h3>
                    
                    {/* Meta information tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                      <span style={{
                        fontSize: '11px',
                        color: 'var(--primary)',
                        background: 'var(--primary-bg)',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontWeight: 600
                      }}>
                        📅 {isEn ? paper.dateEn : paper.date}
                      </span>
                      <span style={{
                        fontSize: '11px',
                        color: '#059669',
                        background: '#ecfdf5',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontWeight: 600
                      }}>
                        📝 {isEn ? `${paper.questions.length} Questions` : `${toBengaliNumber(paper.questions.length)}টি প্রশ্ন`}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--border-light)',
                  marginTop: '4px'
                }}>
                  <span style={{
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    🕒 {isEn ? `Time: ${paper.timeLimitEn}` : `সময়: ${paper.timeLimit}`}
                  </span>
                  
                  <span style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {isEn ? 'Practice Now' : 'অনুশীলন করুন'} ➔
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <span style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>📂</span>
              <p style={{ fontSize: '14px', fontWeight: 600 }}>
                {isEn ? 'No question papers found' : 'কোনো প্রশ্নপত্র পাওয়া যায়নি'}
              </p>
            </div>
          )}
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
