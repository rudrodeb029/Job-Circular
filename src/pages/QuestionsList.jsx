import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from '../components/Icons';
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

const renderCategoryIcon = (category) => {
  const size = 18;
  const strokeColor = 'var(--primary)';
  
  switch(category) {
    case 'bcs':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5-10 5z"></path>
          <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"></path>
        </svg>
      );
    case 'bank':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="10" width="18" height="12" rx="2"></rect>
          <path d="M3 10L12 3l9 7M12 21V10M8 21V10M16 21V10"></path>
        </svg>
      );
    case 'ntrca':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
        </svg>
      );
    case 'primary':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
        </svg>
      );
    case 'ministry':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 22h16"></path>
          <path d="M20 22V7.5L12 3 4 7.5V22"></path>
          <path d="M12 22V12"></path>
          <path d="M8 12h8"></path>
        </svg>
      );
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        </svg>
      );
  }
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

  return (
    <div className="page" style={{ paddingBottom: '100px' }}>
      {/* Header */}
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
        </button>
        <h1 style={{ flex: 1, fontSize: '15px', fontWeight: 800 }}>{displayTitle}</h1>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredPapers.length > 0 ? (
            filteredPapers.map(paper => (
              <div
                key={paper.id}
                style={{
                  background: 'var(--white)',
                  border: '1px solid var(--border-light)',
                  borderRadius: '14px',
                  padding: '14px',
                  boxShadow: '0 4px 14px rgba(15, 23, 42, 0.02)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onClick={() => navigate(`/question-details/${paper.id}`)}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'var(--primary-lightest)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {renderCategoryIcon(category)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: 'var(--text-secondary)',
                      marginBottom: '4px',
                      lineHeight: '1.4'
                    }}>
                      {isEn ? paper.titleEn : paper.title}
                    </h3>
                    
                    {/* Meta information tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                      <span style={{
                        fontSize: '10px',
                        color: 'var(--primary)',
                        background: 'rgba(26, 86, 219, 0.05)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center'
                      }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '3px' }}>
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        {isEn ? paper.dateEn : paper.date}
                      </span>
                      <span style={{
                        fontSize: '10px',
                        color: '#059669',
                        background: 'rgba(16, 185, 129, 0.05)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center'
                      }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '3px' }}>
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                        </svg>
                        {isEn ? `${paper.questions.length} Questions` : `${toBengaliNumber(paper.questions.length)}টি প্রশ্ন`}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '10px',
                  borderTop: '1px solid var(--border-light)',
                  marginTop: '4px'
                }}>
                  <span style={{
                    fontSize: '11px',
                    color: 'var(--text-secondary)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    {isEn ? `Time: ${paper.timeLimitEn}` : `সময়: ${paper.timeLimit}`}
                  </span>
                  
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: 'var(--primary)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span>{isEn ? 'Practice Now' : 'অনুশীলন করুন'}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '12px', opacity: 0.5 }}>
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              </svg>
              <p style={{ fontSize: '13px', fontWeight: 600 }}>
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
