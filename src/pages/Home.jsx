import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, Search, LayoutGrid, Download, FileText, Calendar } from '../components/Icons';
import { useAppContext } from '../context/AppContext';
import { useAdminContext } from '../context/AdminContext';
import BottomNav from '../components/BottomNav';
import AppHeader from '../components/AppHeader';
import JobCard from '../components/JobCard';
import SearchBar from '../components/SearchBar';
import TabBar from '../components/TabBar';
import { HomeSkeleton } from '../components/SkeletonLoader';
import { categories } from '../data/categories';
import Disclaimer from '../components/Disclaimer';
import { formatTimeAgo } from '../utils/timeUtils';

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
  const { state: adminState, loading: adminLoading } = useAdminContext();
  const localJobs = adminState.jobs;
  const localAdmits = adminState.admits || [];
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 20;

  useEffect(() => {
    // Wait for AdminContext to finish its initial Firestore sync
    if (!adminLoading) {
      const timer = setTimeout(() => setLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [adminLoading]);

  // Merge circulars data based on feed types
  const combinedFeedItems = useMemo(() => {
    if (localJobs.length === 0) return [];

    const jobItems = localJobs
      .filter(job => !job.showInExamDate && !job.showInResult) // Hide base job if it's an update
      .map(job => ({
        ...job,
        feedType: 'job'
      }));

    // Special Filter: Also include Exam Date and Result markers as separate items in feed
    const examMarkerItems = localJobs.filter(j => j.showInExamDate).map(j => ({
      ...j,
      id: `home-exam-${j.id}`,
      feedType: 'exam_date',
      postTitle: j.title,
      postTitleEn: j.titleEn,
      examDate: j.examDate || j.deadline,
      examDateEn: j.examDateEn || j.deadline
    }));

    const resultMarkerItems = localJobs.filter(j => j.showInResult).map(j => ({
      ...j,
      id: `home-result-${j.id}`,
      feedType: 'result',
      postTitle: j.title,
      postTitleEn: j.titleEn
    }));

    // Notifications admit card items from database
    const notifExamItems = localAdmits.filter(item => item.type === 'admit_card').map(item => ({
      ...item,
      originalId: String(item.id).replace('admit-', 'job-'),
      postTitle: item.examName,
      postTitleEn: item.examNameEn,
      examDate: item.date,
      examDateEn: item.dateEn,
      postedDate: item.date || '১ দিন আগে',
      postedDateEn: item.dateEn || item.date || '1 day ago',
      feedType: 'exam_date'
    }));

    // Notifications result items from database
    const notifResultItems = localAdmits.filter(item => item.type === 'result').map(item => ({
      ...item,
      originalId: String(item.id).replace('result-', 'job-'),
      postTitle: item.examName,
      postTitleEn: item.examNameEn,
      examResult: item.downloadLink,
      postedDate: item.date || '১ দিন আগে',
      postedDateEn: item.dateEn || item.date || '1 day ago',
      feedType: 'result'
    }));

    const getItemTimestamp = (item) => {
      if (item.createdAt) {
        const ms = new Date(item.createdAt).getTime();
        if (!isNaN(ms)) return ms;
      }
      if (item.id) {
        const matches = String(item.id).match(/\d{10,13}/);
        if (matches) return parseInt(matches[0], 10);
      }
      return 0;
    };

    return [...jobItems, ...examMarkerItems, ...resultMarkerItems, ...notifExamItems, ...notifResultItems]
      .sort((a, b) => {
        const tsA = getItemTimestamp(a);
        const tsB = getItemTimestamp(b);
        if (tsA !== tsB) return tsB - tsA; // LIFO (Newest first)
        return String(b.id || '').localeCompare(String(a.id || ''));
      });
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
                  ? `${combinedFeedItems.length.toLocaleString()}+` 
                  : `${toBengaliNumber(combinedFeedItems.length.toLocaleString())}+`}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className="stats-badge">{isEn ? 'This Week' : 'এই সপ্তাহে'}</span>
              <p style={{ fontSize: '15px', fontWeight: 800, marginTop: '4px' }}>
                {isEn 
                  ? `+${localJobs.length.toLocaleString()}` 
                  : `+${toBengaliNumber(localJobs.length.toLocaleString())}`}
              </p>
            </div>
          </div>
        </div>



        {/* Questions & Answers Categories */}
        <div className="mb-lg">
          <div className="section-header" style={{
            background: 'transparent',
            padding: '10px 0',
            borderRadius: '0',
            border: 'none',
            marginBottom: '14px',
            boxShadow: 'none'
          }}>
            <h3 className="section-title" style={{ margin: 0 }}>{isEn ? 'Questions & Answers' : 'প্রশ্নপত্র এবং উত্তর'}</h3>
            <Link to="/questions-hub" className="section-link">
              <span>{isEn ? 'See All' : 'সব দেখুন'}</span>
              <span style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center' }}>➔</span>
            </Link>
          </div>
          <div className="category-grid">
            {[
              { id: 'bcs', name: 'বিসিএস', nameEn: 'BCS', icon: '🎓', color: 'rgba(26, 86, 219, 0.05)' },
              { id: 'bank', name: 'ব্যাংক', nameEn: 'Bank', icon: '🏦', color: 'rgba(16, 185, 129, 0.05)' },
              { id: 'ntrca', name: 'NTRCA', nameEn: 'NTRCA', icon: '📜', color: 'rgba(139, 92, 246, 0.05)' }
            ].map(cat => (
              <div
                key={cat.id}
                className="category-grid-item"
                style={{
                  border: '1px solid rgba(37, 99, 235, 0.12)',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.04)',
                  background: 'var(--white)',
                  borderRadius: '16px'
                }}
                onClick={() => navigate(`/questions-hub?category=${cat.id}`)}
              >
                <div className="category-grid-icon" style={{ background: cat.color, fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {cat.icon}
                </div>
                <span className="category-grid-label">{isEn ? cat.nameEn : cat.name}</span>
              </div>
            ))}
            <div
              className="category-grid-item"
              style={{
                border: '1px solid rgba(37, 99, 235, 0.12)',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.04)',
                background: 'var(--white)',
                borderRadius: '16px'
              }}
              onClick={() => navigate('/questions-hub')}
            >
              <div className="category-grid-icon" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                <LayoutGrid size={22} />
              </div>
              <span className="category-grid-label">{isEn ? 'More' : 'আরও'}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Feed Segment */}
        <div>
          <div className="section-header" style={{
            background: 'transparent',
            padding: '10px 0',
            borderRadius: '0',
            border: 'none',
            marginBottom: '14px',
            boxShadow: 'none'
          }}>
            <h3 className="section-title" style={{ margin: 0 }}>{isEn ? 'Latest Job Circulars' : 'সাম্প্রতিক সার্কুলার'}</h3>
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
                    style={{
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                      border: '1px solid rgba(16, 185, 129, 0.12)',
                      boxShadow: '0 4px 18px rgba(16, 185, 129, 0.04)'
                    }}
                  >
                    {/* Professional Accent Border */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      bottom: 0,
                      width: '4px',
                      background: 'linear-gradient(to bottom, #10b981, #34d399)',
                      borderRadius: '4px 0 0 4px'
                    }}></div>

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
                          • 🕒 {formatTimeAgo(item.createdAt, isEn)}
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
                  style={{
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    border: '1px solid rgba(124, 58, 237, 0.12)',
                    boxShadow: '0 4px 18px rgba(124, 58, 237, 0.04)'
                  }}
                >
                  {/* Professional Accent Border */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: '4px',
                    background: 'linear-gradient(to bottom, #7c3aed, #a78bfa)',
                    borderRadius: '4px 0 0 4px'
                  }}></div>

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
                        • 🕒 {formatTimeAgo(item.createdAt, isEn)}
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
