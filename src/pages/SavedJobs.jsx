import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Bookmark, Globe, Search, Download } from '../components/Icons';
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

const tabs = [
  { id: 'all', label: 'All' },
  { id: 'applied', label: 'Applied' },
  { id: 'exam_date', label: 'Exam Date' }
];

export default function SavedJobs() {
  const navigate = useNavigate();
  const { state } = useAppContext();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Load jobs from localStorage if present (to reflect admin updates), fallback to static jobs data
  const localJobs = JSON.parse(localStorage.getItem('admin_jobs')) || jobs;

  const savedJobList = localJobs.filter(j => state.savedJobs.includes(j.id));

  const filteredJobs = savedJobList.filter(job => {
    const isApplied = state.appliedJobs.includes(job.id);
    const matchesTab = activeTab === 'applied' ? isApplied :
                       activeTab === 'exam_date' ? !!job.examDate : true;
    
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
              if (activeTab === 'exam_date') {
                const styleConfig = categoryStyles[job.category] || categoryStyles.gov;
                const displayIcon = job.icon || orgIconsMap[job.organization] || styleConfig.defaultIcon;

                return (
                  <div 
                    key={job.id} 
                    className="card animate-fade-in" 
                    onClick={() => navigate(`/exam-details/${job.id}`)}
                    style={{ 
                      padding: 'var(--space-md)', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '12px',
                      position: 'relative',
                      cursor: 'pointer'
                    }}
                  >
                    {/* Job Header */}
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '10px',
                        background: styleConfig.bg,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        boxShadow: `0 4px 10px ${styleConfig.shadow || 'rgba(0,0,0,0.05)'}`
                      }}>
                        {displayIcon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                          {job.title}
                        </h4>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                          {job.organization}
                        </p>
                      </div>
                    </div>

                    {/* Exam details section */}
                    <div style={{
                      background: 'var(--bg-secondary)',
                      borderRadius: '12px',
                      padding: '12px',
                      border: '1px solid var(--border-light)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                        <span style={{ 
                            fontSize: '12px', 
                            fontWeight: 700, 
                            color: '#059669', 
                            background: '#d1fae5', 
                            padding: '4px 10px', 
                            borderRadius: '20px',
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '4px' 
                          }}>
                          🎉 Exam Date Published
                        </span>
                        
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
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              color: '#ffffff',
                              textDecoration: 'none',
                              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                              transition: 'all 0.2s ease',
                              flexShrink: 0
                            }}
                          >
                            <Download size={16} color="#ffffff" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }
              return <JobCard key={job.id} job={job} />;
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
