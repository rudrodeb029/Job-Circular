import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileText } from '../components/Icons';
import TabBar from '../components/TabBar';
import BottomNav from '../components/BottomNav';
import EmptyState from '../components/EmptyState';
import SearchBar from '../components/SearchBar';
import { admitCards } from '../data/notifications';
import { useAppContext } from '../context/AppContext';

const orgIconsMap = {
  'শিক্ষা মন্ত্রণালয়': '🏛️',
  'সোনালী ব্যাংক লিমিটেড': '🏦',
  'বাংলাদেশ পুলিশ': '👮',
  'ব্র্যাক': '🤝',
  'গ্রামীণফোন': '📱',
  'বাংলাদেশ সেনাবাহিনী': '🛡️',
  'ইসলামী ব্যাংক': '🕌',
  'বাংলাদেশ রেলওয়ে': '🚂',
  'ডাক ও টেলিযোগাযোগ মন্ত্রণালয়': '📡',
  'স্বাস্থ্য অধিদপ্তর': '🏥',
  'বাংলাদেশ ব্যাংক': '🏛️',
  'ভিকারুননিসা নূন স্কুল এন্ড কলেজ': '🎓',
  'এলজিইডি': '🏗️',
  'বিকাশ লিমিটেড': '💸',
  'আশা': '🌱',
  'জনতা ব্যাংক': '🏦',
  'স্কয়ার হাসপাতাল': '🩺',
  'পাঠাও': '🚀',
  'রাজউক উত্তরা মডেল কলেজ': '🏫',
  'রূপালী ব্যাংক': '🏦',
  'আকিক গ্রুপ': '🏭',
  'ওয়াটারএইড বাংলাদেশ': '💧',
  'টেন মিনিট স্কুল': '✍️',
  'প্রাথমিক শিক্ষা অধিদপ্তর': '🏫',
  'ইসলামী ব্যাংক বাংলাদেশ': '🕌',
  'প্রাথমিক ও গণশিক্ষা মন্ত্রণালয়': '🏫'
};

export default function AdmitCardResult() {
  const navigate = useNavigate();
  const { state } = useAppContext();
  const isEn = state.language === 'en';
  const [activeTab, setActiveTab] = useState('admit_card');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = useMemo(() => [
    { id: 'admit_card', label: isEn ? 'Exam Date' : 'পরীক্ষার তারিখ' },
    { id: 'result', label: isEn ? 'Result' : 'ফলাফল' }
  ], [isEn]);

  const searchedItems = useMemo(() => {
    const items = admitCards.filter(item => item.type === activeTab);
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(item => {
      const org = (item.organization || '').toLowerCase();
      const orgEn = (item.organizationEn || '').toLowerCase();
      const exam = (item.examName || '').toLowerCase();
      const examEn = (item.examNameEn || '').toLowerCase();
      return org.includes(query) || orgEn.includes(query) || exam.includes(query) || examEn.includes(query);
    });
  }, [activeTab, searchQuery]);

  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
        </button>
        <h1>{isEn ? 'Admit Card & Result' : 'প্রবেশপত্র ও ফলাফল'}</h1>
      </div>

      <div className="page-content">
        {/* Modern Search Bar */}
        <div style={{ marginBottom: 'var(--space-md)' }}>
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === 'admit_card'
                ? (isEn ? 'Search exam dates...' : 'পরীক্ষার তারিখ খুঁজুন...')
                : (isEn ? 'Search results...' : 'ফলাফল খুঁজুন...')
            }
          />
        </div>

        {/* Tab Switcher */}
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <TabBar 
            tabs={tabs} 
            activeTab={activeTab} 
            onTabChange={(tab) => { 
              setActiveTab(tab); 
              setSearchQuery(''); 
            }} 
          />
        </div>

        {searchedItems.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {searchedItems.map(item => {
              const displayIcon = orgIconsMap[item.organization] || '🏛️';
              const orgName = isEn ? (item.organizationEn || item.organization) : item.organization;
              const examName = isEn ? (item.examNameEn || item.examName) : item.examName;
              const itemDate = isEn ? (item.dateEn || item.date) : item.date;

              if (activeTab === 'admit_card') {
                const descriptionSentence = isEn
                  ? `Exam notice published for: ${examName}`
                  : `${examName}।`;

                return (
                  <div 
                    key={item.id} 
                    className="job-card animate-fade-in" 
                    onClick={() => navigate(`/exam-details/${item.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="job-card-content">
                      <h4 className="job-card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '16px', flexShrink: 0 }}>{displayIcon}</span>
                        <span>{orgName}</span>
                      </h4>
                      <p className="job-card-org" style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'normal',
                        lineHeight: '1.4',
                        marginBottom: '4px',
                        fontWeight: 400
                      }}>
                        {descriptionSentence}
                      </p>
                      <div style={{ marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', overflow: 'hidden' }}>
                        <span style={{
                          fontSize: '8.5px',
                          color: '#059669',
                          background: '#d1fae5',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          whiteSpace: 'nowrap'
                        }}>
                          <span>📅 {isEn ? 'Exam Date Published' : 'পরীক্ষার তারিখ প্রকাশিত'}</span>
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          • 🕒 {isEn ? (item.dateEn || '1 day ago') : (item.date || '১ দিন আগে')}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                      <a 
                        href={item.downloadLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        title="Download Admit Card"
                        onClick={(e) => e.stopPropagation()}
                        style={{ 
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: '#ffffff',
                          textDecoration: 'none',
                          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                          transition: 'all 0.2s ease',
                          flexShrink: 0
                        }}
                      >
                        <Download size={14} color="#ffffff" />
                      </a>
                    </div>
                  </div>
                );
              }

              // Active tab is Result
              const descriptionSentence = isEn
                ? `Written/Viva exam result published for: ${examName}. View result now!`
                : `${examName} পদের পরীক্ষার ফলাফল প্রকাশিত হয়েছে। এখনই ফলাফল দেখুন!`;

              return (
                <div 
                  key={item.id} 
                  className="job-card animate-fade-in" 
                  onClick={() => navigate(`/result-details/${item.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="job-card-content">
                    <h4 className="job-card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '16px', flexShrink: 0 }}>{displayIcon}</span>
                      <span>{orgName}</span>
                    </h4>
                    <p className="job-card-org" style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'normal',
                      lineHeight: '1.4',
                      marginBottom: '4px',
                      fontWeight: 400
                    }}>
                      {descriptionSentence}
                    </p>
                    <div style={{ marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', overflow: 'hidden' }}>
                      <span style={{
                        fontSize: '8.5px',
                        color: '#7e22ce',
                        background: '#f3e8ff',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        whiteSpace: 'nowrap'
                      }}>
                        🏆 <span>{isEn ? 'Result Published' : 'ফলাফল প্রকাশিত'}</span>
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        • 🕒 {isEn ? (item.dateEn || '1 day ago') : (item.date || '১ দিন আগে')}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                    <a 
                      href={item.downloadLink} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      title="View Result PDF"
                      onClick={(e) => e.stopPropagation()}
                      style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                        color: '#ffffff',
                        textDecoration: 'none',
                        boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)',
                        transition: 'all 0.2s ease',
                        flexShrink: 0
                      }}
                    >
                      <FileText size={14} color="#ffffff" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            title={
              activeTab === 'admit_card'
                ? (isEn ? 'No Exam Dates Found' : 'কোনো পরীক্ষার তারিখ পাওয়া যায়নি')
                : (isEn ? 'No Results Found' : 'কোনো ফলাফল পাওয়া যায়নি')
            }
            description={
              searchQuery
                ? (isEn ? 'Try searching with a different term.' : 'অন্য বিবরণ দিয়ে সার্চ করে দেখুন।')
                : (isEn ? 'Check back later for new exam notices and results.' : 'নতুন পরীক্ষার নোটিশ এবং ফলাফলের জন্য পরবর্তীতে চেক করুন।')
            }
          />
        )}
      </div>

      <BottomNav />
    </div>
  );
}
