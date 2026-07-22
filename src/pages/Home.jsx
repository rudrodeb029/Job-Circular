import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, Search, LayoutGrid, Download, FileText, Calendar } from '../components/Icons';
import { useAppContext } from '../context/AppContext';
import BottomNav from '../components/BottomNav';
import AppHeader from '../components/AppHeader';
import JobCard from '../components/JobCard';
import SearchBar from '../components/SearchBar';
import TabBar from '../components/TabBar';
import { HomeSkeleton } from '../components/SkeletonLoader';
import { jobs } from '../data/jobs';
import { categories } from '../data/categories';
import { admitCardsAndResults } from '../data/notifications';
import Disclaimer from '../components/Disclaimer';

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

const toBengaliNumber = (num) => {
  if (num === undefined || num === null) return '';
  const engNum = String(num);
  const bengaliDigits = {'0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'};
  return engNum.split('').map(digit => bengaliDigits[digit] || digit).join('');
};

export default function Home() {
  const navigate = useNavigate();
  const { state } = useAppContext();
  const isEn = state.language === 'en';
  const [loading, setLoading] = useState(true);
  const [localJobs, setLocalJobs] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_jobs');
      return saved ? JSON.parse(saved) : jobs;
    } catch (e) {
      console.error(e);
      return jobs;
    }
  });

  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 20;

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (!e || e.key === 'admin_jobs') {
        const loadedJobs = JSON.parse(localStorage.getItem('admin_jobs')) || jobs;
        setLocalJobs(loadedJobs);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('jobs_updated', handleStorageChange);

    // Initial load
    handleStorageChange();

    const timer = setTimeout(() => setLoading(false), 800);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('jobs_updated', handleStorageChange);
    };
  }, []);

  // Merge circulars data based on feed types
  const combinedFeedItems = useMemo(() => {
    const jobItems = localJobs.map(job => ({
      ...job,
      feedType: 'job'
    }));

    // Exam Date jobs from localJobs
    const examJobs = localJobs.filter(job => job.examDate).map(job => ({
      id: `exam_${job.id}`,
      originalId: job.id,
      organization: job.organization,
      organizationEn: job.organizationEn,
      postTitle: job.title,
      postTitleEn: job.titleEn,
      examDate: job.examDate,
      examDateEn: job.examDateEn || job.examDate,
      downloadLink: job.downloadLink || 'https://example.com/admit.pdf',
      category: job.category,
      postedDate: job.postedDate || job.examDate || '১ দিন আগে',
      postedDateEn: job.postedDateEn || job.examDateEn || job.examDate || '1 day ago',
      feedType: 'exam_date'
    }));

    // Result jobs from localJobs
    const resultJobs = localJobs.filter(job => job.examResult).map(job => ({
      id: `result_${job.id}`,
      originalId: job.id,
      organization: job.organization,
      organizationEn: job.organizationEn,
      postTitle: job.title,
      postTitleEn: job.titleEn,
      examResult: job.examResult,
      category: job.category,
      postedDate: job.postedDate || '১ দিন আগে',
      postedDateEn: job.postedDateEn || '1 day ago',
      feedType: 'result'
    }));

    // Notifications admit card items
    const notifExamItems = admitCardsAndResults.filter(item => item.type === 'admit_card').map(item => ({
      id: item.id,
      originalId: item.id.replace('admit-', 'job-'),
      organization: item.organization,
      organizationEn: item.organizationEn,
      postTitle: item.examName,
      postTitleEn: item.examNameEn,
      examDate: item.date,
      examDateEn: item.dateEn,
      downloadLink: item.downloadLink,
      postedDate: item.date || '১ দিন আগে',
      postedDateEn: item.dateEn || item.date || '1 day ago',
      feedType: 'exam_date'
    }));

    // Notifications result items
    const notifResultItems = admitCardsAndResults.filter(item => item.type === 'result').map(item => ({
      id: item.id,
      originalId: item.id.replace('result-', 'job-'),
      organization: item.organization,
      organizationEn: item.organizationEn,
      postTitle: item.examName,
      postTitleEn: item.examNameEn,
      examResult: item.downloadLink,
      postedDate: item.date || '১ দিন আগে',
      postedDateEn: item.dateEn || item.date || '1 day ago',
      feedType: 'result'
    }));

    return [...jobItems, ...examJobs, ...resultJobs, ...notifExamItems, ...notifResultItems];
  }, [localJobs]);

  // Paginated feed items
  const paginatedFeed = useMemo(() => {
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    return combinedFeedItems.slice(indexOfFirstPost, indexOfLastPost);
  }, [combinedFeedItems, currentPage]);

  const totalPages = Math.ceil(combinedFeedItems.length / postsPerPage);
  const displayCategories = categories.slice(0, 3);

  if (loading) {
    return (
      <div className="page">
        <HomeSkeleton />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-content">
        {/* Top App Header */}
        <AppHeader />

        {/* Advanced Modern Search Bar */}
        <div className="mb-lg" onClick={() => navigate('/search')} style={{ cursor: 'pointer' }}>
          <SearchBar
            value=""
            onChange={() => {}}
            placeholder="Search jobs..."
          />
        </div>

        {/* Stats Card */}
        <div className="stats-card mb-lg">
          <div className="stats-card-row">
            <div>
              <p className="stats-label">{isEn ? 'Total Active Circulars' : 'মোট সক্রিয় সার্কুলার'}</p>
              <p className="stats-number">
                {isEn 
                  ? `${(12450 + Math.max(0, localJobs.length - 12)).toLocaleString()}+` 
                  : `${toBengaliNumber((12450 + Math.max(0, localJobs.length - 12)).toLocaleString())}+`}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className="stats-badge">{isEn ? 'This Week' : 'এই সপ্তাহে'}</span>
              <p style={{ fontSize: '15px', fontWeight: 800, marginTop: '4px' }}>
                {isEn 
                  ? `+${(320 + Math.max(0, localJobs.length - 12)).toLocaleString()}` 
                  : `+${toBengaliNumber((320 + Math.max(0, localJobs.length - 12)).toLocaleString())}`}
              </p>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-lg">
          <div className="section-header">
            <h3 className="section-title">{isEn ? 'Categories' : 'ক্যাটাগরি'}</h3>
            <Link to="/categories" className="section-link">
              <span>{isEn ? 'See All' : 'সব দেখুন'}</span>
              <span style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center' }}>➔</span>
            </Link>
          </div>
          <div className="category-grid">
            {displayCategories.map(cat => (
              <div
                key={cat.id}
                className="category-grid-item"
                onClick={() => navigate(`/search?category=${cat.id}`)}
              >
                <div className="category-grid-icon" style={{ background: cat.color }}>
                  {cat.icon}
                </div>
                <span className="category-grid-label">{cat.name}</span>
              </div>
            ))}
            <div
              className="category-grid-item"
              onClick={() => navigate('/categories')}
            >
              <div className="category-grid-icon" style={{ background: 'var(--bg-secondary)' }}>
                <LayoutGrid size={22} />
              </div>
              <span className="category-grid-label">{isEn ? 'More' : 'আরও'}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Feed Segment */}
        <div>
          <div className="section-header">
            <h3 className="section-title">{isEn ? 'Latest Job Circulars' : 'সাম্প্রতিক সার্কুলার'}</h3>
            <Link to="/all-circulars" className="section-link">
              <span>{isEn ? 'See All' : 'সব দেখুন'}</span>
              <span style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center' }}>➔</span>
            </Link>
          </div>



          {/* Paginated Combined Circulars List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {paginatedFeed.map(item => {
              if (item.feedType === 'job') {
                return <JobCard key={item.id} job={item} />;
              }

              const displayIcon = item.icon || orgIconsMap[item.organization] || '🏛️';
              const orgName = isEn ? (item.organizationEn || item.organization) : item.organization;
              const postTitle = isEn ? (item.postTitleEn || item.postTitle) : item.postTitle;

              if (item.feedType === 'exam_date') {
                const descriptionSentence = isEn
                  ? `Exam date published for the post of ${postTitle}.`
                  : `${postTitle} পদের পরীক্ষার তারিখ প্রকাশিত হয়েছে।`;

                return (
                  <div 
                    key={item.id} 
                    className="job-card animate-fade-in" 
                    onClick={() => navigate(`/exam-details/${item.originalId || item.id}`)}
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
                          <Calendar size={10} />
                          <span>{isEn ? 'Exam Date Published' : 'পরীক্ষার তারিখ প্রকাশিত'}</span>
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          • 🕒 {isEn ? (item.postedDateEn || item.postedDate || item.examDateEn || item.examDate || '1 day ago') : (item.postedDate || item.examDate || '১ দিন আগে')}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/exam-details/${item.originalId || item.id}`);
                        }}
                        title="View Exam Details"
                        style={{ 
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: '#ffffff',
                          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer',
                          flexShrink: 0
                        }}
                      >
                        <Download size={14} color="#ffffff" />
                      </div>
                    </div>
                  </div>
                );
              }

              // feedType === 'result'
              const descriptionSentence = isEn
                ? `Written/Viva exam result published for the post of ${postTitle}. View result now!`
                : `${postTitle} পদের পরীক্ষার ফলাফল প্রকাশিত হয়েছে। এখনই ফলাফল দেখুন!`;

              return (
                <div 
                  key={item.id} 
                  className="job-card animate-fade-in" 
                  onClick={() => navigate(`/result-details/${item.originalId || item.id}`)}
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
                        • 🕒 {isEn ? (item.postedDateEn || item.postedDate || item.examDateEn || item.examDate || '1 day ago') : (item.postedDate || item.examDate || '১ দিন আগে')}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/result-details/${item.originalId || item.id}`);
                      }}
                      title="View Result Details"
                      style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                        color: '#ffffff',
                        boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                        flexShrink: 0
                      }}
                    >
                      <FileText size={14} color="#ffffff" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Previous & Next Pagination Buttons Container */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '24px',
              marginBottom: '10px',
              padding: '12px 0',
              borderTop: '1px solid var(--border-light)'
            }}>
              <button
                disabled={currentPage === 1}
                onClick={() => {
                  setCurrentPage(prev => Math.max(prev - 1, 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                style={{
                  padding: '10px 20px',
                  borderRadius: '12px',
                  border: 'none',
                  background: currentPage === 1 ? '#f1f5f9' : 'linear-gradient(135deg, var(--primary) 0%, #2563eb 100%)',
                  color: currentPage === 1 ? '#94a3b8' : '#ffffff',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  boxShadow: currentPage === 1 ? 'none' : '0 4px 12px rgba(26, 86, 219, 0.15)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                ◀ {isEn ? 'Previous' : 'পূর্ববর্তী'}
              </button>

              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                {isEn 
                  ? `Page ${currentPage} of ${totalPages}` 
                  : `পৃষ্ঠা ${toBengaliNumber(currentPage)} / ${toBengaliNumber(totalPages)}`}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => {
                  setCurrentPage(prev => Math.min(prev + 1, totalPages));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                style={{
                  padding: '10px 20px',
                  borderRadius: '12px',
                  border: 'none',
                  background: currentPage === totalPages ? '#f1f5f9' : 'linear-gradient(135deg, var(--primary) 0%, #2563eb 100%)',
                  color: currentPage === totalPages ? '#94a3b8' : '#ffffff',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  boxShadow: currentPage === totalPages ? 'none' : '0 4px 12px rgba(26, 86, 219, 0.15)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {isEn ? 'Next' : 'পরবর্তী'} ▶
              </button>
            </div>
          )}
        </div>
        <Disclaimer />
      </div>
      <BottomNav />
    </div>
  );
}
