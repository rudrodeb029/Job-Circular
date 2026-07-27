import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Download, FileText, Filter, ChevronRight } from '../components/Icons';
import { useAppContext } from '../context/AppContext';
import { useAdminContext } from '../context/AdminContext';
import BottomNav from '../components/BottomNav';
import AppHeader from '../components/AppHeader';
import JobCard from '../components/JobCard';
import { HomeSkeleton } from '../components/SkeletonLoader';
import Disclaimer from '../components/Disclaimer';
import { formatTimeAgo } from '../utils/timeUtils';
import heroImg from '../assets/hero.png';

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

const getGreeting = (isEn) => {
  const hour = new Date().getHours();
  if (hour < 12) return isEn ? 'Good Morning' : 'শুভ সকাল';
  if (hour < 17) return isEn ? 'Good Afternoon' : 'শুভ দুপুর';
  return isEn ? 'Good Evening' : 'শুভ সন্ধ্যা';
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
    if (!adminLoading) {
      const timer = setTimeout(() => setLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [adminLoading]);

  const combinedFeedItems = useMemo(() => {
    if (localJobs.length === 0) return [];

    const jobItems = localJobs
      .filter(job => !job.showInExamDate && !job.showInResult)
      .map(job => ({ ...job, feedType: 'job' }));

    const notifExamItems = localAdmits.filter(item => item.type === 'admit_card').map(item => ({
      ...item,
      originalId: item.jobId,
      postTitle: item.examName,
      postTitleEn: item.examNameEn,
      examDate: item.date,
      examDateEn: item.dateEn,
      feedType: 'exam_date'
    }));

    const notifResultItems = localAdmits.filter(item => item.type === 'result').map(item => ({
      ...item,
      originalId: item.jobId,
      postTitle: item.examName,
      postTitleEn: item.examNameEn,
      examResult: item.downloadLink,
      feedType: 'result'
    }));

    const getItemTimestamp = (item) => {
      if (item.createdAt) {
        const ms = new Date(item.createdAt).getTime();
        return isNaN(ms) ? 0 : ms;
      }
      return 0;
    };

    const deduplicatedMap = new Map();
    [...jobItems, ...notifExamItems, ...notifResultItems].forEach(item => {
      const baseId = String(item.jobId || item.originalId || item.id);
      const existing = deduplicatedMap.get(baseId);
      if (!existing || (item.feedType === 'exam_date' || item.feedType === 'result')) {
        deduplicatedMap.set(baseId, item);
      }
    });

    return Array.from(deduplicatedMap.values())
      .sort((a, b) => getItemTimestamp(b) - getItemTimestamp(a));
  }, [localJobs, localAdmits]);

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

  const userName = state.user.name || (isEn ? 'Suvro' : 'সুভ্র');

  return (
    <div className="page" style={{ backgroundColor: '#f8faff' }}>
      <div className="page-content" style={{ padding: '0 16px 20px 16px' }}>
        <AppHeader />

        {/* Search Bar - Clean & Sharp */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <div
            onClick={() => navigate('/search')}
            style={{
              flex: 1,
              height: '50px',
              background: '#ffffff',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              padding: '0 16px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
              cursor: 'pointer',
              border: '1px solid #f1f5f9'
            }}
          >
            <Search size={18} color="#94a3b8" />
            <span style={{ marginLeft: '12px', color: '#94a3b8', fontSize: '13.5px', fontWeight: 500 }}>
              {isEn ? 'Search jobs by title, company...' : 'টাইটেল বা কোম্পানি দিয়ে খুঁজুন...'}
            </span>
          </div>
          <button
            onClick={() => navigate('/search')}
            style={{
              width: '50px',
              height: '50px',
              background: '#ffffff',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
              border: '1px solid #f1f5f9'
            }}
          >
            <Filter size={20} color="#1a56db" />
          </button>
        </div>

        {/* Hero Card - Reduced Height & Refined Styling */}
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #1a56db 100%)',
          borderRadius: '24px',
          padding: '20px 22px',
          position: 'relative',
          marginBottom: '24px',
          overflow: 'hidden',
          boxShadow: '0 10px 25px rgba(29, 78, 216, 0.2)',
          minHeight: '160px'
        }}>
          <div style={{ position: 'relative', zIndex: 2, maxWidth: '65%' }}>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>
              {getGreeting(isEn)}, {userName} 👋
            </p>
            <h2 style={{ color: '#ffffff', fontSize: '32px', fontWeight: 900, marginBottom: '2px' }}>
              {isEn ? `${combinedFeedItems.length}+` : `${toBengaliNumber(combinedFeedItems.length)}+`}
            </h2>
            <p style={{ color: '#ffffff', fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>
              {isEn ? 'New Jobs Available' : 'টি নতুন নিয়োগ বিজ্ঞপ্তি'}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', marginBottom: '16px', fontWeight: 500 }}>
              {isEn ? 'Find your dream job today!' : 'আজই আপনার পছন্দের চাকরিটি খুঁজুন!'}
            </p>

            <button
              onClick={() => navigate('/all-circulars')}
              style={{
                background: '#ffffff',
                color: '#1a56db',
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                border: 'none'
              }}
            >
              {isEn ? 'View All Jobs' : 'সবগুলো দেখুন'}
              <ChevronRight size={14} />
            </button>
          </div>

          <div style={{
            position: 'absolute',
            right: '-10px',
            bottom: '0px',
            width: '140px',
            height: '140px',
            zIndex: 1
          }}>
            <img src={heroImg} alt="Hero" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
        </div>

        {/* Quick Access Section - Restored Style */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1' }}></div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#1e293b' }}>
                {isEn ? 'Quick Access' : 'কুইক অ্যাক্সেস'}
              </h3>
            </div>
            <Link to="/categories" style={{ fontSize: '13px', fontWeight: 700, color: '#1a56db', display: 'flex', alignItems: 'center', gap: '2px', textDecoration: 'none' }}>
              {isEn ? 'See All' : 'সব দেখুন'}
              <ChevronRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
            {[
              { id: 'gov', name: 'Govt', nameBn: 'সরকারি', icon: '🎓', color: '#4f46e5' },
              { id: 'bank', name: 'Bank', nameBn: 'ব্যাংক', icon: '🏛️', color: '#10b981' },
              { id: 'ngo', name: 'NGO', nameBn: 'এনজিও', icon: '💼', color: '#f59e0b' },
              { id: 'it', name: 'IT', nameBn: 'আইটি', icon: '💻', color: '#8b5cf6' },
              { id: 'others', name: 'Others', nameBn: 'অন্যান্য', icon: '🍱', color: '#06b6d4' }
            ].map(cat => (
              <div key={cat.id} onClick={() => navigate(`/categories?id=${cat.id}`)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <div style={{ width: '100%', aspectRatio: '1/1', background: '#ffffff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: '18px' }}>
                    {cat.icon}
                  </div>
                </div>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748b' }}>{isEn ? cat.name : cat.nameBn}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Feed Section - Restored Titles */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1a56db' }}></div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#1e293b' }}>
                {isEn ? 'Latest Circulars' : 'সাম্প্রতিক বিজ্ঞপ্তি'}
              </h3>
            </div>
            <Link to="/all-circulars" style={{ fontSize: '13px', fontWeight: 700, color: '#1a56db', textDecoration: 'none' }}>
              {isEn ? 'See All' : 'সব দেখুন'}
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {paginatedFeed.map(item => {
              if (item.feedType === 'job') {
                return <JobCard key={item.id} job={item} />;
              }

              const displayIcon = item.icon || orgIconsMap[item.organization] || '🏛️';
              const orgName = isEn ? (item.organizationEn || item.organization) : item.organization;
              const postTitle = isEn ? (item.postTitleEn || item.postTitle) : item.postTitle;

              const isExam = item.feedType === 'exam_date';
              const accentColor = isExam ? '#10b981' : '#7c3aed';
              const bgColor = isExam ? '#f0fdf4' : '#f5f3ff';

              return (
                <div
                  key={item.id}
                  className="job-card"
                  onClick={() => navigate(isExam ? `/exam-details/${item.originalId || item.id}` : `/result-details/${item.originalId || item.id}`)}
                  style={{
                    cursor: 'pointer',
                    background: '#ffffff',
                    borderRadius: '18px',
                    padding: '14px',
                    border: '1px solid #f1f5f9',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center'
                  }}
                >
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px',
                    background: bgColor, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '20px'
                  }}>
                    {displayIcon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '2px' }}>{orgName}</h4>
                    <p style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 500 }}>
                      {isEn ? `${isExam ? 'Exam date' : 'Result'} published for ${postTitle}` : `${postTitle} পদের ${isExam ? 'পরীক্ষার তারিখ' : 'ফলাফল'} প্রকাশিত`}
                    </p>
                    <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '9px', color: accentColor, background: bgColor, padding: '2px 8px', borderRadius: '4px', fontWeight: 700, border: `1px solid ${accentColor}20` }}>
                        {isExam ? (isEn ? 'EXAM DATE' : 'পরীক্ষার তারিখ') : (isEn ? 'RESULT' : 'ফলাফল')}
                      </span>
                      <span style={{ fontSize: '10.5px', color: '#94a3b8' }}>• {formatTimeAgo(item.createdAt, isEn)}</span>
                    </div>
                  </div>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f8faff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: accentColor }}>
                    {isExam ? <Download size={16} /> : <FileText size={16} />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Compact Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
              <button
                disabled={currentPage === 1}
                onClick={() => { setCurrentPage(prev => prev - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ffffff', color: '#1a56db', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #f1f5f9', opacity: currentPage === 1 ? 0.5 : 1 }}
              >
                ◀
              </button>
              <div style={{ height: '36px', padding: '0 12px', borderRadius: '10px', background: '#ffffff', color: '#1e293b', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #f1f5f9', fontSize: '12px' }}>
                {isEn ? `Page ${currentPage} / ${totalPages}` : `পৃষ্ঠা ${toBengaliNumber(currentPage)} / ${toBengaliNumber(totalPages)}`}
              </div>
              <button
                disabled={currentPage === totalPages}
                onClick={() => { setCurrentPage(prev => prev + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ffffff', color: '#1a56db', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #f1f5f9', opacity: currentPage === totalPages ? 0.5 : 1 }}
              >
                ▶
              </button>
            </div>
          )}
        </div>

        <div style={{ marginTop: '24px' }}>
          <Disclaimer />
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
