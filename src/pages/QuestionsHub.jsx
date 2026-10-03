import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Clock, LayoutGrid, FileText, ChevronRight } from '../components/Icons';
import {
  BcsIcon,
  BankIcon,
  NtrcaIcon,
  PrimaryIcon,
  GovIcon,
  RecentQuestionsIcon,
  SubjectwiseIcon,
  getCategoryIconComponent
} from '../components/CategoryIcons';
import { useAppContext } from '../context/AppContext';
import { useAdminContext } from '../context/AdminContext';
import SearchBar from '../components/SearchBar';
import PullToRefresh from '../components/PullToRefresh';
import ModernLoader from '../components/ModernLoader';
import QuestionCard from '../components/QuestionCard';
import { getQuestionsData } from '../data/questionsData';

const categoryConfig = {
  bcs: { name: 'বিসিএস', nameEn: 'BCS', color: 'rgba(26, 86, 219, 0.08)', icon: <BcsIcon size={20} color="#1a56db" /> },
  bank: { name: 'ব্যাংক', nameEn: 'Bank', color: 'rgba(16, 185, 129, 0.08)', icon: <BankIcon size={20} color="#10b981" /> },
  ntrca: { name: 'NTRCA', nameEn: 'NTRCA', color: 'rgba(139, 92, 246, 0.08)', icon: <NtrcaIcon size={20} color="#8b5cf6" /> },
  primary: { name: 'প্রাইমারি', nameEn: 'Primary', color: 'rgba(236, 72, 153, 0.08)', icon: <PrimaryIcon size={20} color="#ec4899" /> },
  ministry: { name: 'মন্ত্রণালয়', nameEn: 'Ministries', color: 'rgba(6, 182, 212, 0.08)', icon: <GovIcon size={20} color="#0891b2" /> },
  recent: { name: 'রিসেন্ট', nameEn: 'Recent Questions', color: 'rgba(245, 158, 11, 0.08)', icon: <RecentQuestionsIcon size={20} color="#f59e0b" /> },
  subjectwise: { name: 'বিষয়ভিত্তিক', nameEn: 'Subjectwise Questions', color: 'rgba(16, 185, 129, 0.08)', icon: <SubjectwiseIcon size={20} color="#10b981" /> }
};

export default function QuestionsHub() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state } = useAppContext();
  const { state: adminState, refreshData } = useAdminContext();
  const isEn = state.language === 'en';

  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all');
  const [isFiltering, setIsFiltering] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsFiltering(false);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const handleCategorySelect = (key) => {
    if (activeCategory === key) return;
    setIsFiltering(true);
    setActiveCategory(key);
    setTimeout(() => {
      setIsFiltering(false);
    }, 180);
  };

  const papers = (adminState.questions && adminState.questions.length > 0) ? adminState.questions : getQuestionsData();
  
  const allCategories = useMemo(() => {
    const config = { ...categoryConfig };
    papers.forEach(p => {
      if (p.category && !config[p.category]) {
        config[p.category] = {
          name: p.categoryName || p.category,
          nameEn: p.categoryNameEn || p.category,
          color: 'rgba(139, 92, 246, 0.08)',
          icon: getCategoryIconComponent(p.category, { size: 20, color: '#8b5cf6' })
        };
      }
    });
    return config;
  }, [papers]);

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
    return list;
  }, [activeCategory, searchQuery, papers]);

  return (
    <div className="page" style={{ paddingBottom: '100px', background: 'var(--bg)' }}>
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
        </button>
        <h1 style={{ flex: 1, fontSize: '15px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={18} color="var(--primary)" />
          <span>{isEn ? 'MCQ Exam & Questions' : 'MCQ Exam ও প্রশ্নব্যাংক'}</span>
        </h1>
      </div>

      <PullToRefresh onRefresh={refreshData}>
        <div className="page-content animate-fade-in" style={{ padding: '16px' }}>
        
        {/* Live MCQ Section */}
        <div style={{ marginBottom: '24px' }}>
          <div className="section-header" style={{ marginBottom: '16px' }}>
            <h3 className="section-title" style={{ margin: 0 }}>
              {isEn ? 'Live MCQ Exam' : 'লাইভ এমসিকিউ পরীক্ষা'}
            </h3>
            <button onClick={() => navigate('/live-exams-list')} className="section-link">
              {isEn ? 'View All' : 'সব দেখুন'} ➔
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
              alignItems: 'center'
            }}
          >
            <div>
              <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: 700 }}>{isEn ? 'Participate in Live Exams' : 'লাইভ পরীক্ষায় অংশ নিন'}</h4>
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', opacity: 0.9 }}>{isEn ? 'Daily routine mock tests' : 'প্রতিদিনের রুটিন ভিত্তিক লাইভ পরীক্ষা'}</p>
            </div>
            <Clock size={20} color="white" />
          </div>
        </div>

        {/* Categories Section */}
        <div style={{ marginBottom: '24px' }}>
          <h3 className="section-title" style={{ marginBottom: '14px' }}>
            {isEn ? 'Question Bank Categories' : 'প্রশ্নব্যাংক ক্যাটাগরি'}
          </h3>
          <div className="category-grid">
            <div
              className="category-grid-item"
              style={{
                background: activeCategory === 'all' ? 'var(--primary-lightest)' : 'var(--white)',
                border: activeCategory === 'all' ? '1.5px solid var(--primary)' : '1px solid var(--border-light)',
                borderRadius: '14px'
              }}
              onClick={() => handleCategorySelect('all')}
            >
              <div className="category-grid-icon"><LayoutGrid size={18} /></div>
              <span className="category-grid-label">{isEn ? 'All' : 'সব প্রশ্ন'}</span>
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
                    borderRadius: '14px'
                  }}
                  onClick={() => handleCategorySelect(key)}
                >
                  <div className="category-grid-icon" style={{ background: cat.color }}>{cat.icon}</div>
                  <span className="category-grid-label">{isEn ? (cat.nameEn || cat.name) : cat.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* List Section */}
        <div>
          <div style={{ marginBottom: '14px' }}>
            <SearchBar value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={isEn ? "Search questions..." : "প্রশ্নব্যাংকে খুঁজুন..."} />
          </div>

          <div style={{
            display: (isFiltering || filteredPapers.length === 0) ? 'flex' : 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            flexDirection: 'column',
            gap: '12px',
            minHeight: '180px'
          }}>
            {isFiltering ? (
              <div style={{ padding: '60px 20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gridColumn: '1 / -1' }}>
                <ModernLoader size="md" icon={categoryConfig[activeCategory]?.icon || '📚'} />
              </div>
            ) : filteredPapers.length > 0 ? (
              filteredPapers.map(paper => (
                <QuestionCard
                  key={paper.id}
                  paper={paper}
                  categoryIcon={categoryConfig[paper.category]?.icon || paper.icon || paper.categoryIcon}
                  isEn={isEn}
                  onClick={() => navigate(`/question-details/${paper.id}`)}
                />
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', gridColumn: '1 / -1' }}>
                <p>{isEn ? 'No questions found' : 'কোন প্রশ্নপত্র পাওয়া যায়নি'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      </PullToRefresh>
    </div>
  );
}
