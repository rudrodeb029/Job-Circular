import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, Search, LayoutGrid, Download, FileText, Calendar, ChevronRight } from '../components/Icons';
import { useAppContext } from '../context/AppContext';
import { useAdminContext } from '../context/AdminContext';
import BottomNav from '../components/BottomNav';
import AppHeader from '../components/AppHeader';
import JobCard from '../components/JobCard';
import SearchBar from '../components/SearchBar';
import TabBar from '../components/TabBar';
import { HomeSkeleton } from '../components/SkeletonLoader';
import { categories } from '../data/categories';
import { formatTimeAgo, getItemTimestamp, sortByCreatedAt } from '../utils/timeUtils';
import PullToRefresh from '../components/PullToRefresh';
import NewDataIcon from '../components/NewDataIcon';

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

const isExpired = (deadline) => {
  if (!deadline) return false;
  const deadlineDate = new Date(deadline);
  if (isNaN(deadlineDate.getTime())) return false;
  // Set time to end of day for deadline
  const endOfDay = new Date(deadlineDate);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay < new Date();
};

const getGreeting = (isEn) => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return isEn ? 'Good Morning' : 'শুভ সকাল';
  if (hour >= 12 && hour < 17) return isEn ? 'Good Afternoon' : 'শুভ দুপুর';
  if (hour >= 17 && hour < 21) return isEn ? 'Good Evening' : 'শুভ সন্ধ্যা';
  return isEn ? 'Good Night' : 'শুভ রাত্রি';
};

export default function Home() {
  const navigate = useNavigate();
  const { state } = useAppContext();
  const isEn = state.language === 'en';
  const { state: adminState, loading: adminLoading, refreshData } = useAdminContext();
  const localJobs = adminState.jobs || [];
  const localAdmits = adminState.admits || [];
  const [loading, setLoading] = useState(localJobs.length === 0);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 20;

  useEffect(() => {
    if (!adminLoading) {
      setLoading(false);
    }
  }, [adminLoading]);

  const combinedFeedItems = useMemo(() => {
    if (localJobs.length === 0) return [];

    const jobItems = localJobs
      .map(job => {
        const hasAdmit = localAdmits.some(a => String(a.jobId) === String(job.id));
        if ((job.showInExamDate || job.showInResult) && hasAdmit) {
          return null;
        }
        return { ...job, feedType: 'job' };
      })
      .filter(Boolean);

    const notifExamItems = localAdmits
      .filter(item => item.type === 'admit_card')
      .map(item => {
        const parentJob = localJobs.find(j => String(j.id) === String(item.jobId));
        if (!parentJob || !parentJob.showInExamDate) return null;
        return {
          ...item,
          description: parentJob?.description || '',
          originalId: item.jobId,
          postTitle: item.examName,
          postTitleEn: item.examNameEn,
          examDate: item.date,
          examDateEn: item.dateEn,
          postedDate: item.date || '১ দিন আগে',
          postedDateEn: item.dateEn || item.date || '1 day ago',
          feedType: 'exam_date'
        };
      })
      .filter(Boolean);

    const notifResultItems = localAdmits
      .filter(item => item.type === 'result')
      .map(item => {
        const parentJob = localJobs.find(j => String(j.id) === String(item.jobId));
        if (!parentJob || !parentJob.showInResult) return null;
        return {
          ...item,
          description: parentJob?.description || '',
          originalId: item.jobId,
          postTitle: item.examName,
          postTitleEn: item.examNameEn,
          examResult: item.downloadLink,
          postedDate: item.date || '১ দিন আগে',
          postedDateEn: item.dateEn || item.date || '1 day ago',
          feedType: 'result'
        };
      })
      .filter(Boolean);

    const rawFeed = [...jobItems, ...notifExamItems, ...notifResultItems];
    const deduplicatedMap = new Map();

    rawFeed.forEach(item => {
      const baseId = String(item.jobId || item.originalId || item.id);
      const existing = deduplicatedMap.get(baseId);

      if (!existing) {
        deduplicatedMap.set(baseId, item);
      } else {
        // If multiple updates exist, prefer the one with the latest timestamp
        const currentTS = getItemTimestamp(item);
        const existingTS = getItemTimestamp(existing);

        if (currentTS >= existingTS) {
          deduplicatedMap.set(baseId, item);
        }
      }
    });

    return Array.from(deduplicatedMap.values()).sort(sortByCreatedAt);
  }, [localJobs, localAdmits]);

  const activeJobCount = useMemo(() => {
    return localJobs.filter(job => !isExpired(job.deadline)).length;
  }, [localJobs]);

  const paginatedFeed = useMemo(() => {
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    return combinedFeedItems.slice(indexOfFirstPost, indexOfLastPost);
  }, [combinedFeedItems, currentPage]);

  const totalPages = Math.ceil(combinedFeedItems.length / postsPerPage);

  if (loading) {
    return (
      <div className="page">
        <HomeSkeleton />
        <BottomNav />
      </div>
    );
  }

  const userName = state.user.name || (isEn ? 'Job Seeker' : 'চাকরিপ্রার্থী');

  return (
    <div className="page">
      <AppHeader />
      <PullToRefresh onRefresh={refreshData}>
        <div className="page-content" style={{ paddingTop: 0 }}>

        <div className="mb-lg" onClick={() => navigate('/search')} style={{ cursor: 'pointer' }}>
          <SearchBar value="" onChange={() => {}} placeholder="Search jobs..." />
        </div>

        {/* Floating Modern Loader Icon (Appears only when new data is posted on Cloudflare) */}
        <NewDataIcon />

        {/* COMPACT HERO STATS CARD - REDUCED HEIGHT & TEXT SIZE */}
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #1a56db 100%)',
          borderRadius: '24px',
          padding: '18px 24px',
          position: 'relative',
          marginBottom: '24px',
          overflow: 'hidden',
          boxShadow: '0 12px 30px rgba(26, 86, 219, 0.2)',
          minHeight: '145px',
          display: 'flex',
          alignItems: 'center'
        }}>
          {/* Animated background glow */}
          <div style={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(40px)',
            zIndex: 0,
            animation: 'pulseGlow 6s infinite ease-in-out'
          }}></div>

          <div style={{ position: 'relative', zIndex: 2, maxWidth: '65%' }}>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '10px', fontWeight: 600, marginBottom: '6px', letterSpacing: '0.3px' }}>
              {getGreeting(isEn)}, {userName} 👋
            </p>
            <h2 style={{ color: '#ffffff', fontSize: '26px', fontWeight: 800, marginBottom: '2px', lineHeight: 1, display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              {isEn ? (
                `${activeJobCount}+`
              ) : (
                <>
                  <span>{toBengaliNumber(activeJobCount)}+</span>
                  <span style={{ fontSize: '15px', fontWeight: 700, opacity: 0.92 }}>টি</span>
                </>
              )}
            </h2>
            <p style={{ color: '#ffffff', fontSize: '13.5px', fontWeight: 700, marginBottom: '4px', letterSpacing: '-0.1px' }}>
              {isEn ? 'New Jobs Available' : 'নতুন নিয়োগ বিজ্ঞপ্তি'}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '9.5px', marginBottom: '14px', fontWeight: 500, letterSpacing: '0.1px' }}>
              {isEn ? 'Find your dream job today!' : 'আজই আপনার পছন্দের চাকরিটি খুঁজুন!'}
            </p>

            <button
              onClick={() => navigate('/all-circulars')}
              style={{
                background: '#ffffff',
                color: '#1e40af',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {isEn ? 'View All Jobs' : 'সবগুলো দেখুন'}
              <ChevronRight size={12} />
            </button>
          </div>

          {/* COMPACT 3D ILLUSTRATION - RE-POSITIONED RIGHT & FIXED MAGNIFIER HANDLE */}
          <div style={{
            position: 'absolute',
            right: '0px',
            bottom: '10px',
            width: '160px',
            height: '150px',
            zIndex: 1,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
            pointerEvents: 'none'
          }}>
            <svg viewBox="0 0 240 240" style={{ width: '100%', height: '100%' }}>
              <defs>
                <linearGradient id="briefcaseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
                <linearGradient id="resumeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#f8fafc" />
                </linearGradient>
                <filter id="shadow3d" x="-20%" y="-20%" width="150%" height="150%">
                  <feDropShadow dx="2" dy="5" stdDeviation="5" shadowOpacity="0.2" />
                </filter>
                <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.4" />
                </linearGradient>
              </defs>

              {/* Background Resume Paper (Layer 1) */}
              <g transform="translate(110, 40) rotate(8)" filter="url(#shadow3d)">
                <rect x="0" y="0" width="85" height="110" rx="8" fill="url(#resumeGrad)" />
                <circle cx="22" cy="25" r="12" fill="#e2e8f0" />
                <rect x="40" y="20" width="30" height="4" rx="2" fill="#e2e8f0" />
                <rect x="40" y="30" width="20" height="4" rx="2" fill="#e2e8f0" />
                <rect x="15" y="55" width="55" height="3" rx="1.5" fill="#f1f5f9" />
                <rect x="15" y="65" width="55" height="3" rx="1.5" fill="#f1f5f9" />
                <rect x="15" y="75" width="40" height="3" rx="1.5" fill="#f1f5f9" />
                <rect x="15" y="85" width="55" height="3" rx="1.5" fill="#f1f5f9" />
              </g>

              {/* Briefcase (Layer 2) */}
              <g transform="translate(50, 85)" filter="url(#shadow3d)">
                {/* Handle */}
                <path d="M35 -12 Q55 -25 75 -12" fill="none" stroke="#6d28d9" strokeWidth="9" strokeLinecap="round" />
                {/* Main Body */}
                <rect x="0" y="0" width="115" height="85" rx="18" fill="url(#briefcaseGrad)" />
                {/* Lid Detail */}
                <path d="M0 35 Q57.5 45 115 35" fill="none" stroke="#6d28d9" strokeWidth="2" opacity="0.4" />
                {/* Lock Detail */}
                <rect x="52.5" y="32" width="10" height="10" rx="3" fill="#ffffff" opacity="0.3" />
              </g>

              {/* Magnifying Glass (Layer 3) - FIXED HANDLE POSITION AND ANGLE */}
              <g transform="translate(145, 155) rotate(-15)" filter="url(#shadow3d)">
                {/* Handle - Now correctly positioned pointing down-right */}
                <rect x="25" y="-6" width="45" height="12" rx="6" fill="#475569" />
                {/* Frame */}
                <circle cx="0" cy="0" r="28" fill="none" stroke="#cbd5e1" strokeWidth="6" />
                {/* Lens */}
                <circle cx="0" cy="0" r="25" fill="url(#glassGrad)" />
                {/* Reflection */}
                <path d="M-10 -10 Q-15 -15 -8 -15" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
              </g>
            </svg>
          </div>

          {/* Background Decorative Blob */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '15%',
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            zIndex: 0
          }}></div>
        </div>

        <div className="mb-md">
          <div className="section-header" style={{ background: 'transparent', padding: '5px 0', marginBottom: '4px', border: 'none', boxShadow: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: 'transparent', padding: '6px 0', position: 'relative', overflow: 'hidden', border: 'none' }}>
              <h3 className="section-title" style={{ margin: 0 }}>
                {isEn ? 'Questions & Answers' : 'প্রশ্নপত্র এবং উত্তর'}
              </h3>
            </div>
            <Link to="/questions-hub" className="section-link">
              <span>{isEn ? 'See All' : 'সব দেখুন'}</span>
              <span style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center' }}>➔</span>
            </Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Scrolling part - 5 Categories only */}
            <div className="scrolling-container" style={{ flex: 1, margin: 0, padding: '4px 0' }}>
              <div className="scrolling-content" style={{ gap: '8px' }}>
                {[
                  { id: 'bcs', name: 'বিসিএস', nameEn: 'BCS', icon: '🎓', color: 'rgba(26, 86, 219, 0.05)' },
                  { id: 'bank', name: 'ব্যাংক', nameEn: 'Bank', icon: '🏦', color: 'rgba(16, 185, 129, 0.05)' },
                  { id: 'ntrca', name: 'NTRCA', nameEn: 'NTRCA', icon: '📜', color: 'rgba(139, 92, 246, 0.05)' },
                  { id: 'primary', name: 'প্রাইমারি', nameEn: 'Primary', icon: '🏫', color: 'rgba(5, 150, 105, 0.05)' },
                  { id: 'ministry', name: 'মন্ত্রনালয়', nameEn: 'Ministries', icon: '🏛️', color: 'rgba(245, 158, 11, 0.05)' }
                ].concat([
                  { id: 'bcs', name: 'বিসিএস', nameEn: 'BCS', icon: '🎓', color: 'rgba(26, 86, 219, 0.05)' },
                  { id: 'bank', name: 'ব্যাংক', nameEn: 'Bank', icon: '🏦', color: 'rgba(16, 185, 129, 0.05)' },
                  { id: 'ntrca', name: 'NTRCA', nameEn: 'NTRCA', icon: '📜', color: 'rgba(139, 92, 246, 0.05)' },
                  { id: 'primary', name: 'প্রাইমারি', nameEn: 'Primary', icon: '🏫', color: 'rgba(5, 150, 105, 0.05)' },
                  { id: 'ministry', name: 'মন্ত্রনালয়', nameEn: 'Ministries', icon: '🏛️', color: 'rgba(245, 158, 11, 0.05)' }
                ]).map((cat, idx) => (
                  <div
                    key={`${cat.id}-${idx}`}
                    className="category-grid-item"
                    style={{
                      border: '1px solid rgba(226, 232, 240, 0.9)',
                      boxShadow: 'none',
                      background: 'var(--white)',
                      borderRadius: '12px',
                      minWidth: '72px',
                      flexShrink: 0
                    }}
                    onClick={() => navigate(`/questions-hub?category=${cat.id}`)}
                  >
                    <div className="category-grid-icon" style={{ background: cat.color, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cat.icon}</div>
                    <span className="category-grid-label">{isEn ? cat.nameEn : cat.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* FIXED MORE CARD - STATIONARY ON THE RIGHT */}
            <div
              className="category-grid-item animate-scale-in"
              style={{
                border: '1px solid rgba(226, 232, 240, 0.9)',
                boxShadow: 'none',
                background: 'var(--white)',
                borderRadius: '12px',
                minWidth: '72px',
                flexShrink: 0,
                zIndex: 5
              }}
              onClick={() => navigate('/questions-hub')}
            >
              <div className="category-grid-icon" style={{ background: 'var(--bg-secondary)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LayoutGrid size={15} />
              </div>
              <span className="category-grid-label" style={{ fontWeight: 800 }}>{isEn ? 'More' : 'আরও'}</span>
            </div>
          </div>
        </div>

        <div>
          <div className="section-header" style={{ background: 'transparent', padding: '5px 0', marginBottom: '10px', border: 'none', boxShadow: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: 'transparent', padding: '6px 0', position: 'relative', overflow: 'hidden', border: 'none' }}>
              <h3 className="section-title" style={{ margin: 0 }}>
                {isEn ? 'Latest Job Circulars' : 'সাম্প্রতিক সার্কুলার'}
              </h3>
            </div>
            <Link to="/all-circulars" className="section-link">
              <span>{isEn ? 'See All' : 'সব দেখুন'}</span>
              <span style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center' }}>➔</span>
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {paginatedFeed.map(item => {
              if (item.feedType === 'job') {
                return <JobCard key={item.id} job={item} />;
              }

              const displayIcon = item.icon || orgIconsMap[item.organization] || '🏛️';
              const orgName = isEn ? (item.organizationEn || item.organization) : item.organization;
              const postTitle = isEn ? (item.postTitleEn || item.postTitle) : item.postTitle;
              const catData = categories.find(c => c.id === (item.category || item.categoryId));
              const catName = isEn ? (catData?.nameEn || catData?.name) : catData?.name;

              if (item.feedType === 'exam_date') {
                const descriptionSentence = isEn ? `Exam date published for the post of ${postTitle}.` : `${postTitle} পদের পরীক্ষার তারিখ প্রকাশিত হয়েছে।`;
                const displayDesc = item.description || descriptionSentence;
                return (
                  <div key={item.id} className="job-card animate-fade-in" onClick={() => navigate(`/exam-details/${item.originalId || item.id}`)} style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden', border: '1px solid rgba(16, 185, 129, 0.12)', boxShadow: '0 4px 18px rgba(16, 185, 129, 0.04)' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', background: 'linear-gradient(to bottom, #10b981, #34d399)', borderRadius: '4px 0 0 4px' }}></div>
                    <div className="job-card-content">
                      <h4 className="job-card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ fontSize: '12px', flexShrink: 0 }}>{displayIcon}</span><span>{orgName}</span></h4>
                      <p className="job-card-org" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'normal', lineHeight: '1.4', marginBottom: '4px', fontWeight: 400 }}>{displayDesc}</p>
                      <div style={{ marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', overflow: 'hidden' }}>
                        <span style={{ fontSize: '8.5px', color: '#059669', background: '#d1fae5', padding: '2px 6px', borderRadius: '4px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px', whiteSpace: 'nowrap' }}><Calendar size={10} /><span>{isEn ? 'Exam Date Published' : 'পরীক্ষার তারিখ প্রকাশিত'}</span></span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>• 🕒 {formatTimeAgo(item.createdAt, isEn)}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                      <div onClick={(e) => { e.stopPropagation(); navigate(`/exam-details/${item.originalId || item.id}`); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#ffffff', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)', transition: 'all 0.2s ease', cursor: 'pointer', flexShrink: 0 }}><Download size={14} color="#ffffff" /></div>
                    </div>
                  </div>
                );
              }

              const descriptionSentence = isEn ? `Written/Viva exam result published for the post of ${postTitle}. View result now!` : `${postTitle} পদের পরীক্ষার ফলাফল প্রকাশিত হয়েছে। এখনই ফলাফল দেখুন!`;
              const displayDesc = item.description || descriptionSentence;
              return (
                <div key={item.id} className="job-card animate-fade-in" onClick={() => navigate(`/result-details/${item.originalId || item.id}`)} style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden', border: '1px solid rgba(124, 58, 237, 0.12)', boxShadow: '0 4px 18px rgba(124, 58, 237, 0.04)' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', background: 'linear-gradient(to bottom, #7c3aed, #a78bfa)', borderRadius: '4px 0 0 4px' }}></div>
                  <div className="job-card-content">
                    <h4 className="job-card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ fontSize: '12px', flexShrink: 0 }}>{displayIcon}</span><span>{orgName}</span></h4>
                    <p className="job-card-org" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'normal', lineHeight: '1.4', marginBottom: '4px', fontWeight: 400 }}>{displayDesc}</p>
                    <div style={{ marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', overflow: 'hidden' }}>
                      <span style={{ fontSize: '8.5px', color: '#7e22ce', background: '#f3e8ff', padding: '2px 6px', borderRadius: '4px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px', whiteSpace: 'nowrap' }}>🏆 <span>{isEn ? 'Result Published' : 'ফলাফল প্রকাশিত'}</span></span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>• 🕒 {formatTimeAgo(item.createdAt, isEn)}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                    <div onClick={(e) => { e.stopPropagation(); navigate(`/result-details/${item.originalId || item.id}`); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', color: '#ffffff', boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)', transition: 'all 0.2s ease', cursor: 'pointer', flexShrink: 0 }}><FileText size={14} color="#ffffff" /></div>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '24px', marginBottom: '10px', padding: '12px 0', borderTop: '1px solid var(--border-light)' }}>
              <button disabled={currentPage === 1} onClick={() => { setCurrentPage(prev => Math.max(prev - 1, 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ padding: '10px 20px', borderRadius: '12px', border: 'none', background: currentPage === 1 ? '#f1f5f9' : 'linear-gradient(135deg, var(--primary) 0%, #2563eb 100%)', color: currentPage === 1 ? '#94a3b8' : '#ffffff', fontWeight: 700, fontSize: '13px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', boxShadow: currentPage === 1 ? 'none' : '0 4px 12px rgba(26, 86, 219, 0.15)', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '4px' }}>◀ {isEn ? 'Previous' : 'পূর্ববর্তী'}</button>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>{isEn ? `Page ${currentPage} of ${totalPages}` : `পৃষ্ঠা ${toBengaliNumber(currentPage)} / ${toBengaliNumber(totalPages)}`}</span>
              <button disabled={currentPage === totalPages} onClick={() => { setCurrentPage(prev => Math.min(prev + 1, totalPages)); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ padding: '10px 20px', borderRadius: '12px', border: 'none', background: currentPage === totalPages ? '#f1f5f9' : 'linear-gradient(135deg, var(--primary) 0%, #2563eb 100%)', color: currentPage === totalPages ? '#94a3b8' : '#ffffff', fontWeight: 700, fontSize: '13px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', boxShadow: currentPage === totalPages ? 'none' : '0 4px 12px rgba(26, 86, 219, 0.15)', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '4px' }}>{isEn ? 'Next' : 'পরবর্তী'} ▶</button>
            </div>
          )}
        </div>
      </div>
      </PullToRefresh>
      <BottomNav />
    </div>
  );
}
