import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Clock, LayoutGrid, FileText, ChevronRight } from '../components/Icons';
import { useAppContext } from '../context/AppContext';
import { getQuestionsData } from '../data/questionsData';
import BottomNav from '../components/BottomNav';
import SearchBar from '../components/SearchBar';
import { formatTimeAgo } from '../utils/timeUtils';

const categoryConfig = {
  bcs: { name: 'বিসিএস', nameEn: 'BCS', color: 'rgba(26, 86, 219, 0.05)', icon: '🎓' },
  bank: { name: 'ব্যাংক', nameEn: 'Bank', color: 'rgba(16, 185, 129, 0.05)', icon: '🏦' },
  ntrca: { name: 'NTRCA', nameEn: 'NTRCA', color: 'rgba(139, 92, 246, 0.05)', icon: '📜' },
  primary: { name: 'প্রাইমারি', nameEn: 'Primary', color: 'rgba(236, 72, 153, 0.05)', icon: '🏫' },
  ministry: { name: 'বিভিন্ন মন্ত্রনালয়', nameEn: 'Ministries', color: 'rgba(6, 182, 212, 0.05)', icon: '🏛️' }
};

export default function QuestionsHub() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state } = useAppContext();
  const isEn = state.language === 'en';

  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [papers, setPapers] = useState([]);
  
  const allCategories = useMemo(() => {
    const config = { ...categoryConfig };
    papers.forEach(p => {
      if (p.category && !config[p.category]) {
        config[p.category] = {
          name: p.categoryName || p.category,
          nameEn: p.categoryNameEn || p.category,
          color: 'rgba(139, 92, 246, 0.05)',
          icon: '📝'
        };
      }
    });
    return config;
  }, [papers]);
 
  useEffect(() => {
    setPapers(getQuestionsData());
    const handleUpdate = () => {
      setPapers(getQuestionsData());
    };
    window.addEventListener('questions_updated', handleUpdate);
    return () => {
      window.removeEventListener('questions_updated', handleUpdate);
    };
  }, []);

  const filteredPapers = useMemo(() => {
    let list = papers;
    if (activeCategory !== 'all') {
      list = list.filter(p => p.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => 
        (p.title || '').toLowerCase().includes(q) || 
        (p.titleEn || '').toLowerCase().includes(q)
      );
    }

    const getItemTimestamp = (item) => {
      if (item.createdAt) return new Date(item.createdAt).getTime();
      if (item.id) {
        const matches = String(item.id).match(/\d{10,13}/);
        if (matches) return parseInt(matches[0], 10);
      }
      return 0;
    };

    // Sort LIFO
    return [...list].sort((a, b) => {
      const tsA = getItemTimestamp(a);
      const tsB = getItemTimestamp(b);
      if (tsA !== tsB) return tsB - tsA; // Newest first (LIFO)
      return String(b.id || '').localeCompare(String(a.id || ''));
    });
  }, [activeCategory, searchQuery, papers]);

  return (
    <div className="page" style={{ paddingBottom: '100px', background: 'var(--bg)' }}>
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/home')}>
          <ArrowLeft size={22} />
        </button>
        <h1 style={{ flex: 1, fontSize: '15px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={18} color="var(--primary)" />
          <span>{isEn ? 'MCQ Exam & Questions' : 'MCQ Exam ও প্রশ্নব্যাংক'}</span>
        </h1>
      </div>

      <div className="page-content animate-fade-in" style={{ padding: '16px' }}>
        
        {/* SECTION 1: Live MCQ Exam Quick Link */}
        <div style={{ marginBottom: '24px' }}>
          <div className="section-header" style={{ marginBottom: '14px' }}>
            <h3 className="section-title" style={{
              color: 'var(--text-secondary)',
              background: 'rgba(26, 86, 219, 0.04)',
              borderLeft: '4px solid var(--primary)',
              padding: '6px 14px',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '13.5px'
            }}>
              <span>{isEn ? 'Live MCQ Exam' : 'লাইভ এমসিকিউ পরীক্ষা'}</span>
            </h3>
            <button
              onClick={() => navigate('/live-exams-list')}
              style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              <span>{isEn ? 'View All' : 'সব দেখুন'} ➔</span>
            </button>
          </div>

          <div
            onClick={() => navigate('/live-exams-list')}
            style={{
              background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
              borderRadius: '16px',
              padding: '20px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 8px 24px rgba(30, 64, 175, 0.2)'
            }}
          >
            <div>
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800 }}>{isEn ? 'Participate in Live Exams' : 'লাইভ পরীক্ষায় অংশ নিন'}</h4>
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', opacity: 0.9 }}>{isEn ? 'Daily routine mock tests and ranking' : 'প্রতিদিনের রুটিন ভিত্তিক লাইভ পরীক্ষা'}</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '12px' }}>
              <Clock size={20} color="white" />
            </div>
          </div>
        </div>

        {/* SECTION 2: Q&A Categories */}
        <div style={{ marginBottom: '24px' }}>
          <div className="section-header" style={{ marginBottom: '14px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(26, 86, 219, 0.04)',
              padding: '6px 14px 6px 10px',
              borderRadius: '10px',
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid rgba(26, 86, 219, 0.08)'
            }}>
              {/* Left Accent Bar */}
              <div style={{
                position: 'absolute',
                left: 0,
                top: '20%',
                bottom: '20%',
                width: '4px',
                background: 'var(--primary)',
                borderRadius: '0 4px 4px 0'
              }}></div>

              {/* Blue Dot */}
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--primary)',
                marginRight: '8px',
                marginLeft: '4px'
              }}></div>

              <h3 className="section-title" style={{ margin: 0, fontSize: '13.5px', fontWeight: 800, color: 'var(--text-secondary)' }}>
                {isEn ? 'Question Bank Categories' : 'প্রশ্নব্যাংক ক্যাটাগরি'}
              </h3>
            </div>
          </div>

          <div className="category-grid">
            <div
              className="category-grid-item"
              style={{
                background: activeCategory === 'all' ? 'var(--primary-lightest)' : 'var(--white)',
                border: activeCategory === 'all' ? '1.5px solid var(--primary)' : '1px solid var(--border-light)',
                borderRadius: '14px',
                padding: '12px 8px'
              }}
              onClick={() => setActiveCategory('all')}
            >
              <div className="category-grid-icon" style={{ background: 'rgba(26, 86, 219, 0.06)', color: 'var(--primary)', width: '36px', height: '36px', borderRadius: '10px' }}>
                <LayoutGrid size={18} />
              </div>
              <span className="category-grid-label" style={{ fontWeight: activeCategory === 'all' ? 700 : 500, fontSize: '11px' }}>
                {isEn ? 'All' : 'সব প্রশ্ন'}
              </span>
            </div>

            {Object.keys(allCategories).map(key => {
              const cat = allCategories[key];
              const isActive = activeCategory === key;
              return (
                <div
                  key={key}
                  className="category-grid-item"
                  style={{
                    background: isActive ? 'var(--primary-lightest)' : 'var(--white)',
                    border: isActive ? '1.5px solid var(--primary)' : '1px solid var(--border-light)',
                    borderRadius: '14px',
                    padding: '12px 8px'
                  }}
                  onClick={() => setActiveCategory(key)}
                >
                  <div className="category-grid-icon" style={{ background: cat.color, fontSize: '16px', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {cat.icon}
                  </div>
                  <span className="category-grid-label" style={{ fontWeight: isActive ? 700 : 500, fontSize: '11px' }}>
                    {isEn ? cat.nameEn : cat.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: Question Papers List */}
        <div>
          <div style={{ marginBottom: '14px' }}>
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isEn ? "Search inside question bank..." : "প্রশ্নব্যাংকে খুঁজুন..."}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredPapers.map(paper => (
              <div
                key={paper.id}
                style={{
                  background: 'var(--white)',
                  border: '1px solid rgba(37, 99, 235, 0.12)',
                  borderRadius: '14px',
                  padding: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onClick={() => navigate(`/question-details/${paper.id}`)}
              >
                {/* Professional Accent Border */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  bottom: 0,
                  width: '4px',
                  background: 'linear-gradient(to bottom, var(--primary), #60a5fa)',
                  borderRadius: '4px 0 0 4px'
                }}></div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary-lightest)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {categoryConfig[paper.category]?.icon || '📚'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px', lineHeight: '1.4' }}>
                      {isEn ? paper.titleEn : paper.title}
                    </h3>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                      <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f8fafc', padding: '2px 8px', borderRadius: '6px' }}>
                        📅 {isEn ? paper.dateEn : paper.date}
                      </span>
                      <span style={{ fontSize: '10.5px', color: 'var(--primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        ⏱️ {isEn ? paper.timeLimitEn : paper.timeLimit}
                      </span>
                      <span style={{ fontSize: '10.5px', color: '#059669', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        📝 {isEn ? `${paper.questions.length} Items` : `${toBengaliNumber(paper.questions.length)}টি প্রশ্ন`}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={18} color="var(--border)" style={{ marginTop: '4px' }} />
                </div>
              </div>
            ))}
            {filteredPapers.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <p>{isEn ? 'No question papers found' : 'কোনো প্রশ্নপত্র পাওয়া যায়নি'}</p>
              </div>
            )}
          </div>
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
