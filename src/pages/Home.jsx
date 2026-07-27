import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, Search, LayoutGrid, Download, FileText, Calendar, Filter, ChevronRight, Briefcase } from '../components/Icons';
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

        {/* Search and Filter Section - Matching Image */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <div
            onClick={() => navigate('/search')}
            style={{
              flex: 1,
              height: '54px',
              background: '#ffffff',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              padding: '0 18px',
              boxShadow: '0 8px 30px rgba(149, 157, 165, 0.08)',
              cursor: 'pointer',
              border: '1px solid rgba(0,0,0,0.01)'
            }}
          >
            <Search size={22} color="#94a3b8" />
            <span style={{ marginLeft: '14px', color: '#94a3b8', fontSize: '14px', fontWeight: 500, letterSpacing: '-0.2px' }}>
              {isEn ? 'Search jobs by title, company or keyword...' : 'টাইটেল বা কোম্পানি দিয়ে খুঁজুন...'}
            </span>
          </div>
          <button
            onClick={() => navigate('/search')}
            style={{
              width: '54px',
              height: '54px',
              background: '#ffffff',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 30px rgba(149, 157, 165, 0.08)',
              border: '1px solid rgba(0,0,0,0.01)'
            }}
          >
            <Filter size={22} color="#1a56db" />
          </button>
        </div>

        {/* Hero Card Section - Matching Image */}
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #1a56db 100%)',
          borderRadius: '28px',
          padding: '28px 24px',
          position: 'relative',
          marginBottom: '32px',
          overflow: 'hidden',
          boxShadow: '0 14px 35px rgba(26, 86, 219, 0.22)'
        }}>
          <div style={{ position: 'relative', zIndex: 2, maxWidth: '65%' }}>
            <p style={{ color: 'rgba(255,255,255,0.95)', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>
              {getGreeting(isEn)}, {userName} 👋
            </p>
            <h2 style={{ color: '#ffffff', fontSize: '38px', fontWeight: 900, marginBottom: '2px', lineHeight: 1 }}>
              {isEn ? `${combinedFeedItems.length}+` : `${toBengaliNumber(combinedFeedItems.length)}+`}
            </h2>
            <p style={{ color: '#ffffff', fontSize: '17px', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.3px' }}>
              {isEn ? 'New Jobs Available' : 'টি নতুন নিয়োগ বিজ্ঞপ্তি'}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', marginBottom: '24px', fontWeight: 500 }}>
              {isEn ? 'Find your dream job today!' : 'আজই আপনার পছন্দের চাকরিটি খুঁজুন!'}
            </p>

            <button
              onClick={() => navigate('/all-circulars')}
              style={{
                background: '#ffffff',
                color: '#1a56db',
                padding: '12px 22px',
                borderRadius: '14px',
                fontSize: '14px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {isEn ? 'View All Jobs' : 'সবগুলো দেখুন'}
              <ChevronRight size={18} />
            </button>
          </div>

          {/* 3D Illustration Image - Professional Placement */}
          <div style={{
            position: 'absolute',
            right: '-8px',
            bottom: '10px',
            width: '180px',
            height: '180px',
            zIndex: 1
          }}>
            <img
              src={heroImg}
              alt="Hero"
              style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.25))' }}
            />
          </div>

          {/* Decorative shapes for background depth */}
          <div style={{ position: 'absolute', top: '-40px', right: '15%', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', zIndex: 1 }}></div>
          <div style={{ position: 'absolute', bottom: '-20px', left: '10%', width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', zIndex: 1 }}></div>
        </div>

        {/* Quick Access Section - Matching Image */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'linear-gradient(to right, #6366f1, #8b5cf6)', boxShadow: '0 0 12px rgba(99, 102, 241, 0.4)' }}></div>
              <h3 style={{ fontSize: '19px', fontWeight: 900, color: '#1e293b', letterSpacing: '-0.4px' }}>
                {isEn ? 'Quick Access' : 'কুইক অ্যাক্সেস'}
              </h3>
            </div>
            <Link to="/categories" style={{ fontSize: '13.5px', fontWeight: 800, color: '#1a56db', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
              {isEn ? 'View All' : 'সব দেখুন'}
              <ChevronRight size={16} />
            </Link>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '12px'
          }}>
            {[
              { id: 'gov', name: 'Government', nameBn: 'সরকারি', icon: '🎓', color: '#4f46e5' },
              { id: 'bank', name: 'Bank', nameBn: 'ব্যাংক', icon: '🏛️', color: '#10b981' },
              { id: 'ngo', name: 'NGO', nameBn: 'এনজিও', icon: '💼', color: '#f59e0b' },
              { id: 'it', name: 'IT & Software', nameBn: 'আইটি', icon: '💻', color: '#8b5cf6' },
              { id: 'others', name: 'Others', nameBn: 'অন্যান্য', icon: '🍱', color: '#06b6d4' }
            ].map(cat => (
              <div
                key={cat.id}
                onClick={() => navigate(`/categories?id=${cat.id}`)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
              >
                <div style={{
                  width: '100%',
                  aspectRatio: '1/1',
                  background: '#ffffff',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 6px 20px rgba(149, 157, 165, 0.06)',
                  border: '1px solid rgba(0,0,0,0.015)'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: cat.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontSize: '20px',
                    boxShadow: `0 4px 12px ${cat.color}33`
                  }}>
                    {cat.icon}
                  </div>
                </div>
                <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#475569', textAlign: 'center', whiteSpace: 'nowrap' }}>
                  {isEn ? cat.name : cat.nameBn}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Circulars Title */}
        <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '19px', fontWeight: 900, color: '#1e293b', letterSpacing: '-0.4px' }}>
            {isEn ? 'Latest Job Circulars' : 'সাম্প্রতিক বিজ্ঞপ্তি'}
          </h3>
          <Link to="/all-circulars" style={{ fontSize: '13.5px', fontWeight: 800, color: '#1a56db', textDecoration: 'none' }}>
            {isEn ? 'See All' : 'সব দেখুন'}
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
            const badgeText = isExam
              ? (isEn ? 'EXAM DATE' : 'পরীক্ষার তারিখ')
              : (isEn ? 'RESULT' : 'ফলাফল');

            return (
              <div
                key={item.id}
                className="job-card animate-fade-in"
                onClick={() => navigate(isExam ? `/exam-details/${item.originalId || item.id}` : `/result-details/${item.originalId || item.id}`)}
                style={{
                  cursor: 'pointer',
                  position: 'relative',
                  background: '#ffffff',
                  borderRadius: '24px',
                  padding: '18px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.03)',
                  border: `1px solid ${accentColor}15`
                }}
              >
                <div style={{ display: 'flex', gap: '14px' }}>
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '16px',
                    background: bgColor, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '22px',
                    boxShadow: `0 4px 12px ${accentColor}08`
                  }}>
                    {displayIcon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '15.5px', fontWeight: 800, color: '#1e293b', marginBottom: '4px', letterSpacing: '-0.2px' }}>{orgName}</h4>
                    <p style={{ fontSize: '13.5px', color: '#475569', fontWeight: 500, lineHeight: 1.4 }}>
                      {isEn
                        ? `${isExam ? 'Exam date' : 'Result'} published for ${postTitle}`
                        : `${postTitle} পদের ${isExam ? 'পরীক্ষার তারিখ' : 'ফলাফল'} প্রকাশিত`}
                    </p>
                    <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '9px', color: accentColor, background: bgColor, padding: '3px 10px', borderRadius: '8px', fontWeight: 800, border: `1px solid ${accentColor}25` }}>
                        {badgeText}
                      </span>
                      <span style={{ fontSize: '11.5px', color: '#94a3b8', fontWeight: 600 }}>• {formatTimeAgo(item.createdAt, isEn)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination - Matching the clean aesthetic */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '36px' }}>
            <button
              disabled={currentPage === 1}
              onClick={() => {
                setCurrentPage(prev => prev - 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{
                width: '44px', height: '44px', borderRadius: '14px',
                background: currentPage === 1 ? '#f1f5f9' : '#ffffff',
                color: currentPage === 1 ? '#cbd5e1' : '#1a56db',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 6px 15px rgba(0,0,0,0.04)',
                border: '1px solid rgba(0,0,0,0.01)',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              ◀
            </button>
            <div style={{
              height: '44px', padding: '0 20px', borderRadius: '14px',
              background: '#ffffff', color: '#1e293b', fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 6px 15px rgba(0,0,0,0.04)',
              border: '1px solid rgba(0,0,0,0.01)', fontSize: '14px'
            }}>
              {isEn ? `Page ${currentPage} of ${totalPages}` : `পৃষ্ঠা ${toBengaliNumber(currentPage)} / ${toBengaliNumber(totalPages)}`}
            </div>
            <button
              disabled={currentPage === totalPages}
              onClick={() => {
                setCurrentPage(prev => prev + 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{
                width: '44px', height: '44px', borderRadius: '14px',
                background: currentPage === totalPages ? '#f1f5f9' : '#ffffff',
                color: currentPage === totalPages ? '#cbd5e1' : '#1a56db',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 6px 15px rgba(0,0,0,0.04)',
                border: '1px solid rgba(0,0,0,0.01)',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              ▶
            </button>
          </div>
        )}

        <div style={{ marginTop: '32px' }}>
          <Disclaimer />
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
