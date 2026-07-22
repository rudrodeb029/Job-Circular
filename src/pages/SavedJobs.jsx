import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Bookmark, BookmarkCheck, Calendar, Clock, Download, FileText, Search } from '../components/Icons';
import JobCard from '../components/JobCard';
import TabBar from '../components/TabBar';
import SearchBar from '../components/SearchBar';
import EmptyState from '../components/EmptyState';
import BottomNav from '../components/BottomNav';
import { jobs } from '../data/jobs';

const categoryStyles = {
  gov: { bg: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)', shadow: 'rgba(29, 78, 216, 0.3)', defaultIcon: '🏛️' },
  bank: { bg: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', shadow: 'rgba(5, 150, 105, 0.3)', defaultIcon: '🏦' },
  ngo: { bg: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)', shadow: 'rgba(234, 88, 12, 0.3)', defaultIcon: '🤝' },
  private: { bg: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)', shadow: 'rgba(124, 58, 237, 0.3)', defaultIcon: '🏢' },
  teaching: { bg: 'linear-gradient(135deg, #db2777 0%, #ec4899 100%)', shadow: 'rgba(219, 39, 119, 0.3)', defaultIcon: '📚' },
  defense: { bg: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)', shadow: 'rgba(220, 38, 38, 0.3)', defaultIcon: '🛡️' },
  healthcare: { bg: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)', shadow: 'rgba(13, 148, 136, 0.3)', defaultIcon: '🏥' },
  health: { bg: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)', shadow: 'rgba(13, 148, 136, 0.3)', defaultIcon: '🏥' },
  it: { bg: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', shadow: 'rgba(79, 70, 229, 0.3)', defaultIcon: '💻' },
  engineering: { bg: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)', shadow: 'rgba(217, 119, 6, 0.3)', defaultIcon: '⚙️' },
  parttime: { bg: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)', shadow: 'rgba(2, 132, 199, 0.3)', defaultIcon: '⏰' }
};

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
  'প্রাণ-আরএফএল গ্রুপ': '📦',
  'পপুলার ডায়াগনস্টিক সেন্টার': '🔬',
  'বেক্সিমকো ফার্মা': '💊',
  'ফাইবার অ্যাট হোম': '🌐',
  'দুর্নীতি দমন কমিশন (দুদক)': '⚖️',
  'স্বপ্ন সুপার শপ': '🛒'
};

const toBengaliNumber = (num) => {
  if (num === undefined || num === null) return '';
  const engNum = String(num);
  const bengaliDigits = {'0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'};
  return engNum.split('').map(digit => bengaliDigits[digit] || digit).join('');
};

export default function SavedJobs() {
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { id: 'all', label: state.language === 'en' ? 'All' : 'সব' },
    { id: 'applied', label: state.language === 'en' ? 'Applied' : 'আবেদনকৃত' },
    { id: 'exam_date', label: state.language === 'en' ? 'Exam Date' : 'পরীক্ষার তারিখ' },
    { id: 'result', label: state.language === 'en' ? 'Result' : 'ফলাফল' }
  ];

  // Load jobs from localStorage if present (to reflect admin updates), fallback to static jobs data
  const localJobs = JSON.parse(localStorage.getItem('admin_jobs')) || jobs;

  const savedJobList = localJobs.filter(j => state.savedJobs.includes(j.id));

  const filteredJobs = savedJobList.filter(job => {
    const isApplied = state.appliedJobs.includes(job.id);
    const matchesTab = activeTab === 'applied' ? isApplied :
                       activeTab === 'exam_date' ? !!job.examDate :
                       activeTab === 'result' ? !!job.examResult : true;
    
    if (!matchesTab) return false;

    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase().trim();
    return (
      (job.title && job.title.toLowerCase().includes(q)) ||
      (job.titleEn && job.titleEn.toLowerCase().includes(q)) ||
      (job.organization && job.organization.toLowerCase().includes(q)) ||
      (job.organizationEn && job.organizationEn.toLowerCase().includes(q)) ||
      (job.location && job.location.toLowerCase().includes(q)) ||
      (job.type && job.type.toLowerCase().includes(q))
    );
  });

  return (
    <div className="page">
      <div className="page-header">
        <h1>Saved Jobs</h1>
      </div>

      <div className="page-content">
        {/* Search Bar for Saved Jobs */}
        <div style={{ marginBottom: 'var(--space-md)' }}>
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search in saved jobs..."
          />
        </div>

        {/* Filter Tabs */}
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Job List or Empty State */}
        {filteredJobs.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {filteredJobs.map(job => {
              if (activeTab === 'result') {
                const styleConfig = categoryStyles[job.category] || categoryStyles.gov;
                const displayIcon = job.icon || orgIconsMap[job.organization] || styleConfig.defaultIcon;
                const isSaved = state.savedJobs.includes(job.id);

                const isEn = state.language === 'en';
                const orgName = isEn ? (job.organizationEn || job.organization) : job.organization;
                const titleName = isEn ? (job.titleEn || job.title) : job.title;
                
                const descriptionSentence = isEn
                  ? `Written/Viva exam result published for the post of ${titleName}. View result now!`
                  : `${titleName} পদের পরীক্ষার ফলাফল প্রকাশিত হয়েছে। এখনই ফলাফল দেখুন!`;

                return (
                  <div 
                    key={job.id} 
                    className="job-card" 
                    onClick={() => navigate(`/result-details/${job.id}`)}
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
                          • 🕒 {isEn ? (job.postedDateEn || job.postedTimeEn || 'Recent') : (job.postedDate || job.postedTime || 'সাম্প্রতিক')}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                      {job.examResult && (
                        <a 
                          href={job.examResult} 
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
                      )}
                    </div>
                  </div>
                );
              }

              if (activeTab === 'exam_date') {
                const styleConfig = categoryStyles[job.category] || categoryStyles.gov;
                const displayIcon = job.icon || orgIconsMap[job.organization] || styleConfig.defaultIcon;
                const isSaved = state.savedJobs.includes(job.id);

                const isEn = state.language === 'en';
                const orgName = isEn ? (job.organizationEn || job.organization) : job.organization;
                const titleName = isEn ? (job.titleEn || job.title) : job.title;
                
                const descriptionSentence = isEn
                  ? `Exam date published for the post of ${titleName}.`
                  : `${titleName} পদের পরীক্ষার তারিখ প্রকাশিত হয়েছে।`;

                return (
                  <div 
                    key={job.id} 
                    className="job-card" 
                    onClick={() => navigate(`/exam-details/${job.id}`)}
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
                          <Calendar size={10} /> 
                          <span>{isEn ? 'Exam Date Published' : 'পরীক্ষার তারিখ প্রকাশিত'}</span>
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          • 🕒 {isEn ? (job.postedDateEn || job.postedTimeEn || 'Recent') : (job.postedDate || job.postedTime || 'সাম্প্রতিক')}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                      {(job.examLink || job.applyLink) && (
                        <a 
                          href={job.examLink || job.applyLink} 
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
                      )}
                    </div>
                  </div>
                );
              }
              return <JobCard key={job.id} job={job} isAppliedView={activeTab === 'applied'} />;
            })}
          </div>
        ) : (
          <EmptyState
            icon={searchQuery ? Search : Bookmark}
            title={
              searchQuery 
                ? "No Matching Jobs Found" 
                : activeTab === 'exam_date' 
                  ? "No Exam Dates Available" 
                  : activeTab === 'result'
                    ? "No Results Available"
                    : "No Saved Jobs"
            }
            description={searchQuery ? `No saved jobs match "${searchQuery}"` : undefined}
            actionText={searchQuery ? "Clear Search" : "Explore Jobs"}
            onAction={searchQuery ? () => setSearchQuery('') : () => navigate('/search')}
          />
        )}
      </div>

      <BottomNav />
    </div>
  );
}
