import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, Search, LayoutGrid } from '../components/Icons';
import { useAppContext } from '../context/AppContext';
import BottomNav from '../components/BottomNav';
import AppHeader from '../components/AppHeader';
import JobCard from '../components/JobCard';
import SearchBar from '../components/SearchBar';
import { HomeSkeleton } from '../components/SkeletonLoader';
import { jobs } from '../data/jobs';
import { categories } from '../data/categories';
import Disclaimer from '../components/Disclaimer';

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

  if (loading) {
    return (
      <div className="page">
        <HomeSkeleton />
        <BottomNav />
      </div>
    );
  }

  const displayCategories = categories.slice(0, 3);
  const latestJobs = localJobs.slice(0, 20);

  return (
    <div className="page">
      <div className="page-content">
        {/* BBC News Inspired Polished Top App Header */}
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
                  ? (12450 + (localJobs.length - jobs.length)).toLocaleString() 
                  : toBengaliNumber((12450 + (localJobs.length - jobs.length)).toLocaleString())}+
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className="stats-badge">{isEn ? 'This Week' : 'এই সপ্তাহে'}</span>
              <p style={{ fontSize: '15px', fontWeight: 800, marginTop: '4px' }}>
                +{isEn 
                  ? (320 + localJobs.filter(job => job.id.includes('_')).length).toLocaleString() 
                  : toBengaliNumber((320 + localJobs.filter(job => job.id.includes('_')).length).toLocaleString())}
              </p>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-lg">
          <div className="section-header">
            <h3 className="section-title">{isEn ? 'Categories' : 'ক্যাটাগরি'}</h3>
            <Link to="/categories" className="section-link">{isEn ? 'See All' : 'সব দেখুন'}</Link>
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
                <LayoutGrid size={24} color="var(--text-secondary)" />
              </div>
              <span className="category-grid-label">{isEn ? 'More' : 'আরও'}</span>
            </div>
          </div>
        </div>

        {/* Latest Jobs */}
        <div>
          <div className="section-header">
            <h3 className="section-title">{isEn ? 'Latest Job Circulars' : 'সাম্প্রতিক সার্কুলার'}</h3>
            <Link to="/all-circulars" className="section-link">{isEn ? 'See All' : 'সব দেখুন'}</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {latestJobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--space-lg)', marginBottom: 'var(--space-md)' }}>
            <button
              onClick={() => navigate('/all-circulars')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '14px 20px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, var(--primary) 0%, #1d4ed8 100%)',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(26, 86, 219, 0.25)',
                transition: 'all 0.2s ease'
              }}
            >
              <span>{state.language === 'en' ? 'See All Circulars' : 'সব সার্কুলার দেখুন'}</span>
              <span style={{ fontSize: '16px', display: 'flex', alignItems: 'center' }}>➔</span>
            </button>
          </div>
        </div>
        <Disclaimer />
      </div>
      <BottomNav />
    </div>
  );
}
